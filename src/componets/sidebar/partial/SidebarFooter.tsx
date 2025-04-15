import Link from "next/link";
import Image from "next/image";
export default function SidebarFooter(){
    return (
        <section className={"text-center mt-2 flex flex-wrap item-center nav-footer"}>
            <Image className="m-auto mt-2" src="/img/kockak.gif" alt="kocka" width={20} height={10} />
            <Link
                href={"https://www.wga.hu/"}
                target="_blank"
                className={"font-arial color-white fw-light fb-100 mt-1"}
            >
                Web Gallery of Art
            </Link>
            <Link href={"https://github.com/0x7s0lt1/WGA-Frame"} className={"mt-1"}>
                <Image src="/img/github-icon.svg" alt="github" width={20} height={20} />
            </Link>
        </section>
    )
}