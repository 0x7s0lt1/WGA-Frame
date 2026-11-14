import { CSSProperties, useEffect, useRef, useState } from "react";
import { PaletteColor } from "@/types/catalog/CatalogItemType";
import { copyText } from "@/lib/utils";

/** Colours shown; the palette keeps up to 8 but 6 reads better as a strip. */
const MAX_SWATCHES = 6;

type Props = { colors: PaletteColor[] };

/** The artwork's dominant colours. Click a swatch to copy its hex code. */
export default function Palette({ colors }: Props) {

    const [copied, setCopied] = useState<string | null>(null);
    const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    useEffect(() => () => clearTimeout(resetTimer.current), []);

    const shown = colors.slice(0, MAX_SWATCHES);

    const copy = async (text: string, key: string) => {
        const ok = await copyText(text);
        setCopied(ok ? key : "failed");
        clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setCopied(null), 1500);
    };

    return (
        <div className="palette" role="group" aria-label="Colour palette">
            {shown.map(({ hex, weight }) => (
                <button
                    key={hex}
                    type="button"
                    className={`palette-swatch ${copied === hex ? "is-copied" : ""}`}
                    style={{ "--swatch": hex } as CSSProperties}
                    onClick={() => copy(hex, hex)}
                    title={`${hex} · ${Math.round(weight * 100)}% of the image. Click to copy`}
                    aria-label={`Copy ${hex}`}
                >
                    <span className="palette-chip" aria-hidden="true" />
                    <span className="palette-hex">{copied === hex ? "copied" : hex}</span>
                </button>
            ))}
            <button
                type="button"
                className={`palette-copy-all ${copied === "all" ? "is-copied" : ""}`}
                onClick={() => copy(shown.map(({ hex }) => hex).join(", "), "all")}
                title="Copy all colours"
            >
                {copied === "all" ? "copied" : <><span className="palette-copy-word">copy </span>all</>}
            </button>
            <span className="visually-hidden" aria-live="polite">
                {copied === "failed" ? "Copying failed" : copied ? `Copied ${copied === "all" ? "all colours" : copied}` : ""}
            </span>
        </div>
    );
}
