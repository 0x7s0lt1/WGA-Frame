/**
 * Colour palettes and colour families, shared by the catalogue scripts.
 *
 * Palette string, stored as the 7th field of a catalogue row:
 *   "rrggbbww" repeated, most prominent colour first; ww = share of the image (00–ff).
 */

/** Colour families offered by the colour filter, with the swatch shown for each. */
export const COLOR_BUCKETS = [
    { id: "red", label: "Red", hex: "#b3261e" },
    { id: "orange", label: "Orange", hex: "#d9792b" },
    { id: "yellow", label: "Yellow", hex: "#e2bd3f" },
    { id: "green", label: "Green", hex: "#4d7c3a" },
    { id: "teal", label: "Teal", hex: "#2c8a84" },
    { id: "blue", label: "Blue", hex: "#2f5ea8" },
    { id: "purple", label: "Purple", hex: "#6c3d8e" },
    { id: "pink", label: "Pink", hex: "#d68aa6" },
    { id: "brown", label: "Brown", hex: "#7a4e2d" },
    { id: "beige", label: "Beige", hex: "#d8c39e" },
    { id: "white", label: "White", hex: "#f1eee6" },
    { id: "gray", label: "Gray", hex: "#8c8c8c" },
    { id: "black", label: "Black", hex: "#1b1b1b" },
];

/**
 * Minimum share of the image for an artwork to count as "containing" a colour.
 * Neutrals (and brown) are everywhere in old paintings, so they need much more.
 */
const MIN_SHARE = {
    red: 0.06, orange: 0.12, yellow: 0.06, green: 0.06, teal: 0.05, blue: 0.05, purple: 0.04, pink: 0.05,
    brown: 0.3, beige: 0.25, white: 0.25, gray: 0.3, black: 0.35,
};

/** Names an sRGB colour (0–255 channels) by hue, saturation and brightness. */
export function classify(r, g, b) {
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const v = max;
    const delta = max - min;
    const s = max === 0 ? 0 : delta / max;

    if (v < 0.2) return "black";
    if (s < 0.14 || delta < 0.06) {
        if (v > 0.86) return "white";
        if (v < 0.32) return "black";
        return "gray";
    }

    let h;
    const R = r / 255, G = g / 255, B = b / 255;
    if (max === R) h = 60 * (((G - B) / delta) % 6);
    else if (max === G) h = 60 * ((B - R) / delta + 2);
    else h = 60 * ((R - G) / delta + 4);
    if (h < 0) h += 360;

    // Reds; dark, dull ones read as brown.
    if (h < 12 || h >= 345) {
        if (v > 0.7 && s < 0.45) return "pink";
        if (v < 0.45 && s < 0.6) return "brown";
        return "red";
    }
    // Orange family: the earth colours of old paintings (and skin) live here.
    if (h < 45) {
        if (v < 0.6 || (s > 0.45 && v < 0.68)) return "brown";
        if (s < 0.38 && v >= 0.68) return "beige";
        return "orange";
    }
    // Yellows and ochres; dark ones are brown.
    if (h < 62) {
        if (v < 0.5) return "brown";
        if (s < 0.38 && v >= 0.68) return "beige";
        return "yellow";
    }
    // Greens, including the dark olive greens of landscapes; very pale tints read as grey.
    if (h < 165) {
        if (v < 0.25) return "black";
        if (s < 0.2 && v > 0.5) return "gray";
        return "green";
    }
    if (h < 200) return "teal";
    if (h < 255) return "blue";
    if (h < 300) return "purple";
    return v > 0.65 && s < 0.6 ? "pink" : "purple";
}

// ---------- palette extraction ----------

const toLinear = (c) => {
    const x = c / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
};
const LINEAR = Float64Array.from({ length: 256 }, (_, i) => toLinear(i));
const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);

/** sRGB → CIELAB (D65): distances there roughly match how different colours look. */
export function rgbToLab(r, g, b) {
    const R = LINEAR[r], G = LINEAR[g], B = LINEAR[b];
    const x = f((0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047);
    const y = f(0.2126 * R + 0.7152 * G + 0.0722 * B);
    const z = f((0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883);
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/** Small deterministic PRNG, so the same image always gives the same palette. */
function mulberry32(seed) {
    return () => {
        seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Dominant colours of an RGBA image: k-means in Lab space, near-identical clusters merged,
 * tiny ones dropped. Returns [{ r, g, b, weight }] sorted by weight (weights sum to ~1).
 */
export function extractPalette(data, width, height, { k = 8, samples = 6000, maxColors = 8 } = {}) {
    const total = width * height;
    const step = Math.max(1, Math.floor(total / samples));
    const n = Math.ceil(total / step);
    const lab = new Float32Array(n * 3);
    const rgb = new Uint8Array(n * 3);

    let count = 0;
    for (let i = 0; i < total; i += step) {
        const o = i * 4;
        const [L, A, B] = rgbToLab(data[o], data[o + 1], data[o + 2]);
        lab[count * 3] = L; lab[count * 3 + 1] = A; lab[count * 3 + 2] = B;
        rgb[count * 3] = data[o]; rgb[count * 3 + 1] = data[o + 1]; rgb[count * 3 + 2] = data[o + 2];
        count++;
    }

    const dist = (i, c, centers) => {
        const dL = lab[i * 3] - centers[c * 3], dA = lab[i * 3 + 1] - centers[c * 3 + 1], dB = lab[i * 3 + 2] - centers[c * 3 + 2];
        return dL * dL + dA * dA + dB * dB;
    };

    // k-means++ seeding
    const random = mulberry32(count * 2654435761);
    const centers = new Float32Array(k * 3);
    const nearest = new Float32Array(count).fill(Infinity);
    let chosen = Math.floor(random() * count);
    for (let c = 0; c < k; c++) {
        centers.set(lab.subarray(chosen * 3, chosen * 3 + 3), c * 3);
        let sum = 0;
        for (let i = 0; i < count; i++) {
            nearest[i] = Math.min(nearest[i], dist(i, c, centers));
            sum += nearest[i];
        }
        if (sum === 0) break;
        let target = random() * sum;
        for (chosen = 0; chosen < count - 1 && (target -= nearest[chosen]) > 0; chosen++);
    }

    // Lloyd iterations
    const assignment = new Int32Array(count).fill(-1);
    for (let iteration = 0; iteration < 16; iteration++) {
        let changed = 0;
        for (let i = 0; i < count; i++) {
            let best = 0, bestDistance = Infinity;
            for (let c = 0; c < k; c++) {
                const d = dist(i, c, centers);
                if (d < bestDistance) { bestDistance = d; best = c; }
            }
            if (assignment[i] !== best) { assignment[i] = best; changed++; }
        }
        const sums = new Float64Array(k * 4);
        for (let i = 0; i < count; i++) {
            const c = assignment[i];
            sums[c * 4] += lab[i * 3]; sums[c * 4 + 1] += lab[i * 3 + 1]; sums[c * 4 + 2] += lab[i * 3 + 2]; sums[c * 4 + 3]++;
        }
        for (let c = 0; c < k; c++) {
            if (sums[c * 4 + 3] > 0) {
                for (let j = 0; j < 3; j++) centers[c * 3 + j] = sums[c * 4 + j] / sums[c * 4 + 3];
            }
        }
        if (changed === 0) break;
    }

    // Clusters, with the mean sRGB of their pixels as the displayed colour.
    let clusters = Array.from({ length: k }, () => ({ L: 0, A: 0, B: 0, r: 0, g: 0, b: 0, n: 0 }));
    for (let i = 0; i < count; i++) {
        const cl = clusters[assignment[i]];
        cl.L += lab[i * 3]; cl.A += lab[i * 3 + 1]; cl.B += lab[i * 3 + 2];
        cl.r += rgb[i * 3]; cl.g += rgb[i * 3 + 1]; cl.b += rgb[i * 3 + 2]; cl.n++;
    }
    clusters = clusters.filter((cl) => cl.n > 0);

    // Merge clusters that look the same (ΔE < 10), largest first.
    clusters.sort((x, y) => y.n - x.n);
    const merged = [];
    for (const cl of clusters) {
        const target = merged.find((m) => {
            const dL = m.L / m.n - cl.L / cl.n, dA = m.A / m.n - cl.A / cl.n, dB = m.B / m.n - cl.B / cl.n;
            return dL * dL + dA * dA + dB * dB < 100;
        });
        if (target) for (const key of ["L", "A", "B", "r", "g", "b", "n"]) target[key] += cl[key];
        else merged.push({ ...cl });
    }

    return merged
        .map((cl) => ({ r: Math.round(cl.r / cl.n), g: Math.round(cl.g / cl.n), b: Math.round(cl.b / cl.n), weight: cl.n / count }))
        .filter((color) => color.weight >= 0.02)
        .sort((x, y) => y.weight - x.weight)
        .slice(0, maxColors);
}

// ---------- encoding ----------

const hex2 = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");

export function encodePalette(colors) {
    return colors.map(({ r, g, b, weight }) => hex2(r) + hex2(g) + hex2(b) + hex2(weight * 255)).join("");
}

export function decodePalette(palette) {
    const colors = [];
    for (let i = 0; i + 8 <= palette.length; i += 8) {
        colors.push({
            r: parseInt(palette.slice(i, i + 2), 16),
            g: parseInt(palette.slice(i + 2, i + 4), 16),
            b: parseInt(palette.slice(i + 4, i + 6), 16),
            weight: parseInt(palette.slice(i + 6, i + 8), 16) / 255,
        });
    }
    return colors;
}

export const isPalette = (value) => typeof value === "string" && value.length >= 8 && /^([0-9a-f]{8})+$/.test(value);

/** Colour families present in a palette, by share of the image. */
export function paletteBuckets(palette) {
    const shares = {};
    for (const { r, g, b, weight } of decodePalette(palette)) {
        const bucket = classify(r, g, b);
        shares[bucket] = (shares[bucket] ?? 0) + weight;
    }
    return Object.keys(shares).filter((bucket) => shares[bucket] >= MIN_SHARE[bucket]);
}

/**
 * colors.json: for each category and colour family, a bitset (base64) with bit i set when
 * row i of that category contains the colour. Bit order: LSB first within each byte.
 */
export function buildColorIndex(categories) {
    let coverage = 0;
    const sets = {};

    for (const { id, rows } of categories) {
        const bits = Object.fromEntries(COLOR_BUCKETS.map((bucket) => [bucket.id, new Uint8Array(Math.ceil(rows.length / 8))]));
        rows.forEach((row, i) => {
            if (!isPalette(row[6])) return;
            coverage++;
            for (const bucket of paletteBuckets(row[6])) bits[bucket][i >> 3] |= 1 << (i & 7);
        });
        sets[id] = Object.fromEntries(Object.entries(bits).map(([bucket, array]) => [bucket, Buffer.from(array).toString("base64")]));
    }

    return coverage ? { buckets: COLOR_BUCKETS, coverage, sets } : null;
}
