import type { terrain_field } from '../types/terrain'
import { writable } from 'svelte/store'

let t: terrain_field

export let tfield = writable(t)
