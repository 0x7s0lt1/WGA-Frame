import {useEffect, useRef, useState} from "react";
import HistoryItemType from "@/types/history/HistoryItemType";
import useControl from "@/hooks/use-control";
import useHistory from "@/hooks/use-history";
import useSettings from "@/hooks/use-settings";
import useCatalog from "@/hooks/use-catalog";
import {getImageFromURL, LOADING_IMG} from "@/lib/utils";

import { Roboto } from 'next/font/google'

const roboto = Roboto({ weight: '100', subsets: ['latin'] })

export default function Figure(){

    let imageChangeInterval = useRef<any>(null);

    const { catalog, isCatalogLoaded } = useCatalog();
    const { captionIsVisible, ambientIsVisible } = useSettings();
    const { currentItem, setCurrentItem, pushToHistory } = useHistory();
    const { isPaused, imageChangeDuration } = useControl();

    const figCaptionRef = useRef<any>();
    const [imageSrc,setImageSrc] = useState<string>(LOADING_IMG);


    const getRandomPainting = async (): Promise<any> =>{

        if(catalog !== undefined && figCaptionRef.current !== undefined) {

            setImageSrc(LOADING_IMG);

            const ran_item = catalog.painting[Math.floor(Math.random() * catalog.painting.length )];

            const item: HistoryItemType = {
                name: `${ran_item.AUTHOR} - ${ran_item.TITLE} - ${ran_item.DATE}`, 
                url: await getImageFromURL(ran_item.URL),
            };

            if(figCaptionRef.current !== null){
                figCaptionRef.current.innerHTML = item.name;
            }

            pushToHistory(item);
            setCurrentItem(item);

        }
    };


    useEffect(() => {
        
        if(isCatalogLoaded){

            if(isPaused){
                if(imageChangeInterval.current !== null) clearInterval(imageChangeInterval.current);
            }else{
                imageChangeInterval.current = setInterval(getRandomPainting,imageChangeDuration);
            }

        }

    },[isPaused])

    useEffect(() => {

        if(isCatalogLoaded){
            getRandomPainting()
                .then(()=> imageChangeInterval.current = setInterval(getRandomPainting, imageChangeDuration) );
        }

    }, [isCatalogLoaded]);

    useEffect(() => {

        if(isCatalogLoaded){

            if(imageChangeInterval.current !== null) clearInterval(imageChangeInterval.current);
            imageChangeInterval.current = setInterval(getRandomPainting,imageChangeDuration);
    
        }

    }, [imageChangeDuration]);

    useEffect(() => {

        if(isCatalogLoaded){
            setImageSrc(currentItem?.url ?? LOADING_IMG);
        }

    }, [currentItem]);

    return(
        <figure className="fig">
            <img id="frame-bg" src={imageSrc}  alt={"ambient"} className={ambientIsVisible ? "" : "d-none"}/>
            <img id="frame" src={imageSrc} alt="empty-wga-frame" />
            <figcaption
                ref={figCaptionRef}
                className={`figCaption bg-black color-white ${roboto.className} ${captionIsVisible ? "" : "d-none" }`}
            >
            </figcaption>
        </figure>
    )
}