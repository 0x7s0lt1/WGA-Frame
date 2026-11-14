import Meta from "@/componets/Meta";
import Sidebar from "@/componets/sidebar/Sidebar";
import Figure from "@/componets/Figure";
import Stage from "@/componets/Stage";
import useKeyboardShortcuts from "@/hooks/use-keyboard-shortcuts";
import CursorProvider from "@/contexts/cursor-provider";
import HistoryProvider from "@/contexts/history-provider";
import ControlProvider from "@/contexts/control-provider";
import SettingsProvider from "@/contexts/settings-provider";
import CatalogProvider from "@/contexts/catalog-provider";

// Providers live here rather than in _app, so other pages (404) don't load the catalogue.
export default function Index() {
    return (
        <SettingsProvider>
            <CatalogProvider>
                <HistoryProvider>
                    <ControlProvider>
                        <CursorProvider>
                            <Frame />
                        </CursorProvider>
                    </ControlProvider>
                </HistoryProvider>
            </CatalogProvider>
        </SettingsProvider>
    );
}

function Frame() {

    useKeyboardShortcuts();

    return (
        <>
            <Meta />
            <Sidebar />
            <Stage>
                <Figure />
            </Stage>
        </>
    );
}
