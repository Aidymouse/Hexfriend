import { writable } from "svelte/store";

export let resize_parameters = writable({
    old_hex_width: 0,
    old_hex_height: 0,
    old_gap: 0
})