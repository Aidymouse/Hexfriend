import { writable } from 'svelte/store'
import type TerrainLayer from '../layers/TerrainLayer.svelte'

type ComponentsStoreType = {
  terrainLayer?: TerrainLayer
}

export const store_components = writable<ComponentsStoreType>({
  terrainLayer: undefined,
})
