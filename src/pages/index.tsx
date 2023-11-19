"use client"

import React, {FC, useEffect, useRef, useState} from "react";

import MainLayout from "@/common/layout/MainLayout";
import Meta from "@/common/layout/Meta";
import Nav from "@/modules/Nav/Nav";
import Figure from "@/modules/Figure/Figure";


const Index : FC = () => {

    const [isMouseMoveing, setIsMouseMoveing] = useState<boolean>(false);
    const [isMenuHidden, setIsMenuHidden] = useState<boolean>(false);
    const [captionIsVisible, setCaptionIsVisible] = useState<boolean>(true);


    let hideTimeout = null;

    const onMouseRest = (): void => {
        document.documentElement.style.cursor = "none";
        setIsMenuHidden(true);
    };

    const onMouseMove = (): void => {
        if(!isMouseMoveing){
            document.documentElement.style.cursor = "default";
            setIsMenuHidden(false);
        }

        if(hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(onMouseRest,5000);

    };


    useEffect(() => {

        window.addEventListener("mousemove", onMouseMove, false);

    },[]);

    return (
        <>
            <MainLayout>

                <Meta title={"WGAF"} description={"WGAF"} />

                { !isMenuHidden &&
                    <Nav
                        captionIsVisible={captionIsVisible}
                        setCaptionIsVisible={setCaptionIsVisible}
                    /> }

                <Figure
                    captionIsVisible={captionIsVisible}
                />

            </MainLayout>
        </>
    )
}

export default Index;