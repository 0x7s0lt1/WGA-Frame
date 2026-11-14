export type PaletteColor = {
    hex: string;
    /** Share of the image, 0–1. */
    weight: number;
};

/** An artwork ready to display (and the unit stored in the history). */
type CatalogItemType = {
    /** Path inside wga.hu, unique per artwork, e.g. "a/aachen/adonis". */
    id: string;
    category: string;
    /** Row number inside its category (used by the colour filter). */
    position?: number;
    author: string;
    title: string;
    date: string;
    technique: string;
    location: string;
    /** The artwork's page on wga.hu. */
    url: string;
    imageUrl: string;
    /** Dominant colours, most prominent first (empty when not computed yet). */
    palette: PaletteColor[];
    /** Natural image size, known once the image has been preloaded. */
    width?: number;
    height?: number;
};

export default CatalogItemType;
