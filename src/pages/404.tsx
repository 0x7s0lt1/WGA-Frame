import { ERROR_IMG } from "@/lib/utils";
import Link from "next/link";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { roboto } from "@/lib/fonts";

export default function Custom404() {

    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => router.replace("/"), 5000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex item-center w-screen h-screen">
            <Head>
                <title>404 Not Found | WGA - Frame</title>
            </Head>
            <div className="flex flex-wrap item-center">
                <Link href="/">
                    <img src={ERROR_IMG} alt="404" height={450} />
                </Link>
                <h1 className={`${roboto.className} color-white text-center bg-black fb-100 mt-2`}>
                    404 Not Found
                </h1>
            </div>
        </div>
    );
}
