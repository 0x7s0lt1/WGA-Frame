import Header from "@/componets/Header";
import Link from "next/link";

import useControl from "@/hooks/use-control";
import useSettings from "@/hooks/use-settings";
import useHistory from "@/hooks/use-history";
import useCursor from "@/hooks/use-cursor";

import { Cinzel, Roboto } from 'next/font/google'


const cinzel = Cinzel({ weight: '400', subsets: ['latin'] })
const roboto = Roboto({ weight: '100', subsets: ['latin'] })

export default function Nav( ){


    const { setIsCursorOnNav } = useCursor();
    const { history, currentItem, setCurrentItem } = useHistory();
    const { imageChangeDuration, setImageChangeDuration, isPaused, setIsPaused } = useControl();
    const { captionIsVisible, setCaptionIsVisible, ambientIsVisible, setAmbientIsVisible, isFullscreen, setIsFullscreen, backgroundColor, setBackgroundColor } = useSettings();

    const onBackGroundColorChange = async (event: any)=> {
        setBackgroundColor(event.target.value);
    };

    const onCaptionVisibleChange = async (event: any)=> {
        setCaptionIsVisible(event.target.checked);
    };

    const onAmbientVisibleChange = async (event: any)=> {
        setAmbientIsVisible(event.target.checked);
    };

    const onFullscreenChange = async (event: any)=> {
        setIsFullscreen(event.target.checked);
    };

    const onImageChangeDurationChange = async (event: any): Promise<void> => {
        setImageChangeDuration(parseInt(event.target.value));
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


    return(
        <>
            <Header
                setIsCursorOnNav={setIsCursorOnNav}
            />

            <div
                className={`nav flex flex-wrap color-white bg-wga-blue ${roboto.className}`}
                onMouseEnter={() => setIsCursorOnNav(true)}
                onMouseLeave={() => setIsCursorOnNav(false)}
            >

                <fieldset className={'border-green mt-5'}>
                    <legend className={`${cinzel.className}`} >DISPLAY</legend>
                    <table>
                        <tbody>
                        <tr>
                            <td>
                                <label htmlFor={"control-caption"}>
                                    Caption
                                </label>
                            </td>
                            <td className="text-center">
                                <input
                                    id={"control-caption"}
                                    type="checkbox"
                                    checked={captionIsVisible}
                                    onChange={onCaptionVisibleChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor={"control-ambient"}>
                                    Ambient light
                                </label>
                            </td>
                            <td className="text-center">
                                <input
                                    id={"control-ambient"}
                                    type="checkbox"
                                    checked={ambientIsVisible}
                                    onChange={onAmbientVisibleChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor={"control-fullscreen"}>
                                    Fullscreen
                                </label>
                            </td>
                            <td className="text-center">
                                <input
                                    id={"control-fullscreen"}
                                    type="checkbox"
                                    checked={isFullscreen}
                                    onChange={onFullscreenChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor={"control-bg-color"}>
                                    Background
                                </label>
                            </td>
                            <td className="text-center">
                                <input
                                    id={"control-bg-color"}
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

                <fieldset className={"mt-2 border-green"}>
                    <legend className={`${cinzel.className}`} >CONTROL</legend>
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

                <section className={"text-center mt-2 flex flex-wrap nav-footer"}>
                    <img className="m-auto mt-2" src="/img/kockak.gif" alt="kocka" />
                    <Link
                        href={"https://www.wga.hu/"}
                        target="_blank"
                        className={"font-arial color-white fw-light fb-100 mt-1"}
                    >
                        Web Gallery of Art
                    </Link>
                </section>
            </div>

        </>
    )
}