"use client";
import {useContext} from "react";
import {CursorContext} from "@/contexts/cursor-provider";
export default function useCursor(){

    return useContext(CursorContext);
}