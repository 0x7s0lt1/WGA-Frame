"use client";
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import CatalogType, { CatalogCategory, ColorBucket, ColorIndex } from "@/types/catalog/CatalogType";
import CatalogItemType from "@/types/catalog/CatalogItemType";
import { countBits, fetchCatalogIndex, fetchColorIndex, matchColors, pickRandomItem, PoolEntry } from "@/lib/catalog";
import useStoredState, { parseBoolean } from "@/hooks/use-stored-state";

type CatalogContextType = {
    catalog: CatalogType | null;
    isCatalogLoaded: boolean;
    /** Everything needed to pick an artwork is loaded (catalogue, and colours when filtering). */
    isReady: boolean;
    error: string | null;
    categories: CatalogCategory[];
    /** Selected category ids, always valid and never empty once the catalog is loaded. */
    selectedCategories: string[];
    toggleCategory: (id: string) => void;
    selectAllCategories: () => void;
    resetCategories: () => void;
    /** Pick every selected category equally often instead of in proportion to its size. */
    equalMix: boolean;
    setEqualMix: (value: boolean) => void;

    /** Colour families, once colors.json is loaded (empty when the catalogue has no palettes). */
    colorBuckets: ColorBucket[];
    colorIndex: ColorIndex | null;
    /** Selected colours: artworks must contain all of them. */
    selectedColors: string[];
    toggleColor: (id: string) => void;
    clearColors: () => void;
    /** Artworks per category, with the colour filter applied. */
    categoryCounts: Record<string, number>;
    /** Artworks in rotation if this colour were added to the filter (or the current count if it's on). */
    colorCounts: Record<string, number>;

    /** Number of artworks matching all filters. */
    poolSize: number;
    /** Whether an artwork still fits the current categories and colours. */
    matchesFilters: (item: CatalogItemType) => boolean;
    pickRandom: (exclude?: ReadonlySet<string>) => Promise<CatalogItemType>;
};

export const CatalogContext = createContext<CatalogContextType | null>(null);

export const DEFAULT_CATEGORIES = ["painting"];
const RETRY_DELAY = 15_000;
/** colors.json isn't needed for the first artwork; fetch it a little later unless a filter is on. */
const COLOR_INDEX_DELAY = 1500;

const parseIds = (value: unknown) =>
    Array.isArray(value) && value.every((id) => typeof id === "string") ? (value as string[]) : undefined;

const isBitSet = (bits: Uint8Array, position: number) => (bits[position >> 3] & (1 << (position & 7))) !== 0;

