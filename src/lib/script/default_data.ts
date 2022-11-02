/* DATA */
/* Data is bound to both layer and panel of a particluar tool. It contains all the shared state they need, and is bound to both */

import { coord_system } from '$lib/types/coordinates';
import type { terrain_data, icon_data, path_data, text_data, coordinates_data, eraser_data } from '$lib/types/data';
import * as PIXI from 'pixi.js';

let data_terrain: terrain_data = {
    //bgColor: null,
    //symbol: null,

    tile: undefined,

    usingEyedropper: false,
    usingPaintbucket: false,
    usingEraser: false,
    renderOpacity: 1,
};

let data_icon: icon_data = {
    color: 0x000000,
    texId: undefined,
    pHex: 80,
    snapToHex: true,
    usingEraser: false,
    dragMode: false
};

let data_path: path_data = {
    style: { color: 0, width: 3, cap: PIXI.LINE_CAP.ROUND, join: PIXI.LINE_JOIN.ROUND },
    hoveredPath: undefined,
    selectedPath: undefined,
    dontSelectPaths: false,
    snap: false,
    contextPathId: undefined,
};

let data_text: text_data = {
    style: {
        fontFamily: 'Segoe UI',
        fill: '#000000',
        fontSize: 25,
        miterLimit: 2,
        strokeThickness: 0,
        stroke: '#f2f2f2',
        align: 'left',
        fontStyle: 'normal',
        fontWeight: 'normal',
    },
    selectedText: undefined,
    editorRef: null,
    usingTextTool: false,
    contextStyleId: undefined,
};

let data_coordinates: coordinates_data = {
    shown: true,
    style: { fill: 0x000000, fontSize: 10 },
    system: coord_system.ROWCOL,
    seperator: '.',
    gap: 4,
};

let data_eraser: eraser_data = {
    ignoreTerrain: false,
    ignoreIcons: false,
};

export { data_terrain, data_icon, data_text, data_path, data_coordinates, data_eraser } 