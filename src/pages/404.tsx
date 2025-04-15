import {ERROR_IMG} from "@/lib/utils";
import Link from "next/link";
import {useEffect} from "react";
import { Roboto } from 'next/font/google'
import {useRouter} from "next/router";

const roboto = Roboto({ weight: '100', subsets: ['latin'] })

export default function Custom404() {

    const router = useRouter();

    useEffect(()=>{
        setTimeout(()=>{
           router.push("/");
        }, 5000);
    },[]);

    return (
       <div className={"flex item-center w-screen h-screen"}>
           <div className={"flex flex-wrap item-center"}>

               <Link href="/">
                   <img src={ERROR_IMG} alt={"404"} height={"450"} />
               </Link>
               <h1 className={` ${roboto.className} color-white text-center bg-black fb-100 mt-2`}>404 Not Found</h1>
           </div>
       </div>
    )
}