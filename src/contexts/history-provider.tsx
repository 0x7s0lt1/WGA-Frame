"use client";
import { createContext, ReactNode, useCallback, useEffect, useMemo, useReducer } from "react";
import CatalogItemType from "@/types/catalog/CatalogItemType";

/** A frame runs for days; keep the history bounded. */
export const MAX_HISTORY = 100;
const STORAGE_KEY = "wga-frame:current";

type HistoryContextType = {
    history: CatalogItemType[];
    currentItem: CatalogItemType | null;
    /** When the current artwork appeared (ms timestamp); the refresh countdown starts here. */
    shownAt: number;
    pushToHistory: (item: CatalogItemType) => void;
    /** Shows a saved artwork again (after a reload), keeping its original start time. */
    restoreItem: (item: CatalogItemType, shownAt: number) => void;
    /** Restarts the countdown for the current artwork. */
    restartCountdown: () => void;
    goBack: () => void;
    goForward: () => void;
    canGoBack: boolean;
    canGoForward: boolean;
};

export const HistoryContext = createContext<HistoryContextType | null>(null);

type State = { items: CatalogItemType[]; index: number; shownAt: number };
type Action =
    | { type: "push"; item: CatalogItemType; at: number }
    | { type: "restore"; item: CatalogItemType; at: number }
    | { type: "restart"; at: number }
    | { type: "back"; at: number }
    | { type: "forward"; at: number };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "push": {
            const items = [...state.items, action.item].slice(-MAX_HISTORY);
            return { items, index: items.length - 1, shownAt: action.at };
        }
        case "restore":
            return { items: [action.item], index: 0, shownAt: action.at };
        case "restart":
            return { ...state, shownAt: action.at };
        case "back":
            return state.index > 0 ? { ...state, index: state.index - 1, shownAt: action.at } : state;
        case "forward":
            return state.index < state.items.length - 1 ? { ...state, index: state.index + 1, shownAt: action.at } : state;
    }
}

/** The artwork on display before the last reload, if any (see the effect below). */
export function readSavedItem(): { item: CatalogItemType; shownAt: number } | null {
    try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
        const item = saved?.item;
        const valid = typeof saved?.shownAt === "number"
            && typeof item?.id === "string" && typeof item.category === "string"
            && typeof item.imageUrl === "string" && typeof item.title === "string"
            && typeof item.author === "string" && Array.isArray(item.palette);
        return valid ? { item, shownAt: saved.shownAt } : null;
    } catch {
        return null;
    }
}

export default function HistoryProvider({ children }: { children: ReactNode }) {

    const [{ items, index, shownAt }, dispatch] = useReducer(reducer, { items: [], index: -1, shownAt: 0 });

    const pushToHistory = useCallback((item: CatalogItemType) => dispatch({ type: "push", item, at: Date.now() }), []);
    const restoreItem = useCallback((item: CatalogItemType, at: number) => dispatch({ type: "restore", item, at }), []);
    const restartCountdown = useCallback(() => dispatch({ type: "restart", at: Date.now() }), []);
    const goBack = useCallback(() => dispatch({ type: "back", at: Date.now() }), []);
    const goForward = useCallback(() => dispatch({ type: "forward", at: Date.now() }), []);

    const currentItem = items[index] ?? null;

    // Remember what's on display, so a reload (or a frame rebooting overnight) carries on with
    // the same artwork instead of starting a long interval over with a new one.
    useEffect(() => {
        if (!currentItem) return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ item: currentItem, shownAt }));
        } catch {
            // Storage unavailable: the frame just starts fresh after a reload.
        }
    }, [currentItem, shownAt]);

    const value = useMemo(() => ({
        history: items,
        currentItem,
        shownAt,
        pushToHistory,
        restoreItem,
        restartCountdown,
        goBack,
        goForward,
        canGoBack: index > 0,
        canGoForward: index < items.length - 1,
    }), [items, currentItem, shownAt, pushToHistory, restoreItem, restartCountdown, goBack, goForward, index]);

    return (
        <HistoryContext.Provider value={value}>
            {children}
        </HistoryContext.Provider>
    );
}
