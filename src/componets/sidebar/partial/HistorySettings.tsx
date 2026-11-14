import useControl from "@/hooks/use-control";
import useHistory from "@/hooks/use-history";

export default function HistorySettings() {

    const { canGoBack, canGoForward } = useHistory();
    const { isPaused, togglePaused, next, back, isLoading } = useControl();

    return (
        <table className="w-100">
            <tbody>
            <tr>
                <td className="text-center">
                    <button className="btn-green" onClick={back} disabled={!canGoBack} title="Previous artwork (←)">
                        back
                    </button>
                </td>
                <td className="text-center">
                    <button className="btn-green" onClick={togglePaused} title="Play / pause (Space)">
                        {isPaused ? "play" : "pause"}
                    </button>
                </td>
                <td className="text-center">
                    {/* At the end of the history "next" picks a new random artwork. */}
                    <button
                        className="btn-green"
                        onClick={next}
                        disabled={!canGoForward && isLoading}
                        title={canGoForward ? "Next artwork (→)" : "New random artwork (→)"}
                    >
                        next
                    </button>
                </td>
            </tr>
            </tbody>
        </table>
    );
}
