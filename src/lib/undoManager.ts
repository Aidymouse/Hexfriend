
import { type SaveData } from '../types'

type UndoState = Partial<SaveData>

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
  
  if (undo_pointer === -1) {
    undo_stack.push(saveData)
    undo_pointer += 1
    return
  }

}

export const apply_undo_state = () => {
}

