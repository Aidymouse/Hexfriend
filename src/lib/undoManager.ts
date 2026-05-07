
import { type SaveData, type UndoState } from '../types'
import crypto from 'cryptojs'

import { store_undo } from '../stores'

// export const getObjectHash = (ob: any | undefined) => {
//   const stringHash: string = ob ? (JSON.stringify(ob) ?? '~') : '~'
//   const shortHash: string = crypto.createHash('sha256').update(stringHash).digest('hex')
//
//   return shortHash
// }

export let undo_stack: UndoState[] = []
let undo_pointer = -1 // Points at the state that the map is currently in

export const reset_undo_stack = () => {
  store_undo.update(o => ({undo_stack: [], undo_pointer: -1}))
}

let local_undo
store_undo.subscribe(u => local_undo = u)

export const push_undo_state = (saveData: UndoState) => {
  // identify what changed (compared to latest thing on undo stack)
  // isolate it
  // store it

  console.log("Pushing Undo State", saveData)
  
  if (local_undo.undo_pointer === -1) {
    store_undo.update( o => {
      o.undo_stack.push(saveData)
      o.undo_pointer += 1
      return o
    })
    return
  }

  let pushData = reduceToChanges(local_undo.undo_stack[local_undo.undo_pointer], saveData)


  store_undo.update( o => {
    o.undo_stack.push(saveData)
    o.undo_pointer += 1
    return o
  })

}

const reduceToChanges = (old_data: UndoState, new_data: UndoState) => {
  for (const [key, data] of Object.entries(new_data)) {
    console.log(key)
    if (!old_data[key]) { continue; }
  }
}

export const apply_undo_state = () => {
}

