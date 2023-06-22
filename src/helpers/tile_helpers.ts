import type { Tile } from "../types/tilesets" 

function tile_to_id(tile: Tile) {
    return `{"tile_id": "${tile.id}", "tileset_id": "${tile.tileset_id}"}`
}

function tile_to_tileset_id(tile: Tile) {
    return JSON.parse(tile.id).tileset_id;
}

export { tile_to_id, tile_to_tileset_id }