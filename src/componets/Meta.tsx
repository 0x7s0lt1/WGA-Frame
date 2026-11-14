import Head from "next/head";
import useSettings from "@/hooks/use-settings";
import useHistory from "@/hooks/use-history";

type Props = {
    title?: string;
    description?: string;
    favIcon?: string;
};

export default function Meta({ title = "WGA - Frame", description = "The Web Gallery of Art in a Frame", favIcon = "/img/favicon.ico" }: Props) {

    const { backgroundColor } = useSettings();
    const { currentItem } = useHistory();

    return (
        <Head>
            <title>{currentItem ? `${currentItem.title} - ${currentItem.author} | ${title}` : title}</title>
            <meta name="description" content={description} />
            {/* viewport-fit=cover lets the artwork use the whole screen around notches (see --safe-* in CSS). */}
            <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
            <link rel="icon" href={favIcon} sizes="16x16" />
            <link rel="icon" href="/img/icons/icon-192.png" type="image/png" sizes="192x192" />
            <meta name="theme-color" content={backgroundColor} />

            {/* Installable app ("Add to Home Screen"): opens fullscreen, without browser bars. */}
            <link rel="manifest" href="/manifest.webmanifest" />
            <link rel="apple-touch-icon" href="/img/icons/apple-touch-icon.png" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-title" content="WGA Frame" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

            <link rel="preconnect" href="https://www.wga.hu" />
        </Head>
    );
}
