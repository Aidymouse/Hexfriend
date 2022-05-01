import type { TerrainHexField } from '../types/terrain'
import type { Tile } from '../types/tilesets'

import {genHexId} from '../helpers/hexHelpers'

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

        blankHexColor: 0xf2f2f2,
        
        grid: {stroke: 0x333333, thickness: 2, shown: true},
        
        hexes: {}
    },

    coords: {
        shown: false,
        style: { fill: 0xffffff, fontSize: 10, stroke: 0x000000, strokeThickness: 3, fontFamily: "Segoe UI" },
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

let hexesOut = 10;
for (let q = -hexesOut; q <= hexesOut; q++) {
    for (let r = -hexesOut; r <= hexesOut; r++) {
        
        if (-q - r >= -hexesOut && -q - r <= hexesOut) {
            
            DEFAULTSAVEDATA.TerrainField.hexes[ genHexId(q, r, -q - r) ] = { q: q, r: r, s: -q - r, bgColor: 0xf2f2f2, symbolId: null, symbol: null, blank: true }

        }

    }
}

export default DEFAULTSAVEDATA;
export type {saveData}