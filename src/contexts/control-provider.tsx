"use client";
import { createContext, useState } from "react";
export const ControlContext = createContext({} as any);

export default function ControlProvider({ children }: any) {

    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [imageChangeDuration,setImageChangeDuration] = useState<number>( 300000 ); // 5p

    return <ControlContext.Provider
        value={{
            isPaused,
            setIsPaused,
            imageChangeDuration,
            setImageChangeDuration,
        }}>
        {children}
    </ControlContext.Provider>;
}