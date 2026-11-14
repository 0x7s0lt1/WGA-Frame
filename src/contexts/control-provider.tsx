"use client";
import { createContext, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useCatalog from "@/hooks/use-catalog";
import useHistory from "@/hooks/use-history";
import useStoredState, { parseBoolean } from "@/hooks/use-stored-state";
import { readSavedItem } from "@/contexts/history-provider";
import { preloadImage } from "@/lib/utils";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const INTERVAL_OPTIONS = [
    { value: MINUTE, label: "1 minute" },
    { value: 5 * MINUTE, label: "5 minutes" },
    { value: 10 * MINUTE, label: "10 minutes" },
    { value: 15 * MINUTE, label: "15 minutes" },
    { value: 30 * MINUTE, label: "30 minutes" },
    { value: 45 * MINUTE, label: "45 minutes" },
    { value: HOUR, label: "1 hour" },
    { value: 2 * HOUR, label: "2 hours" },
    { value: 3 * HOUR, label: "3 hours" },
    { value: 6 * HOUR, label: "6 hours" },
    { value: 12 * HOUR, label: "12 hours" },
    { value: DAY, label: "1 day" },
    { value: 2 * DAY, label: "2 days" },
    { value: 3 * DAY, label: "3 days" },
    { value: 7 * DAY, label: "1 week" },
    { value: 14 * DAY, label: "2 weeks" },
    { value: 30 * DAY, label: "1 month" },
    { value: 90 * DAY, label: "3 months" },
];
const DEFAULT_INTERVAL = 5 * MINUTE;
/** Artworks tried per load before giving up (e.g. a missing image on wga.hu). */
const MAX_ATTEMPTS = 3;
/** Base delay before retrying after a failed load (offline, wga.hu down). */
const RETRY_DELAY = 15_000;
/** Lets a few quick filter clicks settle before switching the artwork. */
const FILTER_CHANGE_DELAY = 400;
/**
 * Longest single timer. setTimeout overflows past ~24.8 days, and timers drift while a device
 * sleeps, so long intervals are checked against their deadline at least this often.
 */
const MAX_TIMER = HOUR;

const parseInterval = (value: unknown) =>
    INTERVAL_OPTIONS.some((option) => option.value === value) ? (value as number) : undefined;

type ControlContextType = {
    isPaused: boolean;
    setIsPaused: (value: boolean) => void;
    togglePaused: () => void;
    imageChangeDuration: number;
    setImageChangeDuration: (value: number) => void;
    /** When the next artwork is due (ms timestamp), or null while paused / nothing is shown. */
    nextChangeAt: number | null;
    /** A new artwork is being picked and downloaded. */
    isLoading: boolean;
    /** The last load failed; a retry is scheduled. */
    hasError: boolean;
    /** Next in history, or a new random artwork when already at the end. */
    next: () => void;
    back: () => void;
};

export const ControlContext = createContext<ControlContextType | null>(null);

export default function ControlProvider({ children }: { children: ReactNode }) {

    const { isReady, pickRandom, matchesFilters, poolSize } = useCatalog();
    const { history, currentItem, shownAt, pushToHistory, restoreItem, restartCountdown, goBack, goForward, canGoForward } = useHistory();

    // Remembered, so a paused favourite stays up after a reload.
    const [isPaused, setPausedState] = useStoredState("paused", false, parseBoolean);
    const [imageChangeDuration, setImageChangeDuration] = useStoredState("interval", DEFAULT_INTERVAL, parseInterval);
    const [isLoading, setIsLoading] = useState(false);
    // `cycle` changes after every finished load so the timer below always re-arms.
    const [status, setStatus] = useState({ cycle: 0, failures: 0 });

    const requestId = useRef(0);
    const latest = useRef({ history, currentItem, matchesFilters, isPaused, imageChangeDuration });
    useEffect(() => {
        latest.current = { history, currentItem, matchesFilters, isPaused, imageChangeDuration };
    });

    /** `restore`: on start-up, bring back the artwork from before the reload if its time isn't up. */
    const loadNext = useCallback(async ({ restore = false } = {}) => {
        const id = ++requestId.current;
        const isStale = () => id !== requestId.current;
        const exclude = new Set(latest.current.history.map((item) => item.id));
        let loaded = false;

        setIsLoading(true);

        if (restore) {
            const saved = readSavedItem();
            const { isPaused: paused, imageChangeDuration: duration, matchesFilters: matches } = latest.current;
            if (saved && (paused || Date.now() - saved.shownAt < duration) && matches(saved.item)) {
                try {
                    await preloadImage(saved.item.imageUrl);
                    if (!isStale()) restoreItem(saved.item, saved.shownAt);
                    loaded = true;
                } catch {
                    // Image gone: fall through to a new artwork.
                }
            }
        }

        for (let attempt = 0; attempt < MAX_ATTEMPTS && !loaded && !isStale(); attempt++) {
            try {
                const item = await pickRandom(exclude);
                exclude.add(item.id);
                // Swap only once the image is ready: no half-drawn paintings, no blank frame.
                const size = await preloadImage(item.imageUrl);
                if (isStale()) break;
                // The filters may have changed while downloading; the newer request handles that.
                if (latest.current.matchesFilters(item)) pushToHistory({ ...item, ...size });
                loaded = true;
            } catch (error) {
                console.warn(error);
            }
        }

        if (isStale()) return; // a newer request owns the loading state now
        setIsLoading(false);
        setStatus((previous) => ({ cycle: previous.cycle + 1, failures: loaded ? 0 : previous.failures + 1 }));
    }, [pickRandom, pushToHistory, restoreItem]);

    const hasArtworks = poolSize > 0;

    // The slideshow timer, driven by a deadline: shownAt + interval. Every artwork (including one
    // picked by hand) gets the full interval.
    useEffect(() => {
        if (!isReady || !hasArtworks) return;

        if (!currentItem) {
            const delay = status.failures ? Math.min(RETRY_DELAY * status.failures, MINUTE) : 0;
            const timer = setTimeout(() => void loadNext({ restore: status.cycle === 0 }), delay);
            return () => clearTimeout(timer);
        }
        if (isPaused) return;

        const deadline = status.failures > 0
            ? Date.now() + Math.min(RETRY_DELAY * status.failures, imageChangeDuration)
            : shownAt + imageChangeDuration;

        let timer: ReturnType<typeof setTimeout> | undefined;
        const check = () => {
            const remaining = deadline - Date.now();
            timer = remaining <= 0 ? setTimeout(() => void loadNext(), 0) : setTimeout(check, Math.min(remaining, MAX_TIMER));
        };
        check();

        // Coming back from sleep or a hidden tab: catch up straight away.
        const onVisible = () => {
            if (document.visibilityState !== "visible") return;
            clearTimeout(timer);
            check();
        };
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            clearTimeout(timer);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [isReady, hasArtworks, isPaused, imageChangeDuration, currentItem, shownAt, status, loadNext]);

    // When the artwork on display no longer fits the categories / colours, switch right away.
    useEffect(() => {
        const current = latest.current.currentItem;
        if (!isReady || !hasArtworks || !current || matchesFilters(current)) return;

        const timer = setTimeout(() => void loadNext(), FILTER_CHANGE_DELAY);
        return () => clearTimeout(timer);
    }, [isReady, hasArtworks, matchesFilters, loadNext]);

    const setIsPaused = useCallback((value: boolean) => {
        if (value) {
            // Don't let a download that started before pausing replace the artwork.
            requestId.current++;
            setIsLoading(false);
        } else {
            // Resuming gives the artwork a fresh full interval.
            restartCountdown();
        }
        setPausedState(value);
    }, [restartCountdown, setPausedState]);

    const togglePaused = useCallback(() => setIsPaused(!isPaused), [isPaused, setIsPaused]);

    const next = useCallback(() => {
        if (canGoForward) goForward();
        else void loadNext();
    }, [canGoForward, goForward, loadNext]);

    const nextChangeAt = currentItem && !isPaused && hasArtworks ? shownAt + imageChangeDuration : null;

    const value = useMemo(() => ({
        isPaused,
        setIsPaused,
        togglePaused,
        imageChangeDuration,
        setImageChangeDuration,
        nextChangeAt,
        isLoading,
        hasError: status.failures > 0,
        next,
        back: goBack,
    }), [isPaused, setIsPaused, togglePaused, imageChangeDuration, setImageChangeDuration, nextChangeAt, isLoading,
        status.failures, next, goBack]);

    return (
        <ControlContext.Provider value={value}>
            {children}
        </ControlContext.Provider>
    );
}
