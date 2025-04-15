"use client";
import { useState } from "react";
export default function useCursor(){

    const [isMouseMoving, setIsMouseMoving] = useState<boolean>(false);
    const [isCursorOnNav, setIsCursorOnNav] = useState<boolean>(false);

    return{
        isMouseMoving,
        setIsMouseMoving,
        isCursorOnNav,
        setIsCursorOnNav
    }

}