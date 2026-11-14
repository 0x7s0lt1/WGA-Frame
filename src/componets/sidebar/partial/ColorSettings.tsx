import { CSSProperties } from "react";
import useCatalog from "@/hooks/use-catalog";
import { cinzel } from "@/lib/fonts";
import { formatNumber } from "@/lib/utils";

export default function ColorSettings() {

    const { catalog, colorIndex, colorBuckets, selectedColors, toggleColor, clearColors, colorCounts } = useCatalog();

    // No palettes in this catalogue (run `pnpm palettes`): nothing to filter by.
    if (!catalog?.palettes) return null;

    const labels = colorBuckets.filter(({ id }) => selectedColors.includes(id)).map(({ label }) => label.toLowerCase());

    return (
        <fieldset className="mt-2 border-green">
            <legend className={cinzel.className}>Colors</legend>

            {!colorIndex && <p className="category-note">Loading colours…</p>}

            {colorIndex && (
                <>
                    <div className="color-grid" role="group" aria-label="Filter by colour">
                        {colorBuckets.map(({ id, label, hex }) => {
                            const selected = selectedColors.includes(id);
                            const count = colorCounts[id] ?? 0;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    className="color-swatch"
                                    style={{ "--swatch": hex } as CSSProperties}
                                    aria-pressed={selected}
                                    // Adding a colour that leaves nothing to show isn't useful; removing always is.
                                    disabled={!selected && count === 0}
                                    onClick={() => toggleColor(id)}
                                    title={`${label}: ${formatNumber(count)} artworks`}
                                    aria-label={`${label}, ${formatNumber(count)} artworks`}
                                />
                            );
                        })}
                    </div>

                    <p className="category-note">
                        {labels.length
                            ? `With ${labels.join(" + ")}`
                            : "Pick colours to show artworks that contain them"}
                    </p>
                    {selectedColors.length > 0 && (
                        <div className="category-actions mt-1">
                            <button className="btn-green" onClick={clearColors}>clear colours</button>
                        </div>
                    )}
                    {colorIndex.coverage < catalog.total && (
                        <p className="category-note">
                            Colour data for {formatNumber(colorIndex.coverage)} of {formatNumber(catalog.total)} artworks
                        </p>
                    )}
                </>
            )}
        </fieldset>
    );
}
