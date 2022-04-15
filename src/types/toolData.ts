import type { Tile } from './tilesets'

interface path {
    stroke: number
    strokeThickness: number
    points: number[]
}


interface ToolData {
    selectedTool: "terrain" | "icon" | "path" | "text" | "eraser",

    terrain: {
        tile: Tile
    },

    icon: {
        icon,
        scale: number
    },

    path: {
        color: string,
        width: number,
        selectedPath
    },

    controls: {
        mouseDown: boolean[]
    }
    
}

export type { ToolData }