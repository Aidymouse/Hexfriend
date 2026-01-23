import { get, writable } from 'svelte/store'

export let store_has_unsaved_changes = writable(false)
