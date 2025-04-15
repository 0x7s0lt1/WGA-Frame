import Head from "next/head";
import useSettings from "@/hooks/use-settings";

type Props = {
    title?: string;
    description?: string;
    favIcon?: string;
}
export default function Meta({title = "WGA - Frame",description = "The Web Gallery of Art in a Frame", favIcon = "/img/favicon.ico" }: Props){

    const { backgroundColor } = useSettings();
    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="icon" href={favIcon} />
            <meta name="theme-color" content={backgroundColor} />
        </Head>
    )
}