export default function CatalogProvider({ children }: { children: ReactNode }) {

    const [catalog, setCatalog] = useState<CatalogType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    const [colorIndex, setColorIndex] = useState<ColorIndex | null>(null);
    const [colorsFailed, setColorsFailed] = useState(false);

    const [storedCategories, setStoredCategories] = useStoredState("categories", DEFAULT_CATEGORIES, parseIds);
    const [storedColors, setStoredColors] = useStoredState<string[]>("colors", [], parseIds);
    const [equalMix, setEqualMix] = useStoredState("equal-mix", true, parseBoolean);

    // Load the (small) index; shards are fetched on demand. A frame often boots before the
    // network is up, so keep retrying instead of giving up.
    useEffect(() => {
        if (catalog) return;
        const controller = new AbortController();
        let retry: ReturnType<typeof setTimeout> | undefined;

        fetchCatalogIndex(controller.signal)
            .then((index) => {
                setCatalog(index);
                setError(null);
            })
            .catch((reason) => {
                if (controller.signal.aborted) return;
                console.error(reason);
                setError("Could not load the catalogue. Retrying…");
                retry = setTimeout(() => setAttempt((count) => count + 1), RETRY_DELAY);
            });

        return () => {
            controller.abort();
            clearTimeout(retry);
        };
    }, [catalog, attempt]);

    const wantsColors = storedColors.length > 0;
    const hasPalettes = (catalog?.palettes ?? 0) > 0;

    useEffect(() => {
        if (!catalog || !hasPalettes || colorIndex || colorsFailed) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            fetchColorIndex(catalog, controller.signal)
                .then(setColorIndex)
                .catch((reason) => {
                    if (controller.signal.aborted) return;
                    // Without it the colour filter is simply ignored.
                    console.warn(reason);
                    setColorsFailed(true);
                });
        }, wantsColors ? 0 : COLOR_INDEX_DELAY);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [catalog, hasPalettes, colorIndex, colorsFailed, wantsColors]);

    const categories = useMemo(() => catalog?.categories.filter((category) => category.count > 0) ?? [], [catalog]);

    // Drop ids that no longer exist (e.g. after a catalogue update); never end up with nothing selected.
    const selectedCategories = useMemo(() => {
        if (!catalog) return storedCategories;
        const known = new Set(categories.map((category) => category.id));
        const valid = storedCategories.filter((id) => known.has(id));
        if (valid.length) return valid;
        const fallback = DEFAULT_CATEGORIES.filter((id) => known.has(id));
        return fallback.length ? fallback : categories.slice(0, 1).map((category) => category.id);
    }, [catalog, categories, storedCategories]);

    const colorBuckets = useMemo(() => colorIndex?.buckets ?? [], [colorIndex]);

    const selectedColors = useMemo(
        () => storedColors.filter((id) => colorBuckets.some((bucket) => bucket.id === id)),
        [storedColors, colorBuckets],
    );

    // Bitset of matching rows per category (only while a colour filter is on).
    const matches = useMemo(() => {
        if (!colorIndex || !selectedColors.length) return null;
        return Object.fromEntries(categories.map((category) => [
            category.id,
            matchColors(colorIndex, category.id, selectedColors) ?? new Uint8Array(0),
        ]));
    }, [colorIndex, categories, selectedColors]);

    const categoryCounts = useMemo(
        () => Object.fromEntries(categories.map((category) => [
            category.id,
            matches ? countBits(matches[category.id]) : category.count,
        ])),
        [categories, matches],
    );

    const pool = useMemo<PoolEntry[]>(
        () => categories
            .filter((category) => selectedCategories.includes(category.id))
            .map((category) => ({ category, count: categoryCounts[category.id], bits: matches?.[category.id] })),
        [categories, selectedCategories, categoryCounts, matches],
    );

    const poolSize = useMemo(() => pool.reduce((sum, entry) => sum + entry.count, 0), [pool]);

    const colorCounts = useMemo(() => {
        if (!colorIndex) return {};
        return Object.fromEntries(colorBuckets.map((bucket) => {
            const filter = selectedColors.includes(bucket.id) ? selectedColors : [...selectedColors, bucket.id];
            const count = selectedCategories.reduce((sum, id) => {
                const bits = matchColors(colorIndex, id, filter);
                return sum + (bits ? countBits(bits) : 0);
            }, 0);
            return [bucket.id, count];
        }));
    }, [colorIndex, colorBuckets, selectedColors, selectedCategories]);

    const toggleCategory = useCallback((id: string) => {
        const isSelected = selectedCategories.includes(id);
        if (isSelected && selectedCategories.length === 1) return; // keep at least one
        setStoredCategories(isSelected
            ? selectedCategories.filter((selected) => selected !== id)
            : categories.map((category) => category.id).filter((known) => known === id || selectedCategories.includes(known)));
    }, [categories, selectedCategories, setStoredCategories]);

    const selectAllCategories = useCallback(
        () => setStoredCategories(categories.map((category) => category.id)),
        [categories, setStoredCategories],
    );

    const resetCategories = useCallback(() => setStoredCategories(DEFAULT_CATEGORIES), [setStoredCategories]);

    const toggleColor = useCallback((id: string) => {
        setStoredColors((previous) => (previous.includes(id) ? previous.filter((color) => color !== id) : [...previous, id]));
    }, [setStoredColors]);

    const clearColors = useCallback(() => setStoredColors([]), [setStoredColors]);

    const matchesFilters = useCallback((item: CatalogItemType) => {
        if (!selectedCategories.includes(item.category)) return false;
        if (!matches) return true;
        return item.position !== undefined && isBitSet(matches[item.category] ?? new Uint8Array(0), item.position);
    }, [selectedCategories, matches]);

    const pickRandom = useCallback(async (exclude?: ReadonlySet<string>) => {
        if (!catalog) throw new Error("Catalogue is not loaded yet");
        return pickRandomItem(catalog, pool, equalMix, exclude);
    }, [catalog, pool, equalMix]);

    // With a colour filter on, wait for colors.json (unless it can't be loaded) so the
    // first artwork already matches.
    const isReady = catalog !== null && (!wantsColors || !hasPalettes || colorIndex !== null || colorsFailed);

    const value = useMemo(() => ({
        catalog,
        isCatalogLoaded: catalog !== null,
        isReady,
        error,
        categories,
        selectedCategories,
        toggleCategory,
        selectAllCategories,
        resetCategories,
        equalMix,
        setEqualMix,
        colorBuckets,
        colorIndex,
        selectedColors,
        toggleColor,
        clearColors,
        categoryCounts,
        colorCounts,
        poolSize,
        matchesFilters,
        pickRandom,
    }), [catalog, isReady, error, categories, selectedCategories, toggleCategory, selectAllCategories, resetCategories,
        equalMix, setEqualMix, colorBuckets, colorIndex, selectedColors, toggleColor, clearColors, categoryCounts,
        colorCounts, poolSize, matchesFilters, pickRandom]);

    return (
        <CatalogContext.Provider value={value}>
            {children}
        </CatalogContext.Provider>
    );
}
