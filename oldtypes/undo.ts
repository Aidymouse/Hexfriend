import TerrainLayer from '../layers/TerrainLayer.svelte'
import IconLayer from '../layers/IconLayer.svelte'
import TextLayer from '../layers/TextLayer.svelte'
import PathLayer from '../layers/PathLayer.svelte'
import CoordinatesLayer from '../layers/../layers/CoordsLayer.svelte'
import OverlayLayer from '../panels/OverlayLayer.svelte'
import TextPanel from '../panels/TextPanel.svelte'
import PathPanel from '../panels/PathPanel.svelte'
import type { SaveData } from './savedata'
import type { Tile } from './tilesets'
import type { HexId, Tools } from './toolData'
import type { PathData } from './data'

export type LayerComponents = {
  terrainLayer: TerrainLayer
  iconLayer: IconLayer
  textLayer: TextLayer
  pathLayer: PathLayer
  overlayLayer: OverlayLayer
  coordsLayer: CoordinatesLayer
}

export type PanelComponents = {
  text_panel: TextPanel
  path_panel: PathPanel
}

// Too fancy with it
// export type Partialize<T> = {
//   [k in keyof T]?: T extends object ? Partialize<T[k]> : T[k] | undefined
// }

export type UndoData = {
  [k in keyof SaveData]?: Partial<SaveData[k]>
} & {
  tiles?: { [hexId: HexId]: Tile | null }
  selected_tool?: Tools

  path_data?: Partial<PathData>

  // When the map is resized on the top or left, the camera is moved and the overlay is shifted. This tracks that bump. Added to camera, subtracted from overlay position
  resize_bump?: { x_shift: number, y_shift: number }

  //tiles?: UndoDataTiles
  //path_point?: UndoDataPathPoint
}

export type UndoDataTiles = {
  // Terrain that was placed.
  placed: { [hexId: HexId]: Tile | null }
  // Terrain that was replaced, used in Undo
  replaced: { [hexId: HexId]: Tile | null }
}

export type UndoDataPathPoint = {
  path_id: number
  point: { x: number; y: number }
  action: 'add' | 'remove'
  path_end: 'start' | 'end'
  // If true, when this point is placed, it will grab the selection. Good for if its the first point
  grab_selection: boolean
}

type Stringified<T> = string

/* Contains save data for map state + meta information, if needed */
export type UndoState = {
  label?: string
  before: UndoData
  after: UndoData
}

export type UndoStoreType = {
  /* Stack of save data (eventually save data like objects) */
  undo_stack: UndoState[]
  /* Points to the currently active state */
  undo_pointer: number
  /* If true, pushes to the undo stack are ignored */
  suppress: boolean
  /* True if we've opened a new state and haven't completed it yet */
  awaiting_completion: boolean
  /* When we start an undo state, we put it here */
  prospective_state: UndoState | null
}
