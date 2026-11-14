"use client";
import { useContext } from "react";
import { HistoryContext } from "@/contexts/history-provider";

export default function useHistory() {
    const context = useContext(HistoryContext);
    if (!context) throw new Error("useHistory must be used inside <HistoryProvider>");
    return context;
}
