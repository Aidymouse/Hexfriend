import { type SaveData, type UndoState } from '../types'
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

export const push_undo_state = (saveData: Partial<SaveData>, label?: string) => {
  if (local_undo.suppress) {
    return
  }

  const undo_state: UndoState = {
    label: label ?? 'Undo',
    save_data: structuredClone(saveData),
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

export const undo = (terrainLayer: TerrainLayer) => {
  console.log(local_undo.undo_stack)

  if (local_undo.undo_pointer === 0) {
    return
  }

  const stateToReturnTo = local_undo.undo_stack[local_undo.undo_pointer - 1]

  apply_undo_state(stateToReturnTo, terrainLayer)
}

export const apply_undo_state = (state: UndoState, terrainLayer: TerrainLayer) => {
  store_undo.update((o) => ({ ...o, suppress: true }))

  debug && console.log('Applying Undo State: ', state)
  if (state.save_data.TerrainField) {
    terrainLayer.applyTerrainField(state.save_data.TerrainField)
  }

  store_undo.update((o) => ({ ...o, suppress: false }))
}
