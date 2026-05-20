import type { PreviewHexInfo } from '../helpers/iconFns'
import type { map_shape } from './settings'
import type { Tile } from './tilesets'
import type { HexId } from './toolData'
import type * as PIXI from 'pixi.js'

export enum HexOrientation {
  FLATTOP = 'flatTop',
  POINTYTOP = 'pointyTop',
}

export enum HexRaised {
  EVEN = 'even',
  ODD = 'odd',
}

// Hexes are the data that get drawn as terrain
export type TerrainHex = {
  // If no tile, the hex is blank
  tile: Tile | null

  q: number
  r: number
  s: number
}

export type HexPosition = {
  q: number
  r: number
  s: number
}

export type TerrainField = {
  hexWidth: number
  hexHeight: number

  // TODO: move gap out of grid
  grid: { stroke: number; thickness: number; shown: boolean }

  mapShape: map_shape
  largehexes: {
    shown: boolean
    style: { width: number; color: number }
    offset: { x: number; y: number }
    diameterInHexes: number
    raised: HexRaised
    encompassEdges: boolean
  }

  /* Radial Maps */
  hexesOut: number

  /* All has to do with square maps */
  rows: number
  columns: number
  raised: HexRaised

  // TODO: put hex size params into their own hex size param object
  orientation: HexOrientation
  blankHexColor: number
  gap: number

  hexes: { [key: HexId]: TerrainHex }
}

export type HexSizeParams = { width: number; height: number; orientation: HexOrientation }
export type HexGridParams = HexSizeParams & { gap: number; raised: HexRaised }
export type PreviewHexInfo = HexSizeParams & { color: string }
