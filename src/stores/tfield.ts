import type { TerrainField } from '../types/terrain'
import { writable } from 'svelte/store'

let t: TerrainField

export let tfield = writable(t)
