"use client";
import { useState, useEffect } from "react";
import CatalogType from "@/types/catalog/CatalogType";
import {CATALOG_URL} from "@/lib/utils";

export default function useCatalog(){

    const [isCatalogLoaded, setIsCatalogLoaded] = useState<boolean>(false);
    const [catalog,setCatalog] = useState<CatalogType>();

    useEffect(() => {

        (async ()=>{

            if(!isCatalogLoaded){
                const response = await fetch(CATALOG_URL);
                const json = await response.json();

                let obj: any = {};
                json.forEach( (i: any) =>
                    !Array.isArray(obj[i['FORM']]) ?
                        obj[i['FORM']] = [i] :
                        obj[i['FORM']].push(i));

                setCatalog(obj);
                setIsCatalogLoaded(true);
            }

        })();

        return () => {
            setIsCatalogLoaded(false);
        }

    }, []);

    return { isCatalogLoaded, catalog }
}