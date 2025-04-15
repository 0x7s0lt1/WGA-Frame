"use client";
import { useState, useEffect, createContext } from "react";

export const SettingsContext = createContext({} as any);

export default function SettingsProvider({ children }: any) {

    const [captionIsVisible, setCaptionIsVisible] = useState<boolean>(true);
    const [ambientIsVisible, setAmbientIsVisible] = useState<boolean>(true);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [backgroundColor, setBackgroundColor] = useState<string>("black");

    useEffect(() => {

        if(isFullscreen){
            document.documentElement.requestFullscreen();
        }else{

            if(document.fullscreenElement){
                document.exitFullscreen();
            }
        }

    },[isFullscreen])

    useEffect(() => {
        document.body.style.backgroundColor = backgroundColor;
    }, [backgroundColor]);

    return (
        <SettingsContext.Provider
            value={{
                captionIsVisible,
                setCaptionIsVisible,
                ambientIsVisible,
                setAmbientIsVisible,
                isFullscreen,
                setIsFullscreen,
                backgroundColor,
                setBackgroundColor
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
