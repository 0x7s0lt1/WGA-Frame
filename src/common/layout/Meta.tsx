import Head from "next/head";
import {FC, useEffect} from "react";

type Props = {
    title: string;
    description: string;
    favIcon?: string;
}
const Meta : FC<Props> = ({
                              title = "WGAF",
                              description = "WGAF",
                              favIcon = "/img/favicon.ico"
                          }) => {

    return (
        <Head>

            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="icon" href={favIcon} />
            <script src="/js/ambient.min.js"></script>

        </Head>
    )
}

export default Meta;