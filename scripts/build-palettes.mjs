#!/usr/bin/env node
/**
 * Adds a colour palette to every artwork of the catalogue and builds colors.json for the colour filter.
 *
 *   node scripts/build-palettes.mjs                    # every artwork that has no palette yet
 *   node scripts/build-palettes.mjs --limit 300        # just a few, to try it out
 *   node scripts/build-palettes.mjs --category tapestry,mosaic
 *   node scripts/build-palettes.mjs --shuffle --limit 2000   # random order: a partial run covers every category
 *   node scripts/build-palettes.mjs --slow             # gentler on wga.hu: 3 requests/s, 2 at a time
 *   node scripts/build-palettes.mjs --rate 5 --concurrency 2   # or pick the speed yourself
 *   node scripts/build-palettes.mjs --retry-failed     # try the ones that failed last time again
 *   node scripts/build-palettes.mjs --apply            # no downloads: rewrite the catalogue from the cache
 *
 * wga.hu doesn't allow reading its images from the browser (no CORS), so palettes are computed here:
 * each artwork's small thumbnail (~10 KB, /detail_s/) is downloaded once, rate-limited to stay polite.
 * If wga.hu answers "too many requests" (429/503), the speed is halved for the rest of the run.
 * Progress is kept in .cache/palettes.json: stop any time with Ctrl+C and run again to continue.
 */

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import jpeg from "jpeg-js";
import { readCatalog, ROOT, writeCatalog } from "./lib/catalog-files.mjs";
import { encodePalette, extractPalette, isPalette } from "./lib/colors.mjs";

const BASE_URL = "https://www.wga.hu/";
/** Smallest first; bigger versions are only tried when a smaller one is missing. */
const SIZES = ["detail_s", "detail", "art"];
const CACHE_FILE = join(ROOT, ".cache", "palettes.json");
const USER_AGENT = "Mozilla/5.0 (compatible; palette-builder/1.0)";
const SAVE_EVERY = 250;

const args = process.argv.slice(2);
const option = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const flag = (name) => args.includes(`--${name}`);

const SLOW = flag("slow");
const LIMIT = Number(option("limit", Infinity));
/** Requests per second, all workers together. Lowered automatically when wga.hu pushes back. */
let rate = Number(option("rate", SLOW ? 3 : 10));
const CONCURRENCY = Number(option("concurrency", SLOW ? 2 : 4));
const MIN_RATE = 0.5;
const ONLY = option("category", "")?.split(",").filter(Boolean) ?? [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Spaces requests out to at most `rate` per second. */
let nextSlot = 0;
async function throttle() {
    const now = Date.now();
    const wait = Math.max(0, nextSlot - now);
    nextSlot = Math.max(now, nextSlot) + 1000 / rate;
    if (wait) await sleep(wait);
}

/** The server is struggling or rate-limiting us: halve the speed for the rest of the run. */
let lastSlowdown = 0;
function slowDown(status) {
    // Several workers hit the same limit at once; count that as one signal.
    if (Date.now() - lastSlowdown < 10_000 || rate <= MIN_RATE) return;
    lastSlowdown = Date.now();
    rate = Math.max(MIN_RATE, rate / 2);
    console.log(`  wga.hu answered HTTP ${status}: slowing down to ${rate} requests/s`);
}

class Blocked extends Error {}

/** Downloads and decodes one image; null when it doesn't exist. Retries transient errors. */
async function fetchImage(url) {
    for (let attempt = 0; attempt < 6; attempt++) {
        await throttle();
        let response;
        try {
            response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(30_000) });
        } catch {
            await sleep(2 ** attempt * 1000);
            continue;
        }
        if (response.status === 404 || response.status === 410) return null;
        if (response.status === 403) throw new Blocked(`HTTP 403 for ${url}: blocked, stopping to stay polite`);
        if (response.status === 429 || response.status >= 500) {
            if (response.status === 429 || response.status === 503) slowDown(response.status);
            const retryAfter = Number(response.headers.get("retry-after")) * 1000;
            await sleep(Math.min(60_000, retryAfter || 2 ** attempt * 2000));
            continue;
        }
        // A missing image can come back as an HTML page with status 200.
        if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) return null;
        const bytes = Buffer.from(await response.arrayBuffer());
        try {
            return jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true, maxMemoryUsageInMB: 512 });
        } catch {
            return null;
        }
    }
    throw new Error(`Giving up on ${url}`);
}

async function computePalette(path) {
    for (const size of SIZES) {
        const image = await fetchImage(`${BASE_URL}${size}/${path}.jpg`);
        if (image) return encodePalette(extractPalette(image.data, image.width, image.height));
    }
    return "!missing";
}

async function loadCache() {
    try {
        return new Map(Object.entries(JSON.parse(await readFile(CACHE_FILE, "utf8"))));
    } catch {
        return new Map();
    }
}

async function saveCache(cache) {
    await mkdir(join(ROOT, ".cache"), { recursive: true });
    await writeFile(`${CACHE_FILE}.tmp`, JSON.stringify(Object.fromEntries(cache)));
    await rename(`${CACHE_FILE}.tmp`, CACHE_FILE);
}

async function apply(catalog, cache) {
    const categories = catalog.categories.map(({ id, label, rows }) => ({
        id,
        label,
        rows: rows.map((row) => {
            const palette = cache.get(row[3]);
            const base = row.slice(0, 6);
            return isPalette(palette) ? [...base, palette] : base;
        }),
    }));
    const index = await writeCatalog(categories, catalog.index);
    console.log(`Catalogue written: ${index.palettes} of ${index.total} artworks have a palette (version ${index.version}).`);
}

async function main() {
    const catalog = await readCatalog();
    if (!catalog) throw new Error("No catalogue yet: run `pnpm catalog` first.");

    const cache = await loadCache();
    // Palettes already in the catalogue count as done.
    for (const { rows } of catalog.categories) {
        for (const row of rows) if (isPalette(row[6]) && !cache.has(row[3])) cache.set(row[3], row[6]);
    }

    if (flag("apply")) return apply(catalog, cache);

    const todo = catalog.categories
        .filter(({ id }) => !ONLY.length || ONLY.includes(id))
        .flatMap(({ rows }) => rows.map((row) => row[3]))
        .filter((path) => {
            const cached = cache.get(path);
            return cached === undefined || (flag("retry-failed") && cached.startsWith("!"));
        })
        .slice(0, flag("shuffle") ? Infinity : LIMIT);
    if (flag("shuffle")) {
        for (let i = todo.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [todo[i], todo[j]] = [todo[j], todo[i]];
        }
        todo.length = Math.min(todo.length, LIMIT);
    }

    console.log(`${cache.size} palettes cached, ${todo.length} to compute at ≤${rate} requests/s, ${CONCURRENCY} at a time (~${Math.ceil(todo.length / rate / 60)} min).`);

    let stopping = false;
    let blocked = null;
    process.on("SIGINT", () => {
        if (stopping) process.exit(130);
        stopping = true;
        console.log("\nStopping after the current downloads… (Ctrl+C again to quit at once)");
    });

    let done = 0;
    let failed = 0;
    const started = Date.now();
    let cursor = 0;

    const worker = async () => {
        while (!stopping && cursor < todo.length) {
            const path = todo[cursor++];
            try {
                const palette = await computePalette(path);
                cache.set(path, palette);
                if (!isPalette(palette)) failed++;
            } catch (error) {
                if (error instanceof Blocked) { blocked = error; stopping = true; return; }
                cache.set(path, "!error");
                failed++;
            }
            done++;
            if (done % SAVE_EVERY === 0) {
                await saveCache(cache);
                const perSecond = done / ((Date.now() - started) / 1000);
                const eta = Math.round((todo.length - done) / perSecond / 60);
                console.log(`  ${done}/${todo.length}  (${failed} failed, ${perSecond.toFixed(1)}/s, ~${eta} min left)`);
            }
        }
    };

    await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, worker));
    await saveCache(cache);
    console.log(`Done: ${done} processed, ${failed} without a usable image.`);
    if (blocked) console.error(blocked.message);

    await apply(catalog, cache);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
