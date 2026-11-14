import { PointerEvent, ReactNode, useRef } from "react";
import useControl from "@/hooks/use-control";
import useCursor from "@/hooks/use-cursor";

/** Minimum horizontal travel for a swipe, in px. */
const SWIPE_DISTANCE = 50;
/** A swipe has to be quick; slower drags are ignored. */
const SWIPE_TIME = 700;
/** Movement still counted as a tap, in px. */
const TAP_SLOP = 10;

type Gesture = { id: number; x: number; y: number; time: number };

/**
 * Full-screen layer behind the menu. Touch and pen only (the mouse keeps its hover behaviour):
 * tap toggles the menu, swipe left/right shows the next/previous artwork. Pinch-zoom is
 * left to the browser.
 */
export default function Stage({ children }: { children: ReactNode }) {

    const { next, back } = useControl();
    const { toggleMenu } = useCursor();
    const gesture = useRef<Gesture | null>(null);

    const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType === "mouse") return;
        // A second finger means pinch-zoom: neither a tap nor a swipe.
        gesture.current = event.isPrimary
            ? { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp }
            : null;
    };

    const onPointerUp = (event: PointerEvent) => {
        const start = gesture.current;
        gesture.current = null;
        if (!start || start.id !== event.pointerId) return;

        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        const elapsed = event.timeStamp - start.time;

        if (Math.abs(dx) >= SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.5 && elapsed <= SWIPE_TIME) {
            if (dx < 0) next();
            else back();
            return;
        }

        const isTap = Math.hypot(dx, dy) <= TAP_SLOP && elapsed < 500;
        // Let the caption link and the palette swatches do their own thing instead of toggling the menu.
        if (isTap && !(event.target as HTMLElement).closest("a, button")) toggleMenu();
    };

    return (
        <main
            className="stage"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (gesture.current = null)}
        >
            {children}
        </main>
    );
}
