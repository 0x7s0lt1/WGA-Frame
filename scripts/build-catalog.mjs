#!/usr/bin/env node
/**
 * Builds the sharded catalog the frame reads from `public/json/catalog/`.
 *
 *   node scripts/build-catalog.mjs              # download the latest catalogue from wga.hu
 *   node scripts/build-catalog.mjs ./data.zip   # use a local data_txt.zip (or extracted catalog.txt)
 *
 * Output:
 *   public/json/catalog/index.json             categories, counts, shard size, version
 *   public/json/catalog/<category>/<n>.json    rows: [author, title, date, path, technique, location, palette?]
 *   public/json/catalog/colors.json            colour filter index (see scripts/lib/colors.mjs)
 *
 * Colour palettes come from `pnpm palettes` (scripts/build-palettes.mjs); a rebuild keeps the
 * palettes of artworks that are still in the catalogue.
 *
 * `path` is the artwork URL without "https://www.wga.hu/html/" and ".html", so
 *   page  = https://www.wga.hu/html/<path>.html
 *   image = https://www.wga.hu/art/<path>.jpg
 *
 * Shards keep the first download small: picking a random artwork only needs the
 * one shard that contains it, never the whole 50k-row catalogue.
 */

import { readFile } from "node:fs/promises";
import { inflateRawSync } from "node:zlib";
import { readCatalog, writeCatalog } from "./lib/catalog-files.mjs";
import { isPalette } from "./lib/colors.mjs";

const SOURCE_URL = "https://www.wga.hu/database/download/data_txt.zip";
const PAGE_PREFIX = "https://www.wga.hu/html/";
const PAGE_SUFFIX = ".html";

/** Display order and labels. Anything not listed is appended alphabetically. */
const CATEGORIES = [
    ["painting", "Painting"],
    ["sculpture", "Sculpture"],
    ["architecture", "Architecture"],
    ["graphics", "Graphics"],
    ["illumination", "Illumination"],
    ["ceramics", "Ceramics"],
    ["furniture", "Furniture"],
    ["glassware", "Glassware"],
    ["metalwork", "Metalwork"],
    ["mosaic", "Mosaic"],
    ["stained-glass", "Stained glass"],
    ["tapestry", "Tapestry"],
    ["others", "Others"],
];

const FORM_ALIASES = { stained_glass: "stained-glass" };

async function loadSource(arg) {
    if (!arg) {
        console.log(`Downloading ${SOURCE_URL}`);
        const response = await fetch(SOURCE_URL);
        if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
        return extractCatalog(Buffer.from(await response.arrayBuffer()));
    }
    const buffer = await readFile(arg);
    return arg.toLowerCase().endsWith(".zip")
        ? extractCatalog(buffer)
        : { bytes: buffer, modified: null };
}

/** Minimal zip reader: finds the .txt entry via the central directory and inflates it. */
function extractCatalog(zip) {
    const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    if (eocd < 0) throw new Error("Not a zip file");

    const entries = zip.readUInt16LE(eocd + 10);
    let offset = zip.readUInt32LE(eocd + 16);

    for (let i = 0; i < entries; i++) {
        if (zip.readUInt32LE(offset) !== 0x02014b50) throw new Error("Corrupt zip directory");
        const method = zip.readUInt16LE(offset + 10);
        const dosTime = zip.readUInt16LE(offset + 12);
        const dosDate = zip.readUInt16LE(offset + 14);
        const compressedSize = zip.readUInt32LE(offset + 20);
        const nameLength = zip.readUInt16LE(offset + 28);
        const extraLength = zip.readUInt16LE(offset + 30);
        const commentLength = zip.readUInt16LE(offset + 32);
        const localHeader = zip.readUInt32LE(offset + 42);
        const name = zip.toString("latin1", offset + 46, offset + 46 + nameLength);
        offset += 46 + nameLength + extraLength + commentLength;

        if (!name.toLowerCase().endsWith(".txt")) continue;

        const dataStart = localHeader + 30
            + zip.readUInt16LE(localHeader + 26)
            + zip.readUInt16LE(localHeader + 28);
        const data = zip.subarray(dataStart, dataStart + compressedSize);
        const bytes = method === 0 ? data : method === 8 ? inflateRawSync(data) : null;
        if (!bytes) throw new Error(`Unsupported zip compression method ${method}`);

        const modified = new Date(Date.UTC(
            (dosDate >> 9) + 1980, ((dosDate >> 5) & 15) - 1, dosDate & 31,
            dosTime >> 11, (dosTime >> 5) & 63,
        ));
        return { bytes, modified };
    }
    throw new Error("No .txt catalogue inside the zip");
}

