"use client";
import { useContext } from "react";
import { ControlContext } from "@/contexts/control-provider";

export default function useControl() {
    const context = useContext(ControlContext);
    if (!context) throw new Error("useControl must be used inside <ControlProvider>");
    return context;
}
