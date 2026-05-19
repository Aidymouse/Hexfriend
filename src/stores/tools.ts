import { get, writable } from 'svelte/store';

import { Tools } from '../types/toolData';

export let store_selected_tool = writable<Tools>(Tools.TERRAIN);
