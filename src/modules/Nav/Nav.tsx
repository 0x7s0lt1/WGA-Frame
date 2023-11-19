import React, {FC,useState,useRef} from "react";
import Header from "@/modules/Header/Header";

type Props = {
    captionIsVisible: boolean
    setCaptionIsVisible: (value: boolean) => void
    children: React.ReactNode
}
const Nav: FC<Props> = ({children,captionIsVisible,setCaptionIsVisible}) => {


    const onBackGroundOptionCahnge = (event: any): void => {
        document.body.style.backgroundColor = event.target.value;
    };

    const onCaptionVisibleChange = (event: any): void => {
        setCaptionIsVisible(event.target.checked ? true : false);
    };

    return(
        <>
            <Header/>

            <div className="nav">

                <fieldset>
                    <legend>FRAME</legend>
                    <table>
                        <tr>
                            <td>
                                Caption
                            </td>
                            <td className="text-center">
                                <input type="checkbox" onInput={onCaptionVisibleChange} checked />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Background
                            </td>
                            <td className="text-center">
                                <input type="color" onInput={onBackGroundOptionCahnge} id="background-color"/>
                            </td>
                        </tr>
                    </table>
                </fieldset>
                <fieldset>
                    <legend>CONTENT</legend>
                    <details>
                        <summary>Achitecture</summary>
                        <table>
                            <tr>
                                <td>Enabled</td>
                                <td className="text-center">
                                    <input type="checkbox" data-from="achitecture" id="op_achitecture"/>
                                </td>
                            </tr>
                            <tr>
                                <td>Period</td>
                                <td>
                                    <select id="sl_achitecture" name="Period">
                                        <option selected="">any</option>
                                        <option>Medieval</option>
                                        <option>Early Renaissance</option>
                                        <option>Northern Renaissance</option>
                                        <option>High Renaissance</option>
                                        <option>Mannerism</option>
                                        <option>Baroque</option>
                                        <option>Rococo</option>
                                        <option>Neoclassicism</option>
                                        <option>Romanticism</option>
                                        <option>Realism</option>
                                        <option>Impressionism</option>
                                    </select>
                                </td>
                            </tr>
                        </table>
                    </details>
                    <details>
                        <summary>Ceramics</summary>
                        <table>
                            <tr>
                                <td>Enabled</td>
                                <td className="text-center">
                                    <input type="checkbox" data-from="achitecture" id="op_ceramics"/>
                                </td>
                            </tr>
                            <tr>
                                <td>Period</td>
                                <td>
                                    <select id="sl_ceramics" name="Period">
                                        <option selected="">any</option>
                                        <option>Medieval</option>
                                        <option>Early Renaissance</option>
                                        <option>Northern Renaissance</option>
                                        <option>High Renaissance</option>
                                        <option>Mannerism</option>
                                        <option>Baroque</option>
                                        <option>Rococo</option>
                                        <option>Neoclassicism</option>
                                        <option>Romanticism</option>
                                        <option>Realism</option>
                                        <option>Impressionism</option>
                                    </select>
                                </td>
                            </tr>
                        </table>
                    </details>
                </fieldset>

                <img className="kocka" src="/img/kockak.gif" alt="kocka" />
            </div>

        </>
    )
}

export default Nav;