import {FC, useEffect} from "react";
import Header from "@/modules/Header/Header";
import Link from "next/link";

import DisplaySettingStorage from "@/common/localstorage/DisplaySettingStorage";
import IntervalSettingStorage from "@/common/localstorage/IntervalSettingStorage";

import HistoryItemType from "@/interfaces/HistoryItemType";

type Props = {
    imageChangeDuration: number
    setImageChangeDuration: (value: number) => void
    captionIsVisible: boolean
    setCaptionIsVisible: (value: boolean) => void
    ambientIsVisible: boolean
    setAmbientIsVisible: (value: boolean) => void
    backgroundColor: string
    setBackgroundColor: (value: string) => void
    isCursorOnNav: boolean
    setIsCursorOnNav: (value: boolean) => void
    history: HistoryItemType[]
    setHistory: (value: HistoryItemType[]) => void
    currentItem: HistoryItemType | null
    setCurrentItem: (value: HistoryItemType | null) => void
    isPaused: boolean,
    setIsPaused: (value: boolean) => void
}
const Nav: FC<Props> = ({
    imageChangeDuration,
    setImageChangeDuration,
    captionIsVisible,
    ambientIsVisible,
    setAmbientIsVisible,
    backgroundColor,
    setCaptionIsVisible,
    setBackgroundColor,
    isCursorOnNav,
    setIsCursorOnNav,
    history,
    setHistory,
    currentItem,
    setCurrentItem,
    isPaused,
    setIsPaused
}) => {


    const onBackGroundColorChange = async (event: any): Promise<void> => {

        const color = event.target.value;

        setBackgroundColor(color);
        await DisplaySettingStorage.setSetting(DisplaySettingStorage.BACKGROUND_COLOR_KEY, color);
    };

    const onCaptionVisibleChange = async (event: any): Promise<void> => {

        const checked = !!event.target.checked;

        setCaptionIsVisible(checked);
        await DisplaySettingStorage.setSetting(DisplaySettingStorage.CAPTION_IS_VISIBLE_KEY, checked);
    };

    const onAmbientVisibleChange = async (event: any): Promise<void> => {

        const checked = !!event.target.checked;

        setAmbientIsVisible(checked);
        await DisplaySettingStorage.setSetting(DisplaySettingStorage.AMBIENT_IS_VISIBLE_KEY, checked);
    };

    const onImageChangeDurationChange = async (event: any): Promise<void> => {

        const duration = event.target.value;

        setImageChangeDuration(parseInt(duration));
        await IntervalSettingStorage.setInterval(duration);
    }

    // Controller
    const handlePrev = () => {
        setCurrentItem( history[history.indexOf(currentItem!) - 1]);
    };

    const handlePlayPause = () => {
        setIsPaused(!isPaused);
    };

    const handleNext = () => {
        setCurrentItem( history[history.indexOf(currentItem!) + 1]);
    };


    useEffect(() => {
        document.body.style.backgroundColor = backgroundColor;
    }, [backgroundColor]);

    return(
        <>
            <Header
                isCursorOnNav={isCursorOnNav}
                setIsCursorOnNav={setIsCursorOnNav}
            />

            <div
                className="nav"
                onMouseEnter={() => setIsCursorOnNav(true)}
                onMouseLeave={() => setIsCursorOnNav(false)}
            >

                <fieldset className={'border-green mt-5'}>
                    <legend>DISPLAY</legend>
                    <table>
                        <tbody>
                        <tr>
                            <td>
                                Caption
                            </td>
                            <td className="text-center">
                                <input
                                    type="checkbox"
                                    checked={captionIsVisible}
                                    onChange={onCaptionVisibleChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Ambient light
                            </td>
                            <td className="text-center">
                                <input
                                    type="checkbox"
                                    checked={ambientIsVisible}
                                    onChange={onAmbientVisibleChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Background
                            </td>
                            <td className="text-center">
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onInput={onBackGroundColorChange}
                                />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </fieldset>

                <fieldset className={"mt-2 border-green"}>
                    <legend>INTERVAL</legend>
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

                <fieldset className={"mt-2 border-green"}>
                    <legend>Control</legend>
                    <table className={"w-100"}>
                        <tbody>
                        <tr >
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
                </fieldset>
                {/*<fieldset>*/}
                {/*    <legend>CONTENT FILTER</legend>*/}
                {/*    <details>*/}
                {/*        <summary>Architecture</summary>*/}
                {/*        <table>*/}
                {/*            <tbody>*/}
                {/*                <tr>*/}
                {/*                    <td>Enabled</td>*/}
                {/*                    <td className="text-center">*/}
                {/*                        <input type="checkbox" data-from="achitecture" id="op_achitecture"/>*/}
                {/*                    </td>*/}
                {/*                </tr>*/}
                {/*                <tr>*/}
                {/*                    <td>Period</td>*/}
                {/*                    <td>*/}
                {/*                        <select id="sl_achitecture" name="Period" defaultValue="any">*/}
                {/*                            <option value="any">any</option>*/}
                {/*                            <option>Medieval</option>*/}
                {/*                            <option>Early Renaissance</option>*/}
                {/*                            <option>Northern Renaissance</option>*/}
                {/*                            <option>High Renaissance</option>*/}
                {/*                            <option>Mannerism</option>*/}
                {/*                            <option>Baroque</option>*/}
                {/*                            <option>Rococo</option>*/}
                {/*                            <option>Neoclassicism</option>*/}
                {/*                            <option>Romanticism</option>*/}
                {/*                            <option>Realism</option>*/}
                {/*                            <option>Impressionism</option>*/}
                {/*                        </select>*/}
                {/*                    </td>*/}
                {/*                </tr>*/}
                {/*            </tbody>*/}
                {/*        </table>*/}
                {/*    </details>*/}
                {/*    <details>*/}
                {/*        <summary>Ceramics</summary>*/}
                {/*        <table>*/}
                {/*            <tbody>*/}
                {/*                <tr>*/}
                {/*                    <td>Enabled</td>*/}
                {/*                    <td className="text-center">*/}
                {/*                        <input type="checkbox" data-from="achitecture" id="op_ceramics"/>*/}
                {/*                    </td>*/}
                {/*                </tr>*/}
                {/*                <tr>*/}
                {/*                    <td>Period</td>*/}
                {/*                    <td>*/}
                {/*                        <select id="sl_ceramics" name="Period" defaultValue="any">*/}
                {/*                            <option value="any">any</option>*/}
                {/*                            <option>Medieval</option>*/}
                {/*                            <option>Early Renaissance</option>*/}
                {/*                            <option>Northern Renaissance</option>*/}
                {/*                            <option>High Renaissance</option>*/}
                {/*                            <option>Mannerism</option>*/}
                {/*                            <option>Baroque</option>*/}
                {/*                            <option>Rococo</option>*/}
                {/*                            <option>Neoclassicism</option>*/}
                {/*                            <option>Romanticism</option>*/}
                {/*                            <option>Realism</option>*/}
                {/*                            <option>Impressionism</option>*/}
                {/*                        </select>*/}
                {/*                    </td>*/}
                {/*                </tr>*/}
                {/*            </tbody>*/}
                {/*        </table>*/}
                {/*    </details>*/}
                {/*</fieldset>*/}

                <section className={"text-center mt-2 d-flex flex-wrap nav-footer"}>
                    <img className="m-auto mt-2" src="/img/kockak.gif" alt="kocka" />
                    <Link
                        href={"https://www.wga.hu/"}
                        target="_blank"
                        className={"font-arial text-white fw-light fb-100 mt-1"}
                    >
                        Web Gallery of Art
                    </Link>
                </section>
            </div>

        </>
    )
}

export default Nav;