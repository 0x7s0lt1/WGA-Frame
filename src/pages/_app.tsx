import type { AppProps } from 'next/app'
import '../styles/globals.css'
import CursorProvider from "@/contexts/cursor-provider";
import HistoryProvider from "@/contexts/history-provider";
import ControlProvider from "@/contexts/control-provider";
import SettingsProvider from "@/contexts/settings-provider";

// TODO:
// - Category filter
// - Color palette
// - Filter by color palette
// ```
export default function App({ Component, pageProps }: AppProps) {
    return (
        <SettingsProvider>
            <HistoryProvider>
                <ControlProvider>
                    <CursorProvider>
                        <Component {...pageProps} />
                    </CursorProvider>
                </ControlProvider>
            </HistoryProvider>
        </SettingsProvider>
    )
}