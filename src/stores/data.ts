import type { path_data } from "../types/data";
import { coord_system } from "../types/coordinates";

import * as PIXI from 'pixi.js'
import { get, writable } from 'svelte/store';


export let data_path = writable({
    style: { color: 0, width: 3, cap: PIXI.LINE_CAP.ROUND, join: PIXI.LINE_JOIN.ROUND, dashed: false, dash_length: 10, dash_gap: 5 },
    hoveredPath: null,
    selectedPath: null,
    dontSelectPaths: null,
    snap: false,
    contextPathId: null,
    add_to: "start"
})

export let data_icon = writable({
    color: null,
    texId: null,
    pHex: 80,
    snapToHex: true,
    usingEraser: false,
    dragMode: false,
    usingEyedropper: false,
})

export let data_overlay = writable({
    shown: true,
    base64: '',
    x: 0,
    y: 0,
    scale: { x: 1, y: 1 },
    opacity: 0.5,
})

export let data_coordinates = writable({
    shown: true,
    style: { fill: 0x000000, fontSize: 10 },
    system: coord_system.ROWCOL,
    seperator: '.',
    gap: 4,
    offsets: {
        row_col: {row: 0, col: 0},
        cubes: {q: 0, r: 0, s: 0}
    }
})