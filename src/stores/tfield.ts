import { writable } from 'svelte/store';

import type { terrain_field } from 'src/types/terrain';

let tfield: terrain_field;

export let store = writable(tfield);