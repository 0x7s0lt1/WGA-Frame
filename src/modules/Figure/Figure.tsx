import React, {FC, useEffect, useRef, useState} from "react";
import CatalogType,{CatalogTypeKeys} from "@/interfaces/CatalogType";

type Props = {
    captionIsVisible: boolean
    children?: React.ReactNode|null
}
const Figure: FC<Props> = ({children,captionIsVisible}) => {

    const BASE_URL = "https://www.wga.hu/";

    const figCaptionRef = useRef<any>();

    let imageChangeInterval: any = null;

    const [imageChangeDuration,setImageChangeDuration] = useState<number>(10000);
    const [isCatalogeLoaded, setIsCatalogeLoaded] = useState<boolean>(false);
    const [imageSrc,setImageSrc] = useState<string>("/img/loading-c.svg");
    const [db,setDB] = useState<CatalogType>();

    const getImageFromURL = async (url: string): Promise<any> => {

        const response= await fetch("https://wgaf.onrender.com/art/from-link",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({link:url})
        });

        const json = await response.json();

        setImageSrc(BASE_URL + json.url);
    };

    const getRandomPainting = async (): Promise<any> =>{

        if(db !== undefined && figCaptionRef.current !== undefined) {

            setImageSrc("/img/loading-c.svg");

            const ran = db.painting[Math.floor(Math.random() * db.painting.length )];

            if(figCaptionRef.current !== null){
                figCaptionRef.current.innerHTML = ran.AUTHOR + " - " + ran.TITLE + "<br>" + ran.DATE;
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
                for (const key in CatalogTypeKeys) {
                    obj[key] = cataloge.filter((i: any) => i.FORM === key).sort();
                }

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
                <img id="frame" src={imageSrc} alt="empty-wga-frame"/>
                { captionIsVisible && <figcaption ref={figCaptionRef} className="figCaption"></figcaption> }
            </figure>
        </>
    )
}

export default Figure;