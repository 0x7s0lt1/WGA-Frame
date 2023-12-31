"use client"

import {FC, useEffect, useState} from "react";

import MainLayout from "@/common/layout/MainLayout";
import Meta from "@/common/layout/Meta";
import Nav from "@/modules/Nav/Nav";
import Figure from "@/modules/Figure/Figure";

import DisplaySettingStorage from "@/common/localstorage/DisplaySettingStorage";
import IntervalSettingStorage from "@/common/localstorage/IntervalSettingStorage";

import HistoryItemType from "@/interfaces/HistoryItemType";

const Index : FC = () => {

    const [isMouseMoving, setIsMouseMoving] = useState<boolean>(false);
    const [isCursorOnNav, setIsCursorOnNav] = useState<boolean>(false);
    const [isMenuHidden, setIsMenuHidden] = useState<boolean>(false);

    // DisplayOptions
    const [captionIsVisible, setCaptionIsVisible] = useState(true);
    const [backgroundColor, setBackgroundColor] = useState<string>("black");

    // Interval
    const [imageChangeDuration,setImageChangeDuration] = useState<number>( 3600000 ); // 1h

    // Controller
    const [history, setHistory] = useState<HistoryItemType[]>([]);
    const [currentItem, setCurrentItem] = useState<HistoryItemType | null>(null);
    const [isPaused, setIsPaused] = useState<boolean>(false);

    let hideTimeout: any = null;

    const onMouseRest = (): void => {
        document.documentElement.style.cursor = "none";
        setIsMenuHidden(true);
    };

    const onMouseMove = (): void => {
        if(!isMouseMoving){
            document.documentElement.style.cursor = "default";
            setIsMenuHidden(false);
        }

        if(!isCursorOnNav){
            if(hideTimeout) clearTimeout(hideTimeout);
            hideTimeout = setTimeout(onMouseRest,5000);
        }

    };


    useEffect(() => {

        window.addEventListener("mousemove", onMouseMove, false);

        (async ()=>{
            setCaptionIsVisible(await DisplaySettingStorage.getSetting(DisplaySettingStorage.CAPTION_IS_VISIBLE_KEY));
            setBackgroundColor(await DisplaySettingStorage.getSetting(DisplaySettingStorage.BACKGROUND_COLOR_KEY));
            setImageChangeDuration(await IntervalSettingStorage.getInterval());
        })();

    },[]);

    useEffect(() => {
        if(isCursorOnNav){
            clearTimeout(hideTimeout);
            setIsMenuHidden(false);
        }
    }, [isCursorOnNav]);

    return (
        <>
            <MainLayout>

                <Meta title={"WGAF"} description={"Web Gallery of Art in Frame"} />

                { !isMenuHidden &&
                    <Nav
                        imageChangeDuration={imageChangeDuration}
                        setImageChangeDuration={setImageChangeDuration}
                        captionIsVisible={captionIsVisible}
                        setCaptionIsVisible={setCaptionIsVisible}
                        backgroundColor={backgroundColor}
                        setBackgroundColor={setBackgroundColor}
                        isCursorOnNav={isCursorOnNav}
                        setIsCursorOnNav={setIsCursorOnNav}
                        history={history}
                        setHistory={setHistory}
                        currentItem={currentItem}
                        setCurrentItem={setCurrentItem}
                        isPaused={isPaused}
                        setIsPaused={setIsPaused}
                    />
                }

                <Figure
                    imageChangeDuration={imageChangeDuration}
                    captionIsVisible={captionIsVisible}
                    isPaused={isPaused}
                    history={history}
                    setHistory={setHistory}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                />

            </MainLayout>
        </>
    )
}

export default Index;