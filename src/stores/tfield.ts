import type { terrain_field } from 'src/types/terrain';
import { writable } from 'svelte/store';

let tfield: terrain_field;

export let store = writable(tfield);
