import CatalogType, { CatalogCategory, CatalogRow, ColorIndex } from "@/types/catalog/CatalogType";
import CatalogItemType, { PaletteColor } from "@/types/catalog/CatalogItemType";
import { CATALOG_URL, getImageUrl, getPageUrl } from "@/lib/utils";

/** Shards kept in memory. Older ones are dropped and come back from the HTTP cache if needed. */
const MAX_CACHED_SHARDS = 8;
/** How many times to re-roll when the pick was shown recently. */
const MAX_REROLLS = 6;

const shardCache = new Map<string, Promise<CatalogRow[]>>();

export async function fetchCatalogIndex(signal?: AbortSignal): Promise<CatalogType> {
    const response = await fetch(`${CATALOG_URL}/index.json`, { signal, cache: "no-cache" });
    if (!response.ok) throw new Error(`Catalog index: HTTP ${response.status}`);
    return response.json();
}

export async function fetchColorIndex(catalog: CatalogType, signal?: AbortSignal): Promise<ColorIndex> {
    const response = await fetch(`${CATALOG_URL}/colors.json?v=${catalog.version}`, { signal });
    if (!response.ok) throw new Error(`Colour index: HTTP ${response.status}`);
    const json: { buckets: ColorIndex["buckets"]; coverage: number; sets: Record<string, Record<string, string>> } = await response.json();

    const decode = (base64: string) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const sets: ColorIndex["sets"] = {};
    for (const [category, buckets] of Object.entries(json.sets)) {
        sets[category] = Object.fromEntries(Object.entries(buckets).map(([bucket, bits]) => [bucket, decode(bits)]));
    }
    return { buckets: json.buckets, coverage: json.coverage, sets };
}

function loadShard(catalog: CatalogType, category: string, shard: number): Promise<CatalogRow[]> {
    const key = `${category}/${shard}`;
    const cached = shardCache.get(key);

    if (cached) {
        // Refresh its position in the LRU order.
        shardCache.delete(key);
        shardCache.set(key, cached);
        return cached;
    }

    const request = fetch(`${CATALOG_URL}/${key}.json?v=${catalog.version}`).then((response) => {
        if (!response.ok) throw new Error(`Catalog shard ${key}: HTTP ${response.status}`);
        return response.json() as Promise<CatalogRow[]>;
    });
    // A failed download must not stay cached, so the next pick can retry it.
    request.catch(() => {
        if (shardCache.get(key) === request) shardCache.delete(key);
    });

    shardCache.set(key, request);
    while (shardCache.size > MAX_CACHED_SHARDS) {
        shardCache.delete(shardCache.keys().next().value!);
    }
    return request;
}

export function parsePalette(palette: string | undefined): PaletteColor[] {
    const colors: PaletteColor[] = [];
    if (!palette) return colors;
    for (let i = 0; i + 8 <= palette.length; i += 8) {
        colors.push({ hex: `#${palette.slice(i, i + 6)}`, weight: parseInt(palette.slice(i + 6, i + 8), 16) / 255 });
    }
    return colors;
}

export function toCatalogItem(category: string, row: CatalogRow, position?: number): CatalogItemType {
    const [author, title, date, path, technique, location, palette] = row;
    return {
        id: path,
        category,
        position,
        author,
        title,
        date,
        technique,
        location,
        url: getPageUrl(path),
        imageUrl: getImageUrl(path),
        palette: parsePalette(palette),
    };
}

// ---------- colour filter ----------

const POPCOUNT = Uint8Array.from({ length: 256 }, (_, i) => {
    let count = 0;
    for (let n = i; n; n >>= 1) count += n & 1;
    return count;
});

/** Rows of a category that contain every colour in `colors` (AND), as a bitset. */
export function matchColors(index: ColorIndex, category: string, colors: readonly string[]): Uint8Array | null {
    const sets = index.sets[category];
    if (!sets) return null;
    const first = sets[colors[0]];
    if (!first) return null;
    const result = first.slice();
    for (const color of colors.slice(1)) {
        const bits = sets[color];
        if (!bits) return new Uint8Array(result.length);
        for (let i = 0; i < result.length; i++) result[i] &= bits[i];
    }
    return result;
}

export function countBits(bits: Uint8Array): number {
    let count = 0;
    for (let i = 0; i < bits.length; i++) count += POPCOUNT[bits[i]];
    return count;
}

/** Position of the n-th set bit (0-based). */
function nthBit(bits: Uint8Array, n: number): number {
    for (let byte = 0; byte < bits.length; byte++) {
        const count = POPCOUNT[bits[byte]];
        if (n < count) {
            for (let bit = 0; bit < 8; bit++) {
                if (bits[byte] & (1 << bit) && n-- === 0) return byte * 8 + bit;
            }
        }
        n -= count;
    }
    return -1;
}

// ---------- random pick ----------

/** A category to pick from; `bits` narrows it down to the rows matching the colour filter. */
export type PoolEntry = { category: CatalogCategory; count: number; bits?: Uint8Array };

/**
 * Picks a category and a row position inside it.
 *  - equalMix: every category in the pool is equally likely, so small ones (e.g. Tapestry) still show up.
 *  - otherwise: every artwork in the pool is equally likely.
 */
function pickPosition(pool: PoolEntry[], equalMix: boolean): { category: CatalogCategory; position: number } {
    let entry: PoolEntry;
    let index: number;

    if (equalMix) {
        entry = pool[Math.floor(Math.random() * pool.length)];
        index = Math.floor(Math.random() * entry.count);
    } else {
        const total = pool.reduce((sum, item) => sum + item.count, 0);
        index = Math.floor(Math.random() * total);
        entry = pool[pool.length - 1];
        for (const item of pool) {
            if (index < item.count) { entry = item; break; }
            index -= item.count;
        }
        index = Math.min(index, entry.count - 1);
    }

    return { category: entry.category, position: entry.bits ? nthBit(entry.bits, index) : index };
}

/**
 * Picks a random artwork from the pool. Only the shard that holds the pick is downloaded.
 * Artworks in `exclude` (e.g. the history) are avoided when possible.
 */
export async function pickRandomItem(
    catalog: CatalogType,
    pool: PoolEntry[],
    equalMix: boolean,
    exclude: ReadonlySet<string> = new Set(),
): Promise<CatalogItemType> {
    const entries = pool.filter((entry) => entry.count > 0);
    if (entries.length === 0) throw new Error("No artwork matches the filters");

    let item: CatalogItemType | undefined;

    for (let attempt = 0; attempt < MAX_REROLLS; attempt++) {
        const { category, position } = pickPosition(entries, equalMix);
        const rows = await loadShard(catalog, category.id, Math.floor(position / catalog.shardSize));
        const row = rows[position % catalog.shardSize];
        if (!row) throw new Error(`Catalog shard for "${category.id}" does not match the index`);

        item = toCatalogItem(category.id, row, position);
        if (!exclude.has(item.id)) break;
    }

    return item!;
}
