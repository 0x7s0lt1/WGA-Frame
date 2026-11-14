"use client";
import { useContext } from "react";
import { CursorContext } from "@/contexts/cursor-provider";

export default function useCursor() {
    const context = useContext(CursorContext);
    if (!context) throw new Error("useCursor must be used inside <CursorProvider>");
    return context;
}
