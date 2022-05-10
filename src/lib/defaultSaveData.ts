import type { TerrainHexField } from '../types/terrain'
import type { Tile } from '../types/tilesets'
import { map_type } from '../types/settings'

import {coords_evenqToCube, genHexId} from '../helpers/hexHelpers'

import { DEFAULTTILESET } from './defaultTileset'
import { DEFAULTICONSET } from './defaultIconset'

import type { icon_set_data } from '../types/icon'
import type { coordinates_data } from 'src/types/data'

interface saveData {
    saveVersion: number
    title: string

    coords: coordinates_data

    TerrainField: TerrainHexField
    tilesets: {[key: string]: Tile[]}
    iconsets: {[key: string]: icon_set_data[]}
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
        raised: "odd", // Which row / column should be higher / indented

        hexesOut: 10,

        mapType: map_type.SQUARE,
        blankHexColor: 0xf2f2f2,
        
        grid: {stroke: 0x333333, thickness: 2, shown: true},
        
        hexes: {}
    },

    coords: {
        shown: false,
        style: { fill: 0x000000, fontSize: 10, stroke: 0xffffff, strokeThickness: 2, fontFamily: "Segoe UI" },
        system: "evenq",
        seperator: "."
    },

    tilesets: {
        'default': DEFAULTTILESET,
    },

    iconsets: {
        'default': DEFAULTICONSET
    },

    paths: [],
    icons: [],
    texts: [],
}

//console.log(JSON.stringify(DEFAULTSAVEDATA.tilesets['default']))



for (let col=0; col<DEFAULTSAVEDATA.TerrainField.columns; col++) {
    for (let row=0; row<DEFAULTSAVEDATA.TerrainField.rows; row++) {

        let cubeCoords = coords_evenqToCube(col, row)
        let q = cubeCoords.q
        let r = cubeCoords.r
        let s = cubeCoords.s

        DEFAULTSAVEDATA.TerrainField.hexes[genHexId(q, r, s)] = { q: q, r: r, s: s, bgColor: 0xf2f2f2, symbolId: null, symbol: null, blank: true }

    }
}
        

export default DEFAULTSAVEDATA;
export type {saveData}