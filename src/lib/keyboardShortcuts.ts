import { tools } from "../types/toolData"
import type { shortcut_data } from '../types/inputs' 

let shortcuts: { [key: string]: shortcut_data } = {


    "control+s": {function: "save", tool: null},
    "control+z": { function: "undo", tool: null },
    "control+shift+z": { function: "redo", tool: null },
    "m": { function: "openSavedMaps", tool: null },
    "escape": { function: "backToMainView", tool: null },

    // TERRAIN
    "e": {function: "toggleEraser", tool: tools.TERRAIN},

    // ICONs
    "s": {function: "toggleSnap", tool: tools.ICON},


    // PATH
    "s": {function: "toggleSnap", tool: tools.PATH},
    "delete": {function: "delete", tool: tools.PATH},
}

export function getKeyboardShortcut(keyCode: string) {
    return shortcuts[keyCode]
}

export default { getKeyboardShortcut }