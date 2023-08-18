import type { Tileset } from "../types/tilesets";

function tileset_format_1_to_2(old_tileset: Tileset): Tileset {

    console.log(`Updating tileset (${old_tileset.name}) format: 1 -> 2`)

    old_tileset.tiles.forEach(tile => {
        tile.tileset_id = old_tileset.id
    })

    old_tileset.format_version = 2

    return old_tileset

}

export function update_tileset_format(tileset: Tileset) {
    
    switch (tileset.format_version) {

        case undefined:
            tileset = tileset_format_1_to_2(tileset)

        case null:
            tileset = tileset_format_1_to_2(tileset)
            
        case 1:
            tileset = tileset_format_1_to_2(tileset)

    }

    return tileset

}



const tile_id_map = {

}

function update_map_to_new_default_tileset() {

}