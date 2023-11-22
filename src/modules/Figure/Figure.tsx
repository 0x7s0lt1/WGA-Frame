import React, {FC, useEffect, useRef, useState} from "react";
import CatalogType,{CatalogTypeKeys} from "@/interfaces/CatalogType";

type Props = {
    captionIsVisible: boolean
}
const Figure: FC<Props> = ({captionIsVisible}) => {

    const BASE_URL = "https://www.wga.hu/";
    const LOADING_IMG = "/img/loading-c.svg";

    const figCaptionRef = useRef<any>();

    let imageChangeInterval: any = null;

    const [imageChangeDuration,setImageChangeDuration] = useState<number>(3600000); // 1h
    const [isCatalogeLoaded, setIsCatalogeLoaded] = useState<boolean>(false);
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
            
        };
    };

    useEffect(() => {

        if(!isCatalogeLoaded){
            (async ()=>{
                const response = await fetch('/json/catalog.json');
                const cataloge = await response.json();

                let obj: any = {};
                cataloge.forEach( (i: any) =>
                    !Array.isArray(obj[i['FORM']]) ?
                        obj[i['FORM']] = [i] :
                        obj[i['FORM']].push(i));

                setDB(obj);
                setIsCatalogeLoaded(true);
            })();
        }

    }, []);

    useEffect(() => {

        if(isCatalogeLoaded){
            getRandomPainting();
            setInterval(getRandomPainting,imageChangeDuration);
        }

    }, [isCatalogeLoaded]);

    useEffect(() => {

        if(imageChangeInterval !== null) clearInterval(imageChangeInterval);
        imageChangeInterval = setInterval(getRandomPainting,imageChangeDuration);

    }, [imageChangeInterval]);

    return(
        <>
            <figure className="fig">
                <img id="frame" src={imageSrc} alt="empty-wga-frame" data-ambient/>
                { captionIsVisible && 
                    <figcaption ref={figCaptionRef} className="figCaption"></figcaption> 
                }
            </figure>
        </>
    )
}

export default Figure;