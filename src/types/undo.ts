import type { SaveData } from './savedata'

/* Contains save data for map state + meta information, if needed */
export type UndoState = {
  label?: string
  save_data: Partial<SaveData>
}

export type UndoStoreType = {
  /* Stack of save data (eventually save data like objects) */
  undo_stack: UndoState[]
  /* Points to the currently active state */
  undo_pointer: number
  /* If true, pushes to the undo stack are ignored */
  suppress: boolean
}
