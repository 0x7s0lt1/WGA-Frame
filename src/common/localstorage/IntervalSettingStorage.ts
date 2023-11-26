import LocalStorage from "@/interfaces/LocalStorage";


class IntervalSettingStorage implements LocalStorage {

    static STORAGE_KEY = "intervalSetting";

    static defaultOptions: "3600000"; // 1h

    static async getInterval(): Promise<number>  {
        return new Promise(async (resolve) => {
            resolve( await this.getStorage() );
        });
    }

    static async setInterval(interval: string|number): Promise<void>{
        return new Promise(async (resolve) => {

            localStorage.setItem(IntervalSettingStorage.STORAGE_KEY, interval as string);

            resolve();
        })

    }

    static async getStorage(): Promise<number> {
        return new Promise((resolve) => {
            const interval = localStorage.getItem(IntervalSettingStorage.STORAGE_KEY);
            if (interval === null) {
                localStorage.setItem(IntervalSettingStorage.STORAGE_KEY, this.defaultOptions);
                resolve(parseInt(this.defaultOptions));
            }

            resolve(parseInt(interval!));
        })

    }

}

export default IntervalSettingStorage;