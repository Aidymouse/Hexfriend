import type { path_data } from "../types/data";
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