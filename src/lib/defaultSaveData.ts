import type { TerrainHexField } from '../types/terrain'
import type { Tile, Tileset } from '../types/tilesets'
import { map_type } from '../types/settings'

import {coords_qToCube, genHexId} from '../helpers/hexHelpers'

import { DEFAULTTILESET } from './defaultTileset'
import { DEFAULTICONSET } from './defaultIconset'

import type { Iconset } from '../types/icon'
import type { coordinates_data } from 'src/types/data'
import { coord_system } from '/src/types/cordinates'

interface saveData {
    saveVersion: number
    title: string

    coords: coordinates_data

    TerrainField: TerrainHexField
    tilesets: Tileset[]
    iconsets: Iconset[]
    paths: []
    texts: []
    icons: []
}

const CURRENTSAVEVERSION = 1

let DEFAULTSAVEDATA: saveData = {
    saveVersion: CURRENTSAVEVERSION,
    title: "",

    TerrainField: {
        hexWidth: 50,
        hexHeight: 45,
        orientation: 'flatTop',

        rows: 20,
        columns: 20,
        raised: "even", // Which row / column should be higher / indented. This is implemented with an invisible hex. It's all quite messy.

        hexesOut: 10,

        mapType: map_type.SQUARE,
        blankHexColor: 0xf2f2f2,
        
        grid: {stroke: 0x333333, thickness: 2, shown: true},
        
        hexes: {}
    },

    coords: {
        shown: false,
        style: { fill: 0x000000, fontSize: 10, stroke: 0xffffff, strokeThickness: 2, fontFamily: "Segoe UI" },
        system: coord_system.ROWCOL,
        seperator: ".",
        gap: 4
    },

    tilesets: [
        DEFAULTTILESET
    ],

    iconsets: [
        DEFAULTICONSET
    ],

    paths: [],
    icons: [],
    texts: [],
}

//console.log(JSON.stringify(DEFAULTSAVEDATA.tilesets['default']))



for (let col=0; col<DEFAULTSAVEDATA.TerrainField.columns; col++) {
    for (let row=0; row<DEFAULTSAVEDATA.TerrainField.rows; row++) {

        let cubeCoords = coords_qToCube("even", col, row)
        let q = cubeCoords.q
        let r = cubeCoords.r
        let s = cubeCoords.s

        DEFAULTSAVEDATA.TerrainField.hexes[genHexId(q, r, s)] = { q: q, r: r, s: s, bgColor: 0xf2f2f2, symbolId: null, symbol: null, blank: true, renderable: true }
        
        // These hexes are used in the even / odd raised row calculation
        // They're kept hidden until needed
        // Conversely, we could create the hexes spontaneously whenever they're needed, but this method is faster I believe
        // However, it causes some confusing things and trouble in places, mainly the map expansion code in TerrainField.svelte
        if (row == 0 && (col&1) == 0) {
            //DEFAULTSAVEDATA.TerrainField.hexes[genHexId(q, r-1, s+1)] = { q: q, r: r-1, s: s+1, bgColor: 0xf2f2f2, symbolId: null, symbol: null, blank: true, renderable: false }
            
        }
        
        if (col == 0 && (row&1) == 0) {
            //DEFAULTSAVEDATA.TerrainField.hexes[genHexId(q-1, r, s+1)] = { q: q-1, r: r, s: s+1, bgColor: 0xf2f2f2, symbolId: null, symbol: null, blank: true, renderable: false }

        }

    }
}
        

export default DEFAULTSAVEDATA;
export type {saveData}