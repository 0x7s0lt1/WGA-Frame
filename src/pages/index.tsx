"use client"

import Meta from "@/componets/Meta";
import Sidebar from "@/componets/sidebar/Sidebar";
import Figure from "@/componets/Figure";
import useCursor from "@/hooks/use-cursor";

export default function Index(){

    const { isMenuHidden } = useCursor();

    return (
        <>
            <Meta />
            { !isMenuHidden && <Sidebar/> }
            <Figure/>
        </>
    )
}