import { get, writable, type Writable } from 'svelte/store';
import type { UndoState } from '../types';


export let store_undo: Writable<{undo_stack: UndoState[], undo_pointer: number}> = writable({
  undo_stack: [],
  undo_pointer: -1
})
