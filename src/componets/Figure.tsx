import { useState } from "react";
import useHistory from "@/hooks/use-history";
import useSettings from "@/hooks/use-settings";
import useCatalog from "@/hooks/use-catalog";
import useControl from "@/hooks/use-control";
import Palette from "@/componets/Palette";
import { ERROR_IMG, LOADING_IMG } from "@/lib/utils";
import { roboto } from "@/lib/fonts";

export default function Figure() {

    const { captionIsVisible, ambientIsVisible, ambientLevel, paletteIsVisible } = useSettings();
    const { currentItem } = useHistory();
    const { error: catalogError, poolSize, isReady } = useCatalog();
    const { hasError } = useControl();

    // Images are preloaded before they're shown, so this only catches rare late failures.
    const [brokenImage, setBrokenImage] = useState<string | null>(null);

    const imageSrc = !currentItem
        ? LOADING_IMG
        : brokenImage === currentItem.imageUrl ? ERROR_IMG : currentItem.imageUrl;

    const status = catalogError
        ?? (!currentItem && isReady && poolSize === 0 ? "No artwork matches the selected colours." : null)
        ?? (!currentItem && hasError ? "Could not reach wga.hu. Retrying…" : null);

    // Fit the box to the artwork (instead of a fixed 90vh letterbox) so the caption sits right under it.
    const ratio = currentItem?.width && currentItem.height ? currentItem.width / currentItem.height : null;
    // --frame-w / --frame-h are set per screen size in globals.css.
    const sizeStyle = ratio
        ? { width: `min(var(--frame-w), calc((var(--frame-h) - var(--frame-reserve)) * ${ratio.toFixed(4)}))`, aspectRatio: ratio }
        : undefined;
    const sizeClass = ratio ? "is-sized" : undefined;

    const showCaption = captionIsVisible && currentItem;
    const showPalette = paletteIsVisible && currentItem && currentItem.palette.length > 0;

    return (
        <figure className={`fig ${showPalette ? "has-palette" : ""}`} aria-live="polite" data-ambient-level={ambientLevel}>
            {ambientIsVisible && currentItem && (
                <img
                    key={`bg-${imageSrc}`}
                    id="frame-bg"
                    className={sizeClass}
                    style={sizeStyle}
                    src={imageSrc}
                    alt=""
                    aria-hidden="true"
                />
            )}
            <img
                key={imageSrc}
                id="frame"
                className={sizeClass}
                style={sizeStyle}
                src={imageSrc}
                alt={currentItem ? `${currentItem.title} by ${currentItem.author}` : "Loading"}
                onError={() => currentItem && setBrokenImage(currentItem.imageUrl)}
            />
            {status && (
                <figcaption className={`figCaption bg-black color-white ${roboto.className}`}>{status}</figcaption>
            )}
            {!status && (showCaption || showPalette) && (
                <figcaption className={`figCaption bg-black color-white ${roboto.className}`}>
                    {showCaption && (
                        <div className="caption-text">
                            <a href={currentItem.url} target="_blank" rel="noreferrer" title="Open on wga.hu">
                                <span className="caption-author">{currentItem.author}</span>
                                {" - "}
                                <cite>{currentItem.title}</cite>
                                {currentItem.date && ` - ${currentItem.date}`}
                            </a>
                            {(currentItem.technique || currentItem.location) && (
                                <small className="caption-details">
                                    {[currentItem.technique, currentItem.location].filter(Boolean).join(" · ")}
                                </small>
                            )}
                        </div>
                    )}
                    {showPalette && <Palette key={currentItem.id} colors={currentItem.palette} />}
                </figcaption>
            )}
        </figure>
    );
}
