"use client";
import {useContext} from "react";
import {ControlContext} from "@/contexts/control-provider";
export default function useControl(){

    return useContext(ControlContext);
}