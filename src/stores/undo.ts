import { get, writable } from 'svelte/store';

export let store_undo = writable({
    undo_pointer: 0,
    stack: [],
})
