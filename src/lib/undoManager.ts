import { Tools, type LayerComponents, type UndoData, type UndoState } from '../types'
import { DefaultUndoStore } from '../stores'
import { get } from 'svelte/store'

import { store_undo } from '../stores'

const debug = true
export const reset_undo_stack = () => {
  store_undo.update((o) => structuredClone(DefaultUndoStore))
}
//
// type StartUndoStateOptions = {
//   allow_override: boolean
// }
//
// const DefaultStartUndoStateOptions: StartUndoStateOptions = {
//   allow_override: true,
// }

// the 'before' state of whatever action. applied when undoing this state. You typically record this before you perform the operation on state
/*
 * @param allow_override - If true, new states that get pushed will override the one waiting to be finished. This is useful in some circumstances but error prone, so be default we throw an error if this is attempted. 
 * @param bounce - If true, new states that try to get pushed while one is awaiting completion will harmlessly be ignored, rather than throwing an error. Changing hex color is an example of when we'd want to do this, see {@link HexesSettings.svelte}
 */
export const startUndoState = (
  data: UndoData,
  label: string = 'Undo',
  options: { allow_override?: boolean, bounce?: boolean } = { allow_override: false, bounce: false },
) => {
  if (get(store_undo).suppress) {
    return
  }

  const new_state: UndoState = { label, before: structuredClone(data), after: {} }

  if (get(store_undo).awaiting_completion) {

    if (options.bounce) {
      return

    } else if (options.allow_override) {
      store_undo.update((u) => {
	u.undo_stack[u.undo_stack.length - 1] = new_state
	return u
      })

    } else {
      throw Error(`Trying to push undo state when we haven't completed the last one`)
    }

  } else {
    store_undo.update((u) => {
      // TODO: cut off newer readings
      u.undo_stack.splice(u.undo_pointer+1)
      u.undo_stack.push(new_state)
      u.awaiting_completion = true
      return u
    })
  }
}

// the 'after' state of whatever action. applied when re-doing this state
export const completeUndoState = (data: UndoData, label?: string) => {
  if (get(store_undo).suppress) {
    return
  }

  // TODO: could use a bit more validation

  store_undo.update((u) => {
    u.undo_stack[u.undo_pointer + 1].after = structuredClone(data)
    u.undo_pointer += 1
    u.awaiting_completion = false
    return u
  })
}

export const push_undo_state = () => {
  console.warn("YOU CAN'T CALL ME ANYMORE")
}

export const undo = (layers: LayerComponents, changeTool: (new_tool: Tools) => void) => {
  if (get(store_undo).undo_pointer === -1) {
    return
  }

  // SPECIAL: Tiles we're re-placing when undoing are actually stored in the set we're coming FROM
  // TODO: might be able to clean up this logic using the undo action param into apply_undo_state

  const stateToReturnTo: UndoState = structuredClone(get(store_undo).undo_stack[get(store_undo).undo_pointer])

  debug && console.log('Returning To', structuredClone(stateToReturnTo))

  store_undo.update((o) => ({ ...o, suppress: true }))

  apply_state_data(stateToReturnTo.before, layers)

  store_undo.update((o) => ({ ...o, suppress: false, undo_pointer: o.undo_pointer - 1 }))
}

export const redo = (layers: LayerComponents, changeTool: (new_tool: Tools) => void) => {
  if (get(store_undo).undo_pointer === get(store_undo).undo_stack.length - 1) {
    return
  }
  const state_to_move_to = structuredClone(get(store_undo).undo_stack[get(store_undo).undo_pointer + 1])

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
