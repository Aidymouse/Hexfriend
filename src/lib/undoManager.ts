import { type LayerComponents, type SaveData, type UndoData, type UndoState } from '../types'
//import crypto from 'cryptojs'
import { DefaultUndoStore } from '../stores'

import TerrainLayer from '../layers/TerrainLayer.svelte'

import { store_undo } from '../stores'

const debug = true

// export const getObjectHash = (ob: any | undefined) => {
//   const stringHash: string = ob ? (JSON.stringify(ob) ?? '~') : '~'
//   const shortHash: string = crypto.createHash('sha256').update(stringHash).digest('hex')

//   return shortHash
// }

export const reset_undo_stack = () => {
  store_undo.update((o) => structuredClone(DefaultUndoStore))
}

let local_undo
store_undo.subscribe((u) => (local_undo = u))

export const push_undo_state = (undoData: UndoData, label?: string) => {
  if (local_undo.suppress) {
    return
  }

  // TODO: clear the stack when pushing a new undo action
  // WARN: Be careful here, svelte state management code can manipulate objects that we might have stored references to on the undo stack. We clone to stop this
  // TODO: we could save a clone if we store undo states as stringifed states. Then we just parse when we apply the data, which does the clone.
  const undo_state: UndoState = {
    label: label ?? 'Undo',
    data: structuredClone(undoData),
  }
  debug && console.log('Pushing Data: ', undo_state)

  store_undo.update((o) => {
    o.undo_stack.push(undo_state)
    o.undo_pointer += 1
    return o
  })
}

const reduceToChanges = (old_data: UndoState, new_data: UndoState) => {
  // TODO: this is cery basic atm, we need some kind of hash checking
  for (const [key, data] of Object.entries(new_data)) {
    console.log(key)
    if (!old_data[key]) {
      continue
    }
  }

  return new_data
}

export const undo = (layers: LayerComponents) => {
  console.log(local_undo.undo_stack)

  if (local_undo.undo_pointer === 0) {
    return
  }

  const stateToReturnTo = local_undo.undo_stack[local_undo.undo_pointer - 1]

  store_undo.update((o) => ({ ...o, suppress: true }))
  apply_undo_state(stateToReturnTo, layers)
  store_undo.update((o) => ({ ...o, suppress: false, undo_pointer: o.undo_pointer - 1 }))
}

export const redo = (layers: LayerComponents) => {
  if (local_undo.undo_pointer === local_undo.undo_stack.length - 1) {
    return
  }
  const state_to_move_to = local_undo.undo_stack[local_undo.undo_pointer + 1]

  store_undo.update((o) => ({ ...o, suppress: true }))
  apply_undo_state(state_to_move_to, layers)
  store_undo.update((o) => ({ ...o, suppress: false, undo_pointer: o.undo_pointer + 1 }))
}

export const apply_undo_state = (state: UndoState, layers: LayerComponents) => {
  debug && console.log('Applying Undo State: ', state)
  
  // we have to make this a structured clone as well, otherwise svelte state can end up changing objects in old undo states! (well, only if they have objects in them)
  const applied_data = structuredClone(state.data)

  if (applied_data.TerrainField) {
    layers.terrainLayer.applyTerrainField(applied_data.TerrainField)
  }
}
