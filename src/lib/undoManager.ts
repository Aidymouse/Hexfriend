
import { type SaveData } from '../types'
import crypto from 'cryptojs'

type UndoState = Partial<SaveData>

export const getObjectHash = (ob: any | undefined, /** @deprecated */ seenObjects: any[] = []) => {
  const stringHash: string = ob ? (JSON.stringify(ob) ?? '~') : '~'
  const shortHash: string = crypto.createHash('sha256').update(stringHash).digest('hex')

  return shortHash
}

export let undo_stack: UndoState[] = []
let undo_pointer = -1 // Points at the state that the map is currently in

export const reset_undo_stack = () => {
  undo_stack = [] // whee garbage collection :)
  undo_pointer = -1
}

export const push_undo_state = (saveData: UndoState) => {
  // identify what changed (compared to latest thing on undo stack)
  // isolate it
  // store it

  console.log("Pushing Undo State", saveData)
  
  if (undo_pointer === -1) {
    undo_stack.push(saveData)
    undo_pointer += 1
    return
  }

  let pushData = reduceToChanges(undo_stack[undo_pointer], saveData)


  undo_stack.push(saveData)
  undo_pointer += 1

}

const reduceToChanges = (old_data: UndoState, new_data: UndoState) => {
  debugger
  for (const [key, data] of Object.entries(new_data)) {
    console.log(key)
    if (!old_data[key]) { continue; }
  }
}

export const apply_undo_state = () => {
}