/** Tab-separated values with optional "quoted" fields ("" escapes a quote). */
function parseTsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quoted) {
            if (c === '"') {
                if (text[i + 1] === '"') { field += '"'; i++; }
                else quoted = false;
            } else field += c;
        } else if (c === '"' && field === "") quoted = true;
        else if (c === "\t") { row.push(field); field = ""; }
        else if (c === "\n" || c === "\r") {
            if (c === "\r" && text[i + 1] === "\n") i++;
            row.push(field); field = "";
            if (row.some(Boolean)) rows.push(row);
            row = [];
        } else field += c;
    }
    row.push(field);
    if (row.some(Boolean)) rows.push(row);
    return rows;
}

const clean = (value) => (value ?? "").replace(/\s+/g, " ").trim();

async function main() {
    const { bytes, modified } = await loadSource(process.argv[2]);

    // The WGA export is Windows-1252 (curly quotes, dashes, accented names).
    const text = new TextDecoder("windows-1252").decode(bytes);
    const [header, ...records] = parseTsv(text);
    const column = Object.fromEntries(header.map((name, i) => [clean(name), i]));
    for (const required of ["AUTHOR", "TITLE", "DATE", "TECHNIQUE", "LOCATION", "URL", "FORM"]) {
        if (!(required in column)) throw new Error(`Missing column ${required}`);
    }

    const byCategory = new Map();
    const seen = new Set();
    let skipped = 0;

    for (const record of records) {
        const get = (name) => clean(record[column[name]]);
        const url = get("URL");
        if (!url.startsWith(PAGE_PREFIX) || !url.endsWith(PAGE_SUFFIX)) { skipped++; continue; }

        const path = url.slice(PAGE_PREFIX.length, -PAGE_SUFFIX.length);
        if (seen.has(path)) { skipped++; continue; }
        seen.add(path);

        const form = get("FORM").toLowerCase();
        const category = FORM_ALIASES[form] ?? (form || "others");
        const date = get("DATE");

        if (!byCategory.has(category)) byCategory.set(category, []);
        byCategory.get(category).push([
            get("AUTHOR"),
            get("TITLE"),
            date === "-" ? "" : date,
            path,
            get("TECHNIQUE"),
            get("LOCATION"),
        ]);
    }

    const known = new Map(CATEGORIES);
    const ids = [
        ...CATEGORIES.map(([id]) => id).filter((id) => byCategory.has(id)),
        ...[...byCategory.keys()].filter((id) => !known.has(id)).sort(),
    ];

    // Keep palettes already computed for artworks that are still in the catalogue.
    const previous = await readCatalog();
    const palettes = new Map();
    for (const { rows } of previous?.categories ?? []) {
        for (const row of rows) if (isPalette(row[6])) palettes.set(row[3], row[6]);
    }

    const categories = ids.map((id) => {
        const rows = byCategory.get(id).map((row) => (palettes.has(row[3]) ? [...row, palettes.get(row[3])] : row));
        const label = known.get(id) ?? id.charAt(0).toUpperCase() + id.slice(1).replace(/[-_]/g, " ");
        return { id, label, rows };
    });

    const index = await writeCatalog(categories, {
        updated: modified ? modified.toISOString().slice(0, 10) : null,
        source: SOURCE_URL,
    });

    console.log(`Wrote ${index.total} artworks in ${categories.length} categories (${skipped} skipped, ${index.palettes} with palettes)`);
    for (const { id, count } of index.categories) console.log(`  ${id.padEnd(14)} ${count}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
