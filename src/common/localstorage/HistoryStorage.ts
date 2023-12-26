import LocalStorage from "@/interfaces/LocalStorage";
import { rejects } from "assert";


class HistoryStorage implements LocalStorage {

    static STORAGE_KEY = "history";

    static defaultValue = "[]";

    static async getHistory(): Promise<number>  {
        return new Promise(async (resolve) => {
            resolve( await this.getStorage() );
        });
    }

    static async setHistory(elem: string|number): Promise<void>{
        return new Promise(async (resolve) => {

            localStorage.setItem(this.STORAGE_KEY, elem as string);

            resolve();
        })

    }

    
    static async addToHistory(elem: string): Promise<void>{
        return new Promise(async (resolve,rejects) => {

           try{

            this.getHistory().then((history) => {

                Array.from(history as any).push(elem);
                resolve();
                
            });

           }catch(e){
                rejects()
           }

        })

    }

    
    static async removeFromHistory(elem: string): Promise<void>{
        return new Promise(async (resolve,rejects) => {

            try{
                this.getHistory().then((history) => {

                    Array.from(history as any).filter((item) => item !== elem);
    
                    resolve();
                });
            }catch(e){
                rejects();
            }
        
        });

    }

    static async getStorage(): Promise<number> {
        return new Promise((resolve) => {
            const history = localStorage.getItem(this.STORAGE_KEY);
            if (history === null) {
                localStorage.setItem(this.STORAGE_KEY, this.defaultValue);
                resolve(JSON.parse(this.defaultValue));
            }

            resolve(JSON.parse(history!));
        })

    }

}

export default HistoryStorage;