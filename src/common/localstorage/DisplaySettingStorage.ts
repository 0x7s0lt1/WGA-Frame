import DisplayOptionsType from "@/interfaces/DisplayOptionsType";
import LocalStorage from "@/interfaces/LocalStorage";


class DisplaySettingStorage implements LocalStorage {

    static STORAGE_KEY = "displaySetting";

    static CAPTION_IS_VISIBLE_KEY = "captionIsVisible";
    static BACKGROUND_COLOR_KEY = "backgroundColor";

    static defaultOptions: DisplayOptionsType = {
        captionIsVisible: true,
        backgroundColor: "#99cccc"
    };

    static async getSetting(setting_key: string): Promise<any>  {
        return new Promise(async (resolve) => {
            const storage : DisplayOptionsType = await this.getStorage();

            // @ts-ignore
            resolve( storage[setting_key] );
        });
    }

    static async setSetting(setting_key: string, value: any): Promise<void>{
        return new Promise(async (resolve) => {
            const storage : DisplayOptionsType = await this.getStorage();

            // @ts-ignore
            storage[setting_key] = value;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storage));

            resolve();
        })

    }
    static async getOptions(): Promise<DisplayOptionsType>{
        return await this.getStorage();
    }

    static async getStorage(): Promise<DisplayOptionsType> {
        return new Promise((resolve) => {
            const storage = localStorage.getItem(this.STORAGE_KEY);
            if (storage === null) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.defaultOptions));
                resolve(this.defaultOptions);
            }
            resolve(JSON.parse(storage!) as DisplayOptionsType);
        })

    }

}

export default DisplaySettingStorage;