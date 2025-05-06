import Header from "@/componets/Header";
import useCursor from "@/hooks/use-cursor";
import DisplaySettings from "@/componets/sidebar/partial/DisplaySettings";
import IntervalSettings from "@/componets/sidebar/partial/IntervalSettings";
import SidebarFooter from "@/componets/sidebar/partial/SidebarFooter";
import { Roboto } from 'next/font/google'

const roboto = Roboto({ weight: '100', subsets: ['latin'] })

export default function Sidebar( ){


    const { isCursorOnNav } = useCursor();

    return(
        <>
            <Header/>

            <div
                className={`nav flex flex-wrap color-white bg-wga-blue ${roboto.className}`}
                onMouseEnter={() => isCursorOnNav.current = true}
                onMouseLeave={() => isCursorOnNav.current = false}
            >

                <DisplaySettings />
                <IntervalSettings />

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

                <SidebarFooter />
            </div>

        </>
    )
}