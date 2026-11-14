import useControl from "@/hooks/use-control";
import useNow from "@/hooks/use-now";
import HistorySettings from "@/componets/sidebar/partial/HistorySettings";
import { INTERVAL_OPTIONS } from "@/contexts/control-provider";
import { formatDuration, LOADING_WHITE_IMG } from "@/lib/utils";
import { cinzel } from "@/lib/fonts";

export default function IntervalSettings() {

    const { imageChangeDuration, setImageChangeDuration, isLoading, hasError, isPaused, nextChangeAt } = useControl();
    const now = useNow(30_000);

    const countdown = isPaused
        ? "Paused"
        : nextChangeAt && now ? `Next artwork in ${formatDuration(nextChangeAt - now)}` : null;

    return (
        <fieldset className="mt-2 border-green">
            <legend className={cinzel.className}>
                Refresh
                {isLoading && <img className="legend-status" src={LOADING_WHITE_IMG} alt="Loading" width={14} height={14} />}
                {!isLoading && hasError && <span className="legend-status color-orange" title="Last load failed, retrying">!</span>}
            </legend>
            <table className="w-100 mb-1">
                <tbody>
                <tr>
                    <td className="text-center">
                        <select
                            className="w-100 bg-light-green"
                            aria-label="Change artwork every"
                            value={imageChangeDuration}
                            onChange={(event) => setImageChangeDuration(Number(event.target.value))}
                        >
                            {INTERVAL_OPTIONS.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </td>
                </tr>
                </tbody>
            </table>
            <HistorySettings />
            {countdown && <p className="category-note">{countdown}</p>}
        </fieldset>
    );
}
