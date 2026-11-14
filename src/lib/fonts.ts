import { Cinzel, Roboto } from "next/font/google";

// Declared once: every next/font call creates its own @font-face set.
export const roboto = Roboto({ weight: ["100", "300"], subsets: ["latin", "latin-ext"], display: "swap" });
export const cinzel = Cinzel({ weight: "400", subsets: ["latin"], display: "swap" });
