"use client";
import { useEffect } from "react";
import useControl from "@/hooks/use-control";
import useSettings from "@/hooks/use-settings";

/** ← back · → next · Space play/pause · F fullscreen · C caption · P palette */
export default function useKeyboardShortcuts() {

    const { next, back, togglePaused } = useControl();
    const { toggleFullscreen, captionIsVisible, setCaptionIsVisible, paletteIsVisible, setPaletteIsVisible } = useSettings();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
            // Leave keys alone while a form control has focus (space toggles checkboxes, arrows change selects).
            const target = event.target as HTMLElement | null;
            if (target?.closest("input, select, textarea, button, a, [contenteditable]")) return;

            switch (event.key) {
                case "ArrowLeft": back(); break;
                case "ArrowRight": next(); break;
                case " ": togglePaused(); break;
                case "f": case "F": toggleFullscreen(); break;
                case "c": case "C": setCaptionIsVisible(!captionIsVisible); break;
                case "p": case "P": setPaletteIsVisible(!paletteIsVisible); break;
                default: return;
            }
            event.preventDefault();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [next, back, togglePaused, toggleFullscreen, captionIsVisible, setCaptionIsVisible, paletteIsVisible, setPaletteIsVisible]);
}
