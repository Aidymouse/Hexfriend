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
    {keycode: "shift+k", function: "toggleControls", tool: null, display: "Toggle Controls" },


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
    {keycode: "s", function: "toggleSnap", tool: tools.ICON, display: "Toggle Snapping"},


    // PATH
    {keycode: "s", function: "toggleSnap", tool: tools.PATH, display: "Toggle Snapping"},
    {keycode: "delete", function: "deletePath", tool: tools.PATH, display: "Delete Selected Path"},
    {keycode: "backspace", function: "deleteLastPoint", tool: tools.PATH, display: "Delete Latest Point"},
    {keycode: "control+d", function: "deselect", tool: tools.PATH, display: "Deselect Path"},
    
    {keycode: "shift", function: null, tool: tools.PATH, display: "Ignore Paths", displayKeycode: "shift (Hold)"},

    // TEXT
    {keycode: "control+b", function: "toggleBold", tool: tools.TEXT, display: "Toggle Bold"},
    {keycode: "control+i", function: "toggleItalics", tool: tools.TEXT, display: "Toggle Italics"},
    {keycode: "control+delete", function: "deleteText", tool: tools.TEXT, display: "Delete Selected Text"},
]

export function getKeyboardShortcut(keyCode: string, selectedTool: tools) {
    return shortcuts.find((shortcut: shortcut_data) => shortcut.keycode == keyCode && (shortcut.tool == selectedTool || shortcut.tool == null))
}

export default { getKeyboardShortcut }