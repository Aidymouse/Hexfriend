import { tools } from "../types/toolData"
import type { shortcut_data } from '../types/inputs' 

// Order must be control+shift+alt+{key in lower case}

export let shortcuts: shortcut_data[] = [

    // Keycodes that work anywhere
    // These will override tool specific commands
    {keycode: "control+s", function: "save", tool: null, display: "Save Current Map"},
    {keycode: "control+z", function: "undo", tool: null, display: "Undo <wip>"},
    {keycode: "control+shift+z", function: "redo", tool: null, display: "Redo <wip>" },
    {keycode: "shift+m", function: "toggleViewMaps", tool: null, display: "Toggle Maps" },
    {keycode: "shift+s", function: "toggleViewSettings", tool: null, display: "Toggle Settings" },
    {keycode: "escape", function: "backToMainView", tool: null, display: "Back to Main View" },
    {keycode: "control+k", function: "toggleShortcutList", tool: null, display: "View Shortcut List" },


    {keycode: "1", function: "changeTool_terrain", tool: null, display: "Terrain Tool"},
    {keycode: "2", function: "changeTool_icon", tool: null, display: "Icon Tool"},
    {keycode: "3", function: "changeTool_path", tool: null, display: "Path Tool"},
    {keycode: "4", function: "changeTool_text", tool: null, display: "Text Tool"},
    {keycode: "5", function: "changeTool_eraser", tool: null, display: "Eraser Tool"},

    // TERRAIN
    {keycode: "e", function: "toggleEraser", tool: tools.TERRAIN, display: "Toggle Eraser"},
    {keycode: "p", function: "togglePaintbucket", tool: tools.TERRAIN, display: "Toggle Paintbucket"},

    {keycode: "shift", function: null, tool: tools.TERRAIN, display: "Erase", displayKeycode: "shift (Hold)"},
    {keycode: "control", function: null, tool: tools.TERRAIN, display: "Paint Bucket", displayKeycode: "control (Hold)"},
    {keycode: "alt", function: null, tool: tools.TERRAIN, display: "Eyedropper", displayKeycode: "alt (Hold)"},

    // ICONs
    {keycode: "s", function: "toggleSnap", tool: tools.ICON, display: ""},


    // PATH
    {keycode: "s", function: "toggleSnap", tool: tools.PATH, display: ""},
    {keycode: "delete", function: "delete", tool: tools.PATH, display: ""},

    // TEXT
    {keycode: "control+b", function: "toggleBold", tool: tools.TEXT, display: ""},
    {keycode: "control+i", function: "toggleItalics", tool: tools.TEXT, display: ""},
    {keycode: "control+delete", function: "deleteText", tool: tools.TEXT, display: ""},
]

export function getKeyboardShortcut(keyCode: string, selectedTool: tools) {
    return shortcuts.find((shortcut: shortcut_data) => shortcut.keycode == keyCode && (shortcut.tool == selectedTool || shortcut.tool == null))
}

export default { getKeyboardShortcut }