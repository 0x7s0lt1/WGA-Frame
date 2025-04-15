import useSettings from "@/hooks/use-settings";

import { Cinzel } from 'next/font/google'
const cinzel = Cinzel({ weight: '400', subsets: ['latin'] })
export default function DisplaySettings(){

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

    return(
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
    )
}