import type { HexOrientation, TerrainHex } from "./terrain"

export enum UndoActions {
	ChangeHexDimensions = "Change Hex Dimensions",
	ChangeHexOrientation = "Change Hex Orientation",

	PlaceTerrain = "Place Terrain",
}

export type UndoAction = 
	ChangeHexDimensions | ChangeHexOrientation |
	PlaceTerrain


/** Settings */
type ChangeHexDimensions = {
	type: UndoActions.ChangeHexDimensions
	old_width: number
	old_height: number
	new_width: number
	new_height: number
}

type ChangeHexOrientation = {
	type: UndoActions.ChangeHexOrientation
	new_orientation: HexOrientation // You can derive old from new - there are only two!
}

/** Terrain */
type PlaceTerrain = {
	type: UndoActions.PlaceTerrain,
	old_tiles: TerrainHex[]
	new_tiles: TerrainHex[]
}
