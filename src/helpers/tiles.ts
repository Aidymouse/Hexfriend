import type { Tile } from "../types/tilesets" 

export function tile_to_key(tile: Tile) {
    return JSON.stringify({ id: tile.id, tileset_id: tile.tileset_id })
}