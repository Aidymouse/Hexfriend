import type { map_type } from './settings'
import type {TileSymbol} from './tilesets'

// Hexes are the data that get drawn as terrain
export interface TerrainHex {
    bgColor: number
    symbol: TileSymbol | null
    symbolId: string | null

    
    q: number
    r: number
    s: number
    
    blank: boolean

}
 

export interface TerrainHexField {
    hexWidth: number
    hexHeight: number
    
    grid: {stroke: number, thickness: number, shown: boolean}
    
    mapType: map_type,

    /* Radial Maps */
    hexesOut: number

    /* All has to do with square maps */
    rows: number
    columns: number
    raised: "odd" | "even"

    orientation: 'flatTop' | 'pointyTop'
    blankHexColor: number,

    hexes: {[key:string]: TerrainHex}
}
