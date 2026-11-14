export const BASE_URL = "https://www.wga.hu/";
export const LOADING_IMG = "/img/loading.svg";
export const LOADING_WHITE_IMG = "/img/loading-white.svg";
export const ERROR_IMG = "/img/error.webp";
export const CATALOG_URL = "/json/catalog";

/** The page and the full-size image of an artwork share the same path on wga.hu. */
export const getPageUrl = (path: string): string => `${BASE_URL}html/${path}.html`;
export const getImageUrl = (path: string): string => `${BASE_URL}art/${path}.jpg`;

/**
 * Resolves with the natural size once the image is downloaded and decoded,
 * so it can be swapped in without flicker.
 */
export const preloadImage = (src: string): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
            const size = { width: image.naturalWidth, height: image.naturalHeight };
            // decode() keeps the main thread free on large paintings; onload is enough if it fails.
            image.decode().catch(() => undefined).then(() => resolve(size));
        };
        image.onerror = () => reject(new Error(`Image failed to load: ${src}`));
        image.src = src;
    });

export const formatNumber = (value: number): string => value.toLocaleString("en-US");

/** "3 min", "5 h 20 min", "6 days 4 h" */
export function formatDuration(ms: number): string {
    const minutes = Math.max(0, Math.round(ms / 60_000));
    if (minutes < 1) return "less than a minute";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return minutes % 60 ? `${hours} h ${minutes % 60} min` : `${hours} h`;
    const days = Math.floor(hours / 24);
    const label = `${days} day${days === 1 ? "" : "s"}`;
    return hours % 24 ? `${label} ${hours % 24} h` : label;
}

/**
 * Copies text to the clipboard. The Clipboard API needs a secure context (https/localhost);
 * the fallback covers plain-http addresses like a phone testing on the local network.
 */
export async function copyText(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // fall back below
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
        return document.execCommand("copy");
    } catch {
        return false;
    } finally {
        area.remove();
    }
}
