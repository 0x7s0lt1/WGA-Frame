"use client";
import { createContext, ReactNode, useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import useStoredState, { parseBoolean } from "@/hooks/use-stored-state";

type SettingsContextType = {
    captionIsVisible: boolean;
    setCaptionIsVisible: (value: boolean) => void;
    ambientIsVisible: boolean;
    setAmbientIsVisible: (value: boolean) => void;
    /** Glow size/strength, 0 (subtle) … AMBIENT_LEVELS - 1 (largest); the middle step is the classic look. */
    ambientLevel: number;
    setAmbientLevel: (value: number) => void;
    paletteIsVisible: boolean;
    setPaletteIsVisible: (value: boolean) => void;
    isFullscreen: boolean;
    isFullscreenSupported: boolean;
    setIsFullscreen: (value: boolean) => void;
    toggleFullscreen: () => void;
    backgroundColor: string;
    setBackgroundColor: (value: string) => void;
    /** Keep the screen from dimming and locking (phones and tablets used as a frame). */
    keepAwake: boolean;
    setKeepAwake: (value: boolean) => void;
    isWakeLockSupported: boolean;
};

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const DEFAULT_BACKGROUND = "#000000";
export const AMBIENT_LEVELS = 5;
export const DEFAULT_AMBIENT_LEVEL = 2;

const parseAmbientLevel = (value: unknown) =>
    Number.isInteger(value) && (value as number) >= 0 && (value as number) < AMBIENT_LEVELS ? (value as number) : undefined;

// <input type="color"> only accepts #rrggbb.
const parseColor = (value: unknown) =>
    typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : undefined;

const subscribeFullscreen = (listener: () => void) => {
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
};
const noopSubscribe = () => () => {};

export default function SettingsProvider({ children }: { children: ReactNode }) {

    const [captionIsVisible, setCaptionIsVisible] = useStoredState("caption", true, parseBoolean);
    const [ambientIsVisible, setAmbientIsVisible] = useStoredState("ambient", true, parseBoolean);
    const [ambientLevel, setAmbientLevel] = useStoredState("ambient-level", DEFAULT_AMBIENT_LEVEL, parseAmbientLevel);
    const [paletteIsVisible, setPaletteIsVisible] = useStoredState("palette", false, parseBoolean);
    const [backgroundColor, setBackgroundColor] = useStoredState("background", DEFAULT_BACKGROUND, parseColor);
    const [keepAwake, setKeepAwake] = useStoredState("keep-awake", false, parseBoolean);

    // Read from the document, so leaving fullscreen with Esc keeps the checkbox in sync.
    const isFullscreen = useSyncExternalStore(subscribeFullscreen, () => !!document.fullscreenElement, () => false);
    const isFullscreenSupported = useSyncExternalStore(noopSubscribe, () => !!document.fullscreenEnabled, () => false);
    const isWakeLockSupported = useSyncExternalStore(noopSubscribe, () => "wakeLock" in navigator, () => false);

    const setIsFullscreen = useCallback((value: boolean) => {
        // Must run inside the click handler: browsers only allow fullscreen on a user gesture.
        const request = value
            ? !document.fullscreenElement && document.documentElement.requestFullscreen()
            : document.fullscreenElement && document.exitFullscreen();
        if (request) request.catch((error) => console.warn("Fullscreen request failed", error));
    }, []);

    const toggleFullscreen = useCallback(() => setIsFullscreen(!document.fullscreenElement), [setIsFullscreen]);

    useEffect(() => {
        document.body.style.backgroundColor = backgroundColor;
    }, [backgroundColor]);

    useEffect(() => {
        if (!keepAwake || !("wakeLock" in navigator)) return;

        let lock: WakeLockSentinel | null = null;
        let pending = false;
        let active = true;

        const acquire = async () => {
            if (!active || pending || document.visibilityState !== "visible" || (lock && !lock.released)) return;
            pending = true;
            try {
                const sentinel = await navigator.wakeLock.request("screen");
                if (active) lock = sentinel;
                else void sentinel.release();
            } catch (error) {
                // Denied (battery saver, no user gesture yet): retried on the next tap or tab switch.
                console.warn("Wake lock request failed", error);
            } finally {
                pending = false;
            }
        };

        void acquire();
        // The browser drops the lock whenever the page is hidden; take it again on return.
        document.addEventListener("visibilitychange", acquire);
        window.addEventListener("pointerdown", acquire, { passive: true });

        return () => {
            active = false;
            document.removeEventListener("visibilitychange", acquire);
            window.removeEventListener("pointerdown", acquire);
            void lock?.release().catch(() => undefined);
        };
    }, [keepAwake]);

    const value = useMemo(() => ({
        captionIsVisible,
        setCaptionIsVisible,
        ambientIsVisible,
        setAmbientIsVisible,
        ambientLevel,
        setAmbientLevel,
        paletteIsVisible,
        setPaletteIsVisible,
        isFullscreen,
        isFullscreenSupported,
        setIsFullscreen,
        toggleFullscreen,
        backgroundColor,
        setBackgroundColor,
        keepAwake,
        setKeepAwake,
        isWakeLockSupported,
    }), [captionIsVisible, setCaptionIsVisible, ambientIsVisible, setAmbientIsVisible, ambientLevel, setAmbientLevel,
        paletteIsVisible, setPaletteIsVisible, isFullscreen,
        isFullscreenSupported, setIsFullscreen, toggleFullscreen, backgroundColor, setBackgroundColor,
        keepAwake, setKeepAwake, isWakeLockSupported]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}
