"use client";
import { createContext, useState } from "react";
import HistoryItemType from "@/types/history/HistoryItemType";
export const HistoryContext = createContext({} as any);

export default function HistoryProvider({ children }: any){

    const [history, setHistory] = useState<HistoryItemType[]>([]);
    const [currentItem, setCurrentItem] = useState<HistoryItemType | null>(null);

    const pushToHistory = (item: HistoryItemType) => {

        history.push(item);
        setHistory(history);
    };

    return (
        <HistoryContext.Provider value={{
            history,
            setHistory,
            pushToHistory,
            currentItem,
            setCurrentItem,
        }}>
            {children}
        </HistoryContext.Provider>
    )
}