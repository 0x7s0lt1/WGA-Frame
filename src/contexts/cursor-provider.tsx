"use client";
import { createContext, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

/** The menu and the cursor hide after this much inactivity. */
const IDLE_TIMEOUT = 5000;
/** Touch users read the menu without touching it, so give them longer. */
const TOUCH_IDLE_TIMEOUT = 10000;

type CursorContextType = {
    isMenuHidden: boolean;
    setIsCursorOnNav: (value: boolean) => void;
    showMenu: () => void;
    hideMenu: () => void;
    toggleMenu: () => void;
};

export const CursorContext = createContext<CursorContextType | null>(null);

export default function CursorProvider({ children }: { children: ReactNode }) {

    const [isMenuHidden, setIsMenuHidden] = useState(false);
    // Hides the cursor; separate from the menu, which also hides while pointing at the caption.
    const [isIdle, setIsIdle] = useState(false);
    const isHidden = useRef(false);
    const isCursorOnNav = useRef(false);
    const isTouch = useRef(false);
    const hideTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

    const scheduleHide = useCallback(() => {
        clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => {
            // Never hide the menu under the cursor; leaving it moves the pointer and restarts the countdown.
            if (isCursorOnNav.current) return;
            setIsMenuHidden(true);
            setIsIdle(true);
        }, isTouch.current ? TOUCH_IDLE_TIMEOUT : IDLE_TIMEOUT);
    }, []);

    const showMenu = useCallback(() => {
        setIsMenuHidden(false);
        setIsIdle(false);
        scheduleHide();
    }, [scheduleHide]);

    const hideMenu = useCallback(() => {
        clearTimeout(hideTimeout.current);
        isCursorOnNav.current = false;
        setIsMenuHidden(true);
    }, []);

    const toggleMenu = useCallback(() => (isHidden.current ? showMenu() : hideMenu()), [showMenu, hideMenu]);

    const setIsCursorOnNav = useCallback((value: boolean) => {
        isCursorOnNav.current = value;
        if (!value && !isHidden.current) scheduleHide();
    }, [scheduleHide]);

    useEffect(() => {
        const onPointer = (event: PointerEvent) => {
            isTouch.current = event.pointerType !== "mouse";
            if (!isTouch.current) {
                // Pointing at the caption / palette: get the menu out of the way (it would cover the
                // left end on wide artworks), but keep the cursor so swatches can be clicked.
                if ((event.target as Element | null)?.closest?.(".figCaption") && !isCursorOnNav.current) {
                    setIsMenuHidden(true);
                    setIsIdle(false);
                    scheduleHide();
                } else {
                    showMenu();
                }
            } else if (!isHidden.current) {
                // Touch and pen: a tap on the artwork toggles the menu (see Stage), so touching
                // here doesn't show it; it only keeps an open menu from hiding mid-use.
                scheduleHide();
            }
        };
        // Scrolling the menu with a finger fires no pointer events once the browser takes over.
        const onScroll = () => {
            if (!isHidden.current) scheduleHide();
        };
        // Tab shows the menu for keyboard users; other keys are shortcuts and leave the frame clean.
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Tab") showMenu();
        };

        window.addEventListener("pointermove", onPointer, { passive: true });
        window.addEventListener("pointerdown", onPointer, { passive: true });
        window.addEventListener("scroll", onScroll, { capture: true, passive: true });
        window.addEventListener("keydown", onKeyDown);

        // Start counting right away: a wall-mounted frame may never see the mouse move.
        isTouch.current = window.matchMedia("(pointer: coarse)").matches;
        scheduleHide();

        return () => {
            window.removeEventListener("pointermove", onPointer);
            window.removeEventListener("pointerdown", onPointer);
            window.removeEventListener("scroll", onScroll, { capture: true });
            window.removeEventListener("keydown", onKeyDown);
            clearTimeout(hideTimeout.current);
        };
    }, [scheduleHide, showMenu]);

    useEffect(() => {
        isHidden.current = isMenuHidden;
    }, [isMenuHidden]);

    useEffect(() => {
        document.documentElement.classList.toggle("is-idle", isIdle);
    }, [isIdle]);

    const value = useMemo(
        () => ({ isMenuHidden, setIsCursorOnNav, showMenu, hideMenu, toggleMenu }),
        [isMenuHidden, setIsCursorOnNav, showMenu, hideMenu, toggleMenu],
    );

    return (
        <CursorContext.Provider value={value}>
            {children}
        </CursorContext.Provider>
    );
}
