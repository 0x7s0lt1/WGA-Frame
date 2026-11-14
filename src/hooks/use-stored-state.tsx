"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";

const PREFIX = "wga-frame:";

// Fallback when localStorage is unavailable (private mode, blocked storage, sandboxed iframe).
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
        if (event.key === null || event.key.startsWith(PREFIX)) {
            if (event.key) memory.delete(event.key);
            listener();
        }
    };
    window.addEventListener("storage", onStorage); // keeps other tabs in sync
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
    };
}

function read(key: string): string | null {
    if (memory.has(key)) return memory.get(key)!;
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function write(key: string, raw: string) {
    memory.set(key, raw);
    try {
        window.localStorage.setItem(key, raw);
        memory.delete(key);
    } catch {
        // Keep the in-memory copy so the setting still works for this session.
    }
    notify();
}

/**
 * Like useState, but persisted in localStorage. The server render (and hydration) uses
 * `initial`, then the stored value takes over, so there's no hydration mismatch.
 * `parse` validates what was stored and returns undefined to fall back to `initial`.
 */
export default function useStoredState<T>(
    name: string,
    initial: T,
    parse: (value: unknown) => T | undefined,
): [T, (next: T | ((previous: T) => T)) => void] {
    const key = PREFIX + name;

    const raw = useSyncExternalStore(subscribe, () => read(key), () => null);

    // `initial` and `parse` are expected to be constants, so only `raw` matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const value = useMemo(() => decode(raw, initial, parse), [raw]);

    const setValue = useCallback((next: T | ((previous: T) => T)) => {
        const previous = decode(read(key), initial, parse);
        const resolved = typeof next === "function" ? (next as (previous: T) => T)(previous) : next;
        write(key, JSON.stringify(resolved));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return [value, setValue];
}

function decode<T>(raw: string | null, initial: T, parse: (value: unknown) => T | undefined): T {
    if (raw === null) return initial;
    try {
        return parse(JSON.parse(raw)) ?? initial;
    } catch {
        return initial;
    }
}

export const parseBoolean = (value: unknown) => (typeof value === "boolean" ? value : undefined);
