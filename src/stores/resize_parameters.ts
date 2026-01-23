import { writable } from 'svelte/store'
import { HexOrientation } from '../types/terrain'

export let resize_parameters = writable({
  old_hex_width: 0,
  old_hex_height: 0,
  old_gap: 0,
  old_orientation: HexOrientation.FLATTOP,
})
