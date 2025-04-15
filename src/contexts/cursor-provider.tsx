"use client";

import { createContext, useState, useEffect, useRef } from "react";
export const CursorContext = createContext({} as any);

export default function CursorProvider({ children }: any) {

    let hideTimeout = useRef<any>();
    let isCursorOnNav = useRef<boolean>(false);

    const setIsCursorOnNav = (value: boolean) => {
        isCursorOnNav.current = value;
    };

    const [isMouseMoving, setIsMouseMoving] = useState<boolean>(false);
    const [isMenuHidden, setIsMenuHidden] = useState<boolean>(false);

    const onMouseRest = () => {

        if (!isCursorOnNav.current) {
            document.documentElement.style.cursor = "none";
            setIsMenuHidden(true);
        }

        if (hideTimeout.current) {
            clearTimeout(hideTimeout.current);
        }

    };

    const onMouseMove = () => {

        document.documentElement.style.cursor = "default";
        setIsMenuHidden(false);

        if (hideTimeout.current) {
            clearTimeout(hideTimeout.current);
        }

        if (isCursorOnNav.current) {
            return;
        }


        hideTimeout.current = setTimeout(onMouseRest, 5000);

    };


    useEffect(()=>{

        window.addEventListener("mousemove", onMouseMove, false);

    },[]);


    return (
        <CursorContext.Provider value={
            {
                isMouseMoving,
                setIsMouseMoving,
                isCursorOnNav,
                setIsCursorOnNav,
                isMenuHidden,
                setIsMenuHidden
            }
        }>
            {children}
        </CursorContext.Provider>
    )
}