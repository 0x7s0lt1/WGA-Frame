import useControl from "@/hooks/use-control";
import useHistory from "@/hooks/use-history";

export default function HistorySettings(){

    const { history, currentItem, setCurrentItem } = useHistory();
    const { isPaused, setIsPaused } = useControl();

    const handlePrev = () => {
        setCurrentItem( history[history.indexOf(currentItem!) - 1]);
    };

    const handlePlayPause = () => {
        setIsPaused(!isPaused);
    };

    const handleNext = () => {
        setCurrentItem( history[history.indexOf(currentItem!) + 1]);
    };

    return(
        <table className={"w-100"}>
            <tbody>
            <tr>
                <td className="text-center">
                    <button
                        className="btn-green"
                        onClick={handlePrev}
                        disabled={history.indexOf(currentItem!) === 0}
                    >
                        back
                    </button>
                </td>
                <td className="text-center">
                    <button
                        className="btn-green"
                        onClick={handlePlayPause}
                    >
                        { isPaused ? "play" : "pause" }
                    </button>
                </td>
                <td className="text-center">
                    <button
                        className="btn-green"
                        onClick={handleNext}
                        disabled={history.indexOf(currentItem!) === history.length - 1}
                    > next
                    </button>
                </td>
            </tr>
            </tbody>
        </table>
    )
}