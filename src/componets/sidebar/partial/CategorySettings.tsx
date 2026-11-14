import useCatalog from "@/hooks/use-catalog";
import { cinzel } from "@/lib/fonts";
import { formatNumber } from "@/lib/utils";

export default function CategorySettings() {

    const {
        isCatalogLoaded, categories, selectedCategories, toggleCategory,
        selectAllCategories, resetCategories, equalMix, setEqualMix, poolSize,
        categoryCounts, selectedColors,
    } = useCatalog();
    const filtered = selectedColors.length > 0;

    const allSelected = selectedCategories.length === categories.length;

    return (
        <fieldset className="mt-2 border-green">
            <legend className={cinzel.className}>Categories</legend>

            {!isCatalogLoaded && <p className="category-note">Loading catalogue…</p>}

            {isCatalogLoaded && (
                <>
                    <table className="w-100 settings-table category-table">
                        <tbody>
                        {categories.map(({ id, label, count }) => {
                            const checked = selectedCategories.includes(id);
                            const isLast = checked && selectedCategories.length === 1;
                            return (
                                <tr key={id} className={checked ? "is-selected" : undefined}>
                                    <td>
                                        <label htmlFor={`category-${id}`}>{label}</label>
                                    </td>
                                    <td
                                        className="category-count"
                                        title={filtered ? `${formatNumber(categoryCounts[id] ?? 0)} of ${formatNumber(count)} match the colours` : undefined}
                                    >
                                        {formatNumber(filtered ? categoryCounts[id] ?? 0 : count)}
                                    </td>
                                    <td className="text-center">
                                        <input
                                            id={`category-${id}`}
                                            type="checkbox"
                                            checked={checked}
                                            disabled={isLast}
                                            title={isLast ? "At least one category stays selected" : undefined}
                                            onChange={() => toggleCategory(id)}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    <table className="w-100 settings-table mt-1">
                        <tbody>
                        <tr>
                            <td>
                                <label
                                    htmlFor="category-equal-mix"
                                    title="Show each selected category equally often, so small ones like Tapestry aren't drowned out by Painting"
                                >
                                    Equal mix
                                </label>
                            </td>
                            <td className="text-center">
                                <input
                                    id="category-equal-mix"
                                    type="checkbox"
                                    checked={equalMix}
                                    disabled={selectedCategories.length < 2}
                                    onChange={(event) => setEqualMix(event.target.checked)}
                                />
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <div className="category-actions mt-1">
                        <button className="btn-green" onClick={selectAllCategories} disabled={allSelected}>all</button>
                        <button className="btn-green" onClick={resetCategories} title="Paintings only">reset</button>
                    </div>

                    <p className={`category-note ${poolSize === 0 ? "color-orange" : ""}`}>
                        {poolSize === 0
                            ? "No artwork matches: remove a colour or add categories"
                            : `${formatNumber(poolSize)} artworks in rotation`}
                    </p>
                </>
            )}
        </fieldset>
    );
}
