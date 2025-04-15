"use client";
import { useContext } from "react";
import {SettingsContext} from "@/contexts/settings-provider";
export default function useSettings(){

    return useContext(SettingsContext)
}