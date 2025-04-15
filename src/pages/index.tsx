"use client"

import {useEffect, useRef, useState} from "react";

import Meta from "@/componets/Meta";
import Nav from "@/componets/Nav";
import Figure from "@/componets/Figure";
import useCursor from "@/hooks/use-cursor";
import SettingsProvider from "@/contexts/settings-provider";
import HistoryProvider from "@/contexts/history-provider";
import ControlProvider from "@/contexts/control-provider";


export default function Index(){

    let hideTimeout = useRef<any>(null);

    const { isMouseMoving, isCursorOnNav } = useCursor();
    const [isMenuHidden, setIsMenuHidden] = useState<boolean>(false);


    const onMouseRest = () => {
        document.documentElement.style.cursor = "none";
        setIsMenuHidden(true);
    };

    const onMouseMove = () => {
        if(!isMouseMoving){
            document.documentElement.style.cursor = "default";
            setIsMenuHidden(false);
        }

        if(!isCursorOnNav){
            if(hideTimeout.current) clearTimeout(hideTimeout.current);
            hideTimeout.current = setTimeout(onMouseRest,5000);
        }

    };

    useEffect(()=>{

        window.addEventListener("mousemove", onMouseMove, false);

        return () => {
            window.removeEventListener("mousemove", onMouseMove, false);
        }

    },[]);

    useEffect(() => {
        if(isCursorOnNav){
            clearTimeout(hideTimeout.current);
            setIsMenuHidden(false);
        }
    }, [isCursorOnNav]);

    return (
        <SettingsProvider>
            <HistoryProvider>
                <ControlProvider>
                    <Meta />
                    { !isMenuHidden && <Nav/> }
                    <Figure/>
                </ControlProvider>
            </HistoryProvider>
        </SettingsProvider>
    )
}