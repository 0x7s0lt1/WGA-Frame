"use client";
import { createContext, useState } from "react";
import HistoryItemType from "@/types/history/HistoryItemType";
export const HistoryContext = createContext({} as any);

export default function HistoryProvider({ children }: any){

    const [history, setHistory] = useState<HistoryItemType[]>([]);
    const [currentItem, setCurrentItem] = useState<HistoryItemType | null>(null);

    const pushToHistory = (item: HistoryItemType) => {

        if(history.length === 10){
            history.shift();
        }

        setHistory([...history, item]);
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