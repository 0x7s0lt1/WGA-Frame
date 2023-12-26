import {FC, useEffect, useRef, useState} from "react";
import CatalogType from "@/interfaces/CatalogType";
import HistoryItemType from "@/interfaces/HistoryItemType";

type Props = {
    imageChangeDuration: number
    captionIsVisible: boolean
    isPaused: boolean
    history: HistoryItemType[]
    setHistory: (value: HistoryItemType[]) => void
    currentItem: HistoryItemType | null
    setCurrentItem: (value: HistoryItemType | null) => void
}
const Figure: FC<Props> = ({
    imageChangeDuration,
     captionIsVisible,
     isPaused,
     history,
     setHistory,
     currentItem,
     setCurrentItem
    }) => {

    const BASE_URL = "https://www.wga.hu/";
    const PROXY_URL = "https://zsoltfehervari.dev/api/proxy/?url=";
    const LOADING_IMG = "/img/loading-c.svg";

    let imageChangeInterval: any = null;

    const figCaptionRef = useRef<any>();

    const [isCatalogLoaded, setIsCatalogLoaded] = useState<boolean>(false);
    const [imageSrc,setImageSrc] = useState<string>(LOADING_IMG);
    const [catalog,setCatalog] = useState<CatalogType>();

    const getImageFromURL = async (url: string): Promise<any> => {
        return new Promise(async (resolve, reject) => {

            try{
                const response= await fetch(PROXY_URL + url);
                const content = await response.text();

                const href = new DOMParser()
                    .parseFromString(content, "text/html")
                    .querySelectorAll('tbody')[1]
                    .querySelector('a')
                    ?.getAttribute('href');

                resolve(BASE_URL + href);
            }catch (e){
                reject(null);
            }

        });
    };

    const getRandomPainting = async (): Promise<any> =>{

        if(catalog !== undefined && figCaptionRef.current !== undefined) {

            setImageSrc(LOADING_IMG);

            const ran_item = catalog.painting[Math.floor(Math.random() * catalog.painting.length )];

            let item: HistoryItemType = {
                name: `${ran_item.AUTHOR} - ${ran_item.TITLE} - ${ran_item.DATE}`, 
                url: await getImageFromURL(ran_item.URL),
            };

            if(figCaptionRef.current !== null){
                figCaptionRef.current.innerHTML = item.name;
            }

            addToHistory(item);
            setCurrentItem(item);

        }
    };

    const addToHistory = (item: HistoryItemType): void => {
        
        if(history.length === 10){
            history.shift();
        }

        history.push(item);

        setHistory(history);
    };

    useEffect(() => {

        if(!isCatalogLoaded){
            (async ()=>{
                const response = await fetch('/json/catalog.min.json');
                const json = await response.json();

                let obj: any = {};
                json.forEach( (i: any) =>
                    !Array.isArray(obj[i['FORM']]) ?
                        obj[i['FORM']] = [i] :
                        obj[i['FORM']].push(i));

                setCatalog(obj);
                setIsCatalogLoaded(true);
            })();
        }

    }, []);

    useEffect(() => {
        
        if(isCatalogLoaded){

            if(isPaused){
                if(imageChangeInterval !== null) clearInterval(imageChangeInterval);
            }else{
                imageChangeInterval = setInterval(getRandomPainting,imageChangeDuration);
            }

        }

    },[isPaused])

    useEffect(() => {

        if(isCatalogLoaded){
            getRandomPainting()
                .then(()=> imageChangeInterval = setInterval(getRandomPainting, imageChangeDuration) );
        }

    }, [isCatalogLoaded]);

    useEffect(() => {

        if(isCatalogLoaded){

            if(imageChangeInterval !== null) clearInterval(imageChangeInterval);
            imageChangeInterval = setInterval(getRandomPainting,imageChangeDuration);
    
        }

    }, [imageChangeDuration]);

    useEffect(() => {

        if(isCatalogLoaded){
            setImageSrc(currentItem?.url ?? LOADING_IMG);
        }

    }, [currentItem]);


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