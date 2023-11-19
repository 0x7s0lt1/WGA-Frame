import React, {FC, useEffect, useRef, useState} from "react";
import axios from "axios";
import style from './Figure.module.css';

type Props = {
    captionIsVisible: boolean
    children?: React.ReactNode|null
}
const Figure: FC<Props> = ({children,captionIsVisible}) => {

    const BASE_URL = "https://www.wga.hu/";

    const figCaptionRef = useRef();

    let imageChangeInterval = null;

    const [imageChangeDuration,setImageChangeDuration] = useState<number>(10000);
    const [isCatalogeLoaded, setIsCatalogeLoaded] = useState<boolean>(false);
    const [imageSrc,setImageSrc] = useState<string>("/img/loading-white.svg");
    const [db,setDB] = useState<object>({
        achitecture: null,
        ceramics : null,
        furniture : null,
        glassware : null,
        graphics : null,
        illumination : null,
        metalwork : null,
        mosic : null,
        painting : null,
        sculpture : null,
        stained_glass : null,
        tapestry : null,
    });

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

        setImageSrc("/img/loading-white.svg");

        const ran = db.painting[Math.floor(Math.random() * db.painting.length )];

        figCaptionRef.current.innerHTML = ran.AUTHOR + " - " + ran.TITLE + "<br>" + ran.DATE;

        await getImageFromURL(ran.URL);
    };

    useEffect(() => {

        if(!isCatalogeLoaded){
            (async ()=>{
                const response = await fetch('/json/catalog.json');
                const cataloge = await response.json();

                Object.keys( db ).forEach(key =>{
                    db[key] = cataloge.filter(i => i.FORM === key);
                });

                setDB(db);
                setIsCatalogeLoaded(true);
            })();
        }

    }, []);

    useEffect(() => {

        if(isCatalogeLoaded){
            getRandomPainting();
        }

    }, [isCatalogeLoaded]);

    useEffect(() => {

        if(imageChangeInterval !== null) clearInterval(imageChangeInterval);
        imageChangeInterval = setInterval(getRandomPainting,imageChangeDuration);

    }, [imageChangeInterval]);

    return(
        <>
            <figure className={style.fig}>
                <img id="frame" src={imageSrc} alt="empty-wga-frame"/>
                { captionIsVisible && <figcaption ref={figCaptionRef} className={style.figCaption}></figcaption> }
            </figure>
        </>
    )
}

export default Figure;