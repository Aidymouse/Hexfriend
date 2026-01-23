import { get, writable } from 'svelte/store'

import { tools } from '../types/toolData'

export let store_selected_tool = writable(tools.TERRAIN)
