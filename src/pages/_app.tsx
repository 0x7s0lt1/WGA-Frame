import type { AppProps } from 'next/app'
import '../styles/globals.css'
import '../styles/ambient.min.css'


// TODO:
// - Category filter
// - Ambient background start fix
// - Color palette
// - Filter by color palette
// ```
export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}