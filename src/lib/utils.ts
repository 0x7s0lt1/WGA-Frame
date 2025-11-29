
export const BASE_URL = "https://www.wga.hu/";
export const PROXY_URL = (process.env.NEXT_PUBLIC_PROXY_URL + "/api/proxy/?url=");
export const LOADING_IMG = "/img/loading.svg";
export const ERROR_IMG = "/img/error.webp";
export const CATALOG_URL = '/json/catalog.min.json';
export const getImageFromURL = async (url: string): Promise<string> => {

    try{

        const response= await fetch(PROXY_URL + url);
        const content = await response.text();

        const href = new DOMParser()
            .parseFromString(content, "text/html")
            .querySelectorAll('tbody')[1]
            .querySelector('a')
            ?.getAttribute('href');

        return BASE_URL + href;

    }catch (e){
        console.log(e);
        return ERROR_IMG;
    }

};


