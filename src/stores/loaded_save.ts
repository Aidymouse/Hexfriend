import { writable } from 'svelte/store'
import { type SaveData } from '../types'
import DEFAULTSAVEDATA from '../lib/defaultSaveData'

export const store_loaded_save = writable<SaveData>(DEFAULTSAVEDATA)
