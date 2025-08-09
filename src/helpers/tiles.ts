import { get_symbol_texture } from "../lib/texture_loader";
import type { Tile, Tileset } from "../types/tilesets" 

export function get_tileset_id(tileset: Tileset) {
    // The format of IDs didnt go through any sort of uniform change and so now I have to have this crappy function
    return tileset.id.split(":")[0]
}

export function tile_to_key(tile: Tile) {
    return JSON.stringify({ id: tile.id, tileset_id: tile.tileset_id })
}

export function tiles_match(tile1: Tile, tile2: Tile) {
    if (tile1 == null && tile2 != null) return false;
    if (tile1 != null && tile2 == null) return false;
    if (tile1 == null && tile2 == null) return true; // Both are blank

    // Return false if one has a symbol and one does not
    if (tile1.symbol != null && tile2.symbol == null) return false;
    if (tile1.symbol == null && tile2.symbol != null) return false;

    if (tile1.bgColor != tile2.bgColor) return false;

    if (tile1.symbol && tile2.symbol) {
        if (tile1.symbol.color != tile2.symbol.color) return false
        if (get_symbol_texture(tile1) != get_symbol_texture(tile2)) return false
        if (tile1.symbol.rotation !== tile2.symbol.rotation) return false
    }

    return true;
}
