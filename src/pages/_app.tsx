import type { AppProps } from 'next/app'
import '../styles/globals.css'

// TODO:
// - Category filter
// - Color palette
// - Filter by color palette
// ```
export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}