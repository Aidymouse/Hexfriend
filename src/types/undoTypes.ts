import type { HexOrientation, TerrainHex } from './terrain'

export enum UndoActions {

  ToggleGrid = 'Toggle Grid',
  ChangeGridThickness = 'Change Grid Thickness',
  ChangeGridColor = 'Change Grid Color',
  ChangeGridGap = 'Change Grid Gap',
  ToggleGridLargeHexes = 'Toggle Grid Large Hexes',
  ChangeGridLargeHexSize = 'Change Grid Large Hex Size',
  ChangeGridLargeHexColor = 'Change Grid Large Hex Color',
  ChangeGridLargeHexWidth = 'Change Grid Large Hex Width',
  ChangeGridLargeHexOffset = 'Change Grid Large Hex Offset',
  ToggleGridLargeHexEdgeEncompass = 'Change Grid Large Hex Edge Encompass',

  ChangeHexBlankColor = 'Change Blank Hex Color',
  ChangeHexDimensions = 'Change Hex Dimensions',
  ChangeHexOrientation = 'Change Hex Orientation',

  PlaceTerrain = 'Place Terrain',
}

// (One day) Concise list of all actions available in Hexfriend
export type UndoAction =
  // Terrain
  | PlaceTerrain
  // Grid
  | ToggleGrid
  | ChangeGridThickness
  | ChangeGridColor
  | ChangeGridGap
  | ToggleGridLargeHexes
  | ChangeGridLargeHexSize
  | ChangeGridLargeHexColor
  | ChangeGridLargeHexWidth
  | ChangeGridLargeHexOffset
  | ToggleGridLargeHexEdgeEncompass
  // Hex Settings
  | ChangeHexBlankColor
  | ChangeHexDimensions
  | ChangeHexOrientation

/** Settings */

// Grid settings
type ToggleGrid = {
  type: UndoActions.ToggleGrid
  enabled: boolean
}

type ChangeGridThickness = {
  type: UndoActions.ChangeGridThickness
  old_thickness: number
  new_thickness: number
}

type ChangeGridColor = {
  type: UndoActions.ChangeGridColor
  new_color: number
  old_color: number
}

type ChangeGridGap = {
  type: UndoActions.ChangeGridGap
  old_gap: number
  new_gap: number
}

type ToggleGridLargeHexes = {
  type: UndoActions.ToggleGridLargeHexes
  enabled: boolean
}
type ChangeGridLargeHexSize = {
  type: UndoActions.ChangeGridLargeHexSize
  old_size: number
  new_size: number
}

type ChangeGridLargeHexColor = {
  type: UndoActions.ChangeGridLargeHexColor
  old_color: number
  new_color: number
}

type ChangeGridLargeHexWidth = {
  type: UndoActions.ChangeGridLargeHexWidth
  old_width: number
  new_width: number
}

type ChangeGridLargeHexOffset = {
  type: UndoActions.ChangeGridLargeHexOffset
  old_horizontal: number
  old_vertical: number
  new_horizontal: number
  new_vertical: number
}

type ToggleGridLargeHexEdgeEncompass = {
  type: UndoActions.ToggleGridLargeHexEdgeEncompass
  enabled: boolean
}

// Hex settings
type ChangeHexBlankColor = {
  type: UndoActions.ChangeHexBlankColor,
  new_color: number,
  old_color: number,
}

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
  type: UndoActions.PlaceTerrain
  old_tiles: TerrainHex[]
  new_tiles: TerrainHex[]
}
