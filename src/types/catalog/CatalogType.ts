/** One category ("FORM" in the WGA catalogue), as listed in `public/json/catalog/index.json`. */
export type CatalogCategory = {
    id: string;
    label: string;
    count: number;
};

/** `public/json/catalog/index.json`, written by `scripts/build-catalog.mjs`. */
type CatalogType = {
    /** Content hash, used to cache-bust the shard files. */
    version: string;
    /** Date of the WGA export the catalog was built from. */
    updated: string | null;
    source: string;
    shardSize: number;
    total: number;
    /** Artworks with a colour palette; 0 means there's no colors.json. */
    palettes?: number;
    categories: CatalogCategory[];
};

/** One row of a shard file: `public/json/catalog/<category>/<n>.json`. */
export type CatalogRow = [
    author: string,
    title: string,
    date: string,
    path: string,
    technique: string,
    location: string,
    /** "rrggbbww" per colour, most prominent first (see scripts/lib/colors.mjs). */
    palette?: string,
];

/** A colour family of the colour filter. */
export type ColorBucket = {
    id: string;
    label: string;
    hex: string;
};

/** `public/json/catalog/colors.json`, decoded: per category and colour, one bit per row. */
export type ColorIndex = {
    buckets: ColorBucket[];
    coverage: number;
    sets: Record<string, Record<string, Uint8Array>>;
};

export default CatalogType;
