import { get, writable, type Writable } from 'svelte/store'
import type { UndoState, UndoStoreType } from '../types'

export const DefaultUndoStore: UndoStoreType = {
  undo_stack: [],
  undo_pointer: -1,
  suppress: false,
  awaiting_completion: false,
  prospective_state: null
}

export let store_undo: Writable<UndoStoreType> = writable({
  ...DefaultUndoStore,
})
