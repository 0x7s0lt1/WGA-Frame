import useSettings from "@/hooks/use-settings";
import useCatalog from "@/hooks/use-catalog";
import { AMBIENT_LEVELS, DEFAULT_AMBIENT_LEVEL } from "@/contexts/settings-provider";
import { cinzel } from "@/lib/fonts";

const AMBIENT_LABELS = ["subtle", "soft", "classic", "strong", "maximum"];

export default function DisplaySettings() {

    const {
        captionIsVisible, setCaptionIsVisible,
        ambientIsVisible, setAmbientIsVisible, ambientLevel, setAmbientLevel,
        paletteIsVisible, setPaletteIsVisible,
        isFullscreen, isFullscreenSupported, setIsFullscreen,
        backgroundColor, setBackgroundColor,
        keepAwake, setKeepAwake, isWakeLockSupported,
    } = useSettings();
    const { catalog } = useCatalog();

    return (
        <fieldset className="border-green mt-5">
            <legend className={cinzel.className}>DISPLAY</legend>
            <table className="w-100 settings-table">
                <tbody>
                <tr>
                    <td>
                        <label htmlFor="control-caption" title="Shortcut: C">Caption</label>
                    </td>
                    <td className="text-center">
                        <input
                            id="control-caption"
                            type="checkbox"
                            checked={captionIsVisible}
                            onChange={(event) => setCaptionIsVisible(event.target.checked)}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label htmlFor="control-ambient">Ambient light</label>
                    </td>
                    <td className="text-center">
                        <input
                            id="control-ambient"
                            type="checkbox"
                            checked={ambientIsVisible}
                            onChange={(event) => setAmbientIsVisible(event.target.checked)}
                        />
                    </td>
                </tr>
                {ambientIsVisible && (
                    <tr>
                        <td colSpan={2}>
                            {/* Stepped: the middle step is the original glow; smaller to the left, bigger to the right. */}
                            <div className="ambient-level">
                                <span aria-hidden="true">−</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={AMBIENT_LEVELS - 1}
                                    step={1}
                                    list="ambient-level-steps"
                                    value={ambientLevel}
                                    onChange={(event) => setAmbientLevel(Number(event.target.value))}
                                    onDoubleClick={() => setAmbientLevel(DEFAULT_AMBIENT_LEVEL)}
                                    aria-label="Ambient light level"
                                    aria-valuetext={AMBIENT_LABELS[ambientLevel]}
                                    title={`Ambient light: ${AMBIENT_LABELS[ambientLevel]} (double-click to reset)`}
                                />
                                <span aria-hidden="true">+</span>
                                <datalist id="ambient-level-steps">
                                    {AMBIENT_LABELS.map((label, level) => <option key={label} value={level} label={label} />)}
                                </datalist>
                            </div>
                        </td>
                    </tr>
                )}
                {(catalog?.palettes ?? 0) > 0 && (
                    <tr>
                        <td>
                            <label htmlFor="control-palette" title="The artwork's main colours; click one to copy it. Shortcut: P">
                                Palette
                            </label>
                        </td>
                        <td className="text-center">
                            <input
                                id="control-palette"
                                type="checkbox"
                                checked={paletteIsVisible}
                                onChange={(event) => setPaletteIsVisible(event.target.checked)}
                            />
                        </td>
                    </tr>
                )}
                {isFullscreenSupported && (
                    <tr>
                        <td>
                            <label htmlFor="control-fullscreen" title="Shortcut: F">Fullscreen</label>
                        </td>
                        <td className="text-center">
                            <input
                                id="control-fullscreen"
                                type="checkbox"
                                checked={isFullscreen}
                                onChange={(event) => setIsFullscreen(event.target.checked)}
                            />
                        </td>
                    </tr>
                )}
                {isWakeLockSupported && (
                    <tr>
                        <td>
                            <label htmlFor="control-keep-awake" title="Stop the screen from dimming or locking">
                                Keep screen on
                            </label>
                        </td>
                        <td className="text-center">
                            <input
                                id="control-keep-awake"
                                type="checkbox"
                                checked={keepAwake}
                                onChange={(event) => setKeepAwake(event.target.checked)}
                            />
                        </td>
                    </tr>
                )}
                <tr>
                    <td>
                        <label htmlFor="control-bg-color">Background</label>
                    </td>
                    <td className="text-center">
                        <input
                            id="control-bg-color"
                            type="color"
                            value={backgroundColor}
                            onChange={(event) => setBackgroundColor(event.target.value)}
                        />
                    </td>
                </tr>
                </tbody>
            </table>
        </fieldset>
    );
}
