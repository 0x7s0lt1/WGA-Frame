/**
 * Reading and writing the sharded catalogue in public/json/catalog/ (shared by the scripts).
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildColorIndex } from "./colors.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const CATALOG_DIR = join(ROOT, "public", "json", "catalog");
export const SHARD_SIZE = 1000;

/** The current catalogue, or null when there is none yet. */
export async function readCatalog(dir = CATALOG_DIR) {
    let index;
    try {
        index = JSON.parse(await readFile(join(dir, "index.json"), "utf8"));
    } catch {
        return null;
    }
    const categories = [];
    for (const { id, label, count } of index.categories) {
        const rows = [];
        for (let shard = 0; shard * index.shardSize < count; shard++) {
            rows.push(...JSON.parse(await readFile(join(dir, id, `${shard}.json`), "utf8")));
        }
        categories.push({ id, label, rows });
    }
    return { index, categories };
}

/**
 * Writes shards, colors.json and index.json. Written to a temporary folder first and swapped in,
 * so an interrupted run never leaves a half-written catalogue behind.
 *
 * categories: [{ id, label, rows }], rows: [author, title, date, path, technique, location, palette?]
 */
export async function writeCatalog(categories, { updated, source }, dir = CATALOG_DIR) {
    const temp = `${dir}.tmp`;
    await rm(temp, { recursive: true, force: true });

    const hash = createHash("sha1");
    let total = 0;

    for (const { id, rows } of categories) {
        await mkdir(join(temp, id), { recursive: true });
        for (let shard = 0; shard * SHARD_SIZE < rows.length; shard++) {
            const json = JSON.stringify(rows.slice(shard * SHARD_SIZE, (shard + 1) * SHARD_SIZE));
            hash.update(id).update(json);
            await writeFile(join(temp, id, `${shard}.json`), json);
        }
        total += rows.length;
    }

    const colors = buildColorIndex(categories);
    if (colors) {
        const json = JSON.stringify(colors);
        hash.update(json);
        await writeFile(join(temp, "colors.json"), json);
    }

    const index = {
        version: hash.digest("hex").slice(0, 10),
        updated,
        source,
        shardSize: SHARD_SIZE,
        total,
        /** Artworks that have a colour palette (and so take part in the colour filter). */
        palettes: colors?.coverage ?? 0,
        categories: categories.map(({ id, label, rows }) => ({ id, label, count: rows.length })),
    };
    await writeFile(join(temp, "index.json"), JSON.stringify(index, null, 2) + "\n");

    await rm(dir, { recursive: true, force: true });
    await rename(temp, dir);
    return index;
}
