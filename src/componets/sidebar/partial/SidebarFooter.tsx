import Image from "next/image";
import useCatalog from "@/hooks/use-catalog";
import { formatNumber } from "@/lib/utils";

export default function SidebarFooter() {

    const { catalog } = useCatalog();

    return (
        <section className="text-center nav-footer">
            <p className="touch-hint">Tap the artwork to show or hide this menu. Swipe for next / previous.</p>
            <Image className="mt-2" src="/img/kockak.gif" alt="" width={20} height={10} unoptimized />
            <a
                href="https://www.wga.hu/"
                target="_blank"
                rel="noreferrer"
                className="font-arial color-white fw-light mt-1"
            >
                Web Gallery of Art
            </a>
            {catalog && (
                <span className="catalog-info">
                    {formatNumber(catalog.total)} artworks{catalog.updated && ` · catalogue ${catalog.updated}`}
                </span>
            )}
            <a href="https://github.com/0x7s0lt1/WGA-Frame" target="_blank" rel="noreferrer" className="mt-1" aria-label="Source on GitHub">
                <Image src="/img/github-icon.svg" alt="" width={20} height={20} />
            </a>
        </section>
    );
}
