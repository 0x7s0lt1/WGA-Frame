import {FC, useEffect, useRef, useState} from "react";
import CatalogType from "@/interfaces/CatalogType";

import IntervalSettingStorage from "@/common/localstorage/IntervalSettingStorage";

type Props = {
    imageChangeDuration: number
    captionIsVisible: boolean
}
const Figure: FC<Props> = ({imageChangeDuration, captionIsVisible}) => {

    const BASE_URL = "https://www.wga.hu/";
    const LOADING_IMG = "/img/loading-c.svg";

    const figCaptionRef = useRef<any>();

    let imageChangeInterval: any = null;

    const [isCatalogLoaded, setIsCatalogLoaded] = useState<boolean>(false);
    const [imageSrc,setImageSrc] = useState<string>(LOADING_IMG);
    const [db,setDB] = useState<CatalogType>();

    const getImageFromURL = async (url: string): Promise<any> => {

        const response= await fetch("https://zsoltfehervari.dev/proxy/?url=" + url);
        const content = await response.text();

        const href = new DOMParser()
            .parseFromString(content, "text/html")
            .querySelectorAll('tbody')[1]
            .querySelector('a')
            ?.getAttribute('href');
       
        setImageSrc(BASE_URL + href);
    };

    const getRandomPainting = async (): Promise<any> =>{

        if(db !== undefined && figCaptionRef.current !== undefined) {

            setImageSrc(LOADING_IMG);

            const ran = db.painting[Math.floor(Math.random() * db.painting.length )];

            if(figCaptionRef.current !== null){
                figCaptionRef.current.innerHTML =`${ran.AUTHOR} - ${ran.TITLE} - ${ran.DATE}`;
            }

            await getImageFromURL(ran.URL);
            
        }
    };

    useEffect(() => {

        if(!isCatalogLoaded){
            (async ()=>{
                const response = await fetch('/json/catalog.json');
                const catalog = await response.json();

                let obj: any = {};
                catalog.forEach( (i: any) =>
                    !Array.isArray(obj[i['FORM']]) ?
                        obj[i['FORM']] = [i] :
                        obj[i['FORM']].push(i));

                setDB(obj);
                setIsCatalogLoaded(true);
            })();
        }

    }, []);

    useEffect(() => {

        if(isCatalogLoaded){
            getRandomPainting()
                .then(()=> setInterval(getRandomPainting, imageChangeDuration));
        }

    }, [isCatalogLoaded]);

    useEffect(() => {

        if(imageChangeInterval !== null) clearInterval(imageChangeInterval);
        imageChangeInterval = setInterval(getRandomPainting,imageChangeDuration);

    }, [imageChangeDuration]);


    return(
        <>
            <figure className="fig">
                <img id="frame" src={imageSrc} alt="empty-wga-frame"/>
                <figcaption
                    ref={figCaptionRef}
                    className={`figCaption ${captionIsVisible ? "" : "d-none" }`}
                >
                </figcaption>
            </figure>
        </>
    )
}

export default Figure;