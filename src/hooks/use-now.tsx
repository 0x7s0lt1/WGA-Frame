"use client";
import { useCallback, useSyncExternalStore } from "react";

/** The current time, updated every `step` ms (rounded down to it, so renders stay stable). */
export default function useNow(step = 30_000): number {
    const subscribe = useCallback((listener: () => void) => {
        const timer = setInterval(listener, step);
        document.addEventListener("visibilitychange", listener);
        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", listener);
        };
    }, [step]);

    return useSyncExternalStore(subscribe, () => Math.floor(Date.now() / step) * step, () => 0);
}
