import useControl from "@/hooks/use-control";
import { Cinzel } from 'next/font/google'

const cinzel = Cinzel({ weight: '400', subsets: ['latin'] })

export default function IntervalSettings(){

    const { imageChangeDuration, setImageChangeDuration } = useControl();

    const onImageChangeDurationChange = async (event: any): Promise<void> => {
        setImageChangeDuration(parseInt(event.target.value));
    }

    return(
        <fieldset className={"mt-2 border-green"}>
            <legend className={`${cinzel.className}`}>INTERVAL</legend>
            <table className={"w-100"}>
                <tbody>
                <tr>
                    <td className="text-center">
                        <select
                            className={"w-100 bg-light-green"}
                            value={imageChangeDuration.toString()}
                            onChange={onImageChangeDurationChange}
                        >
                            <option value="60000">1m</option>
                            <option value="300000">5m</option>
                            <option value="600000">10m</option>
                            <option value="900000">15m</option>
                            <option value="1800000">30m</option>
                            <option value="2700000">45m</option>
                            <option value="3600000">1h</option>
                            <option value="7200000">2h</option>
                            <option value="43200000">12h</option>
                            <option value="86400000">24h</option>
                        </select>
                    </td>
                </tr>
                </tbody>
            </table>
        </fieldset>
    )
}