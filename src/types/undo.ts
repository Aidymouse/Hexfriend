import type TerrainLayer from '../layers/TerrainLayer.svelte'
import type { SaveData } from './savedata'
import type { Tile } from './tilesets'
import type { HexId } from './toolData'

export type LayerComponents = {
  terrainLayer: TerrainLayer
  // TODO:
}

// Too fancy with it
// export type Partialize<T> = {
//   [k in keyof T]?: T extends object ? Partialize<T[k]> : T[k] | undefined
// }

export type UndoData = {
  [k in keyof SaveData]?: Partial<SaveData[k]>
} & {
  tiles?: UndoDataTiles
}

export type UndoDataTiles = {
    // Terrain that was placed. 
    placed: {[hexId: HexId]: Tile | null}
    // Terrain that was replaced, used in Undo
    replaced: {[hexId: HexId]: Tile | null}
}

type Stringified<T> = string

/* Contains save data for map state + meta information, if needed */
export type UndoState = {
  label?: string
  data: UndoData
}

export type UndoStoreType = {
  /* Stack of save data (eventually save data like objects) */
  undo_stack: UndoState[]
  /* Points to the currently active state */
  undo_pointer: number
  /* If true, pushes to the undo stack are ignored */
  suppress: boolean
}
