import useCursor from "@/hooks/use-cursor";

export default function Header() {

    const { hideMenu } = useCursor();

    return (
        <header className="header bg-wga-blue">
            <a className="header-link" href="https://www.wga.hu/" target="_blank" rel="noreferrer" aria-label="Web Gallery of Art" />
            {/* Touch screens only (see CSS): there's no mouse-out to hide the menu. */}
            <button className="header-close" onClick={hideMenu} aria-label="Hide menu">×</button>
        </header>
    );
}
