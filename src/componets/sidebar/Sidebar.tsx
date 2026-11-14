import Header from "@/componets/Header";
import useCursor from "@/hooks/use-cursor";
import DisplaySettings from "@/componets/sidebar/partial/DisplaySettings";
import IntervalSettings from "@/componets/sidebar/partial/IntervalSettings";
import CategorySettings from "@/componets/sidebar/partial/CategorySettings";
import ColorSettings from "@/componets/sidebar/partial/ColorSettings";
import SidebarFooter from "@/componets/sidebar/partial/SidebarFooter";
import { roboto } from "@/lib/fonts";

export default function Sidebar() {

    const { isMenuHidden, setIsCursorOnNav } = useCursor();

    // Always mounted (hidden with CSS) so it can fade, and keeps focus/scroll state.
    // `inert` keeps the hidden menu out of the tab order and away from screen readers.
    return (
        <aside
            className={`sidebar ${isMenuHidden ? "is-hidden" : ""}`}
            inert={isMenuHidden}
            onPointerEnter={() => setIsCursorOnNav(true)}
            onPointerLeave={() => setIsCursorOnNav(false)}
        >
            <Header />

            <nav className={`nav flex color-white bg-wga-blue ${roboto.className}`} aria-label="Frame settings">
                <DisplaySettings />
                <IntervalSettings />
                <CategorySettings />
                <ColorSettings />
                <SidebarFooter />
            </nav>
        </aside>
    );
}
