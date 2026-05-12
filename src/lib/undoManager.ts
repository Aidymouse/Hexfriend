
import { Tools, type LayerComponents, type path_data, type SaveData, type text_data, type UndoData, type UndoState, type UndoStoreType } from '../types'
//import crypto from 'cryptojs'
import { DefaultUndoStore } from '../stores'

import TerrainLayer from '../layers/TerrainLayer.svelte'

import { store_undo, store_selected_tool } from '../stores'

//import { data_text } from '../stores'

const debug = true

// export const getObjectHash = (ob: any | undefined) => {
//   const stringHash: string = ob ? (JSON.stringify(ob) ?? '~') : '~'
//   const shortHash: string = crypto.createHash('sha256').update(stringHash).digest('hex')

//   return shortHash
// }

export const reset_undo_stack = () => {
  store_undo.update((o) => structuredClone(DefaultUndoStore))
}

let local_undo: UndoStoreType
store_undo.subscribe((u) => (local_undo = u))

let local_selected_tool: Tools
store_selected_tool.subscribe(t => local_selected_tool = t)

/*
let local_data_path: path_data
data_path.subscribe(d => local_data_path = d)
*/

// let local_data_text: text_data
// data_text.subscribe(d => local_data_text = d)
//

// the 'before' state of whatever action. applied when undoing this state. You typically record this before you perform the operation on state
export const startUndoState = (data: UndoData, label: string = "Undo") => {

  if (local_undo.suppress) { return }

  const new_state: UndoState = { label, before: structuredClone(data), after: {} }

  store_undo.update(u => {
    u.undo_stack.push(new_state)
    return u
  })

}

// the 'after' state of whatever action. applied when re-doing this state
export const completeUndoState = (data: UndoData, label?: string) => {

  if (local_undo.suppress) { return }

  const latest_state = local_undo.undo_stack[local_undo.undo_pointer+1]

  store_undo.update(u => {
    u.undo_stack[u.undo_pointer+1].after = structuredClone(data)
    u.undo_pointer += 1
    return u
  })

}

export const push_undo_state = () => {
  console.warn("YOU CAN'T CALL ME ANYMORE")
}

export const undo = (layers: LayerComponents, changeTool: (new_tool: Tools) => void) => {

  if (local_undo.undo_pointer === -1) {
    return
  }

  // SPECIAL: Tiles we're re-placing when undoing are actually stored in the set we're coming FROM
  // TODO: might be able to clean up this logic using the undo action param into apply_undo_state

  const stateToReturnTo: UndoState = structuredClone(local_undo.undo_stack[local_undo.undo_pointer])

  debug && console.log('Returning To', structuredClone(stateToReturnTo))

  store_undo.update((o) => ({ ...o, suppress: true }))

  apply_state_data(stateToReturnTo.before, layers)

  store_undo.update((o) => ({ ...o, suppress: false, undo_pointer: o.undo_pointer - 1 }))
}

export const redo = (layers: LayerComponents, changeTool: (new_tool: Tools) => void) => {
  if (local_undo.undo_pointer === local_undo.undo_stack.length - 1) {
    return
  }
  const state_to_move_to = structuredClone(local_undo.undo_stack[local_undo.undo_pointer + 1])

  store_undo.update((o) => ({ ...o, suppress: true }))
  apply_state_data(state_to_move_to.after, layers)
  store_undo.update((o) => ({ ...o, suppress: false, undo_pointer: o.undo_pointer + 1 }))
}

export const apply_state_data = (applied_data: UndoData, layers: LayerComponents) => {

  if (applied_data.TerrainField) {
    layers.terrainLayer.applyTerrainField(applied_data.TerrainField)
  }

  if (applied_data.tiles) {
    layers.terrainLayer.applyUndoTiles(applied_data.tiles)
  }

  if (applied_data.icons) {
    layers.iconLayer.applyIcons(applied_data.icons)
  }

  if (applied_data.texts) {
    layers.textLayer.applyTexts(applied_data.texts)
  }

  if (applied_data.paths) {
    // if (applied_data.paths.at(-1)?.points.length === 2) {
    //   changeTool(Tools.PATH)
    // }
    layers.pathLayer.applyPaths(applied_data.paths)
  } 
}

