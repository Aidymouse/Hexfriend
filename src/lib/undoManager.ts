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

export const push_undo_state = (undoData: UndoData, label?: string) => {
  if (local_undo.suppress) {
    return
  }

  if (local_undo.undo_pointer < local_undo.undo_stack.length-1) {
    store_undo.update(u => {
      u.undo_stack.splice(local_undo.undo_pointer+1)
      return u
    })
    //local_undo.undo_pointer.splice(local_undo.undo_pointer)
  }

  /* SPECIAL CASES */
  const currentState = local_undo.undo_pointer >= 0 ? local_undo.undo_stack[local_undo.undo_pointer] : undefined

  if (local_undo.undo_pointer >= 0) {

    // If we're pushing an undo state and the last state was the first point of a line, we no longer want to be able to undo into a single part of a line. So we just remove that state. The user won't miss it.
    if (currentState.data.paths?.at(-1)?.points.length === 2) {
      store_undo.update(u => {
	u.undo_stack.pop()
	u.undo_pointer -= 1
	return u
      })
    }
  }
  
  // Hexes are a special case
  const to_push = structuredClone({...(currentState?.data ?? {}), ...undoData})
  if (to_push.TerrainField?.hexes) {
    delete to_push.TerrainField.hexes
  } 




  // TODO: clear the stack when pushing a new undo action
  // WARN: Be careful here, svelte state management code can manipulate objects that we might have stored references to on the undo stack. We clone to stop this
  // INFO: we could save a clone if we store undo states as stringifed states. Then we just parse when we apply the data, which does the clone.
  // It's looking like stringify is WAY slower than even 2 structured clones however. TODO: profile
  const undo_state: UndoState = {
    label: label ?? 'Undo',
    data: to_push,
  }
  debug && console.log('Pushing Data: ', undo_state)

  store_undo.update((o) => {
    o.undo_stack.push(undo_state)
    o.undo_pointer += 1
    return o
  })
}

// /* This was an idea, but it's better handled in the text layer itself */
// const isSpecialUndoOverride = (state: UndoState): string | false => {
//
//   if (state.data.texts !== undefined && local_data_text.selectedText !== null) {
//     return "Undo text while text selected"
//   }
//
//   return false
// }

export const undo = (layers: LayerComponents, changeTool: (new_tool: Tools) => void) => {

  if (local_undo.undo_pointer === 0) {
    return
  }

  // SPECIAL: Tiles we're re-placing when undoing are actually stored in the set we're coming FROM
  // TODO: might be able to clean up this logic using the undo action param into apply_undo_state
  const currentState: UndoState = local_undo.undo_stack[local_undo.undo_pointer]

  const stateToReturnTo: UndoState = structuredClone(local_undo.undo_stack[local_undo.undo_pointer - 1])
  if (currentState.data.tiles) {
    stateToReturnTo.data.tiles = structuredClone({
      replaced: {},
      placed: currentState.data.tiles.replaced,
    })
  }

  // if (currentState.data.path_point) {
  //   stateToReturnTo.data.path_point = structuredClone(currentState.data.path_point)
  // }

  // const specialOverrideCase = isSpecialUndoOverride(stateToReturnTo)
  // if (specialOverrideCase) {
  //   debug && console.log("Exiting due to special undo override")
  //   return
  // }

  debug && console.log('Returning To', structuredClone(stateToReturnTo))

  store_undo.update((o) => ({ ...o, suppress: true }))
  apply_undo_state(stateToReturnTo, layers, 'undo', changeTool)
  store_undo.update((o) => ({ ...o, suppress: false, undo_pointer: o.undo_pointer - 1 }))
}

export const redo = (layers: LayerComponents, changeTool: (new_tool: Tools) => void) => {
  if (local_undo.undo_pointer === local_undo.undo_stack.length - 1) {
    return
  }
  const state_to_move_to = structuredClone(local_undo.undo_stack[local_undo.undo_pointer + 1])

  store_undo.update((o) => ({ ...o, suppress: true }))
  apply_undo_state(state_to_move_to, layers, 'redo', changeTool)
  store_undo.update((o) => ({ ...o, suppress: false, undo_pointer: o.undo_pointer + 1 }))
}

export const apply_undo_state = (state: UndoState, layers: LayerComponents, action: 'undo' | 'redo', changeTool: (new_tool: Tools) => void) => {
  debug && console.log('Applying Undo State: ', state)

  // we have to make this a structured clone as well, otherwise svelte state can end up changing objects in old undo states! (well, only if they have objects in them)
  const applied_data = state.data

  if (applied_data.TerrainField) {
    layers.terrainLayer.applyTerrainField(applied_data.TerrainField)
  }

  if (applied_data.tiles) {
    // TODO: could clean up some of this logic by using the action
    layers.terrainLayer.applyUndoTiles(applied_data.tiles.placed)
  }

  if (applied_data.icons) {
    layers.iconLayer.applyIcons(applied_data.icons)
  }

  if (applied_data.texts) {
    layers.textLayer.applyTexts(applied_data.texts)
  }

  if (applied_data.paths) {
    if (applied_data.paths.at(-1)?.points.length === 2) {
      changeTool(Tools.PATH)
    }
    layers.pathLayer.applyPaths(applied_data.paths)
  } 

  /*
  else if (applied_data.path_point) {
    if (action === 'undo') {
      layers.pathLayer.handleUndo(applied_data.path_point)
    } else if (action === 'redo') {
      layers.pathLayer.handle_redo(applied_data.path_point)
    }
  }
  */
}
