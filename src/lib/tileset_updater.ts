import type { terrain_field } from "../types/terrain";
import type { Tileset } from "../types/tilesets";

/** @deprecated - This file now longer used */

// Names that get mapped to are up to date as of v7 of the default tileset
// May be missing some names to map from, there's an alert if the update process fails because of this directing them to the issues thread
const tile_id_map = {

    // v3
    "default:v3_plains": "plains",
    "default:v3_farmland": "farmland",
    "default:v3_grassland": "grassland",
    "default:v3_tree": "tree",
    "default:v3_forest": "forest",
    "default:v3_beach": "beach",
    "default:v3_palm-tree": "palm-tree",
    "default:v3_water": "water",
    "default:v3_deep-water": "deep-water",
    "default:v3_hills": "hills",
    "default:v3_mountain": "mountain",
    "default:v3_mountains": "mountains",
    "default:v3_volcano": "volcano",
    "default:v3_badlands": "badlands",
    "default:v3_desert": "desert",
    "default:v3_grassy-hills": "grassy-hills",
    "default:v3_forest-hills": "forest-hills",
    "default:v3_forest-mountain": "forest-mountain",
    "default:v3_pine-tree": "pine-tree",
    "default:v3_pine-forest": "pine-forest",
    "default:v3_pine-hills": "pine-hills",
    "default:v3_pine-mountains": "pine-mountains",
    "default:v3_icy": "icy",
    "default:v3_ice-tree": "ice-tree",
    "default:v3_ice-hills": "ice-hills",
    "default:v3_ice-mountain": "ice-mountain",
    "default:v3_ice-pine mountains": "ice-pine-mountains",
    "default:v3_ice-mountains": "ice-mountains",
    "default:v3_marsh": "marsh",
    "default:v3_swamp": "swamp",
    "default:v3_jungle-tree1": "jungle-tree",
    "default:v3_dense-jungle1": "dense-jungle",
    "default:v3_jungle-hills1": "jungle-hills",
    "default:v3_jungle-mountains1": "jungle-mountains",
    "default:v3_dead-tree1": "dead-tree",
    "default:v3_dead-tree hills1": "dead-tree-hills",
    "default:v3_dead-tree mountains": "dead-tree-mountains",

    "default_plains": "plains",
    "default_farmland": "farmland",
    "default_grassland": "grassland",
    "default_tree": "tree",
    "default_forest": "forest",
    "default_beach": "beach",
    "default_palm-tree": "palm-tree",
    "default_water": "water",
    "default_deep-water": "deep-water",
    "default_hills": "hills",
    "default_mountain": "mountain",
    "default_mountains": "mountains",
    "default_volcano": "volcano",
    "default_badlands": "badlands",
    "default_desert": "desert",
    "default_grassy-hills": "grassy-hills",
    "default_forest-hills": "forest-hills",
    "default_forest-mountain": "forest-mountain",
    "default_pine-tree": "pine-tree",
    "default_pine-forest": "pine-forest",
    "default_pine-hills": "pine-hills",
    "default_pine-mountains": "pine-mountains",
    "default_icy": "icy",
    "default_ice-tree": "ice-tree",
    "default_ice-hills": "ice-hills",
    "default_ice-mountain": "ice-mountain",
    "default_ice-pine mountains": "ice-pine-mountains",
    "default_ice-mountains": "ice-mountains",
    "default_marsh": "marsh",
    "default_swamp": "swamp",
    "default_jungle-tree1": "jungle-tree",
    "default_dense-jungle1": "dense-jungle",
    "default_jungle-hills1": "jungle-hills",
    "default_jungle-mountains1": "jungle-mountains",
    "default_dead-tree1": "dead-tree",
    "default_dead-tree hills1": "dead-tree-hills",
    "default_dead-tree mountains": "dead-tree-mountains",

    // v6
    "plains1": "plains",
    "farmland1": "farmland",
    "grassland1": "grassland",
    "scrubland1": "scrubland",
    "tree1": "tree",
    "forest1": "forest",
    "beach1": "beach",
    "palm-tree1": "palm-tree",
    "water1": "water",
    "deep-water1": "deep-water",
    "hills1": "hills",
    "mountain1": "mountain",
    "mountains1": "mountains",
    "volcano1": "volcano",
    "badlands1": "badlands",
    "desert1": "desert",
    "grassy-hills1": "grassy-hills",
    "forest-hills1": "forest-hills",
    "forest-mountain1": "forest-mountain",
    "pine-tree1": "pine-tree",
    "pine-forest1": "pine-forest",
    "pine-hills1": "pine-hills",
    "pine-mountains1": "pine-mountains",
    "icy1": "icy",
    "ice-tree1": "ice-tree",
    "ice-hills1": "ice-hills",
    "ice-mountain1": "ice-mountain",
    "ice-pine-mountains1": "ice-pine-mountains",
    "ice-mountains1": "ice-mountains",
    "marsh1": "marsh",
    "swamp1": "swamp",
    "jungle-tree1": "jungle-tree",
    "dense-jungle1": "dense-jungle",
    "jungle-hills1": "jungle-hills",
    "jungle-mountains1": "jungle-mountains",
    "dead-tree1": "dead-tree",
    "dead-tree-hills1": "dead-tree-hills",
    "dead-tree-mountains1": "dead-tree-mountains",

    // For more recent versions of the map. Catch all for tiles that are up to date
    "plains": "plains",
    "farmland": "farmland",
    "grassland": "grassland",
    "scrubland": "scrubland",
    "tree": "tree",
    "forest": "forest",
    "beach": "beach",
    "palm-tree": "palm-tree",
    "water": "water",
    "deep-water": "deep-water",
    "hills": "hills",
    "mountain": "mountain",
    "mountains": "mountains",
    "volcano": "volcano",
    "badlands": "badlands",
    "desert": "desert",
    "grassy-hills": "grassy-hills",
    "forest-hills": "forest-hills",
    "forest-mountain": "forest-mountain",
    "pine-tree": "pine-tree",
    "pine-forest": "pine-forest",
    "pine-hills": "pine-hills",
    "pine-mountains": "pine-mountains",
    "icy": "icy",
    "ice-tree": "ice-tree",
    "ice-hills": "ice-hills",
    "ice-mountain": "ice-mountain",
    "ice-pine-mountains": "ice-pine-mountains",
    "ice-mountains": "ice-mountains",
    "marsh": "marsh",
    "swamp": "swamp",
    "jungle-tree": "jungle-tree",
    "dense-jungle": "dense-jungle",
    "jungle-hills": "jungle-hills",
    "jungle-mountains": "jungle-mountains",
    "dead-tree": "dead-tree",
    "dead-tree-hills": "dead-tree-hills",
    "dead-tree-mountains": "dead-tree-mountains",



}

export function update_map_to_new_default_tileset(tfield: terrain_field) {

    let covered_in_map = true
    // Check to make sure all hexes have a substitute in the map, if they don't ax em.
    for (const hex_id of Object.keys(tfield.hexes)) {
        let hex = tfield.hexes[hex_id]

        if (hex.tile == null) continue;
        if (hex.tile.tileset_id != "default") continue;

        if (!tile_id_map[hex.tile.id]) {
            console.log(`Couldn't find ${hex.tile.id} in map`)
            covered_in_map = false;
        }
    }

    if (!covered_in_map) {
        alert("Default tiles could not be updated. You are on an as-of-yet unaccounted for version of the old tileset. Please export your map as a .hexfriend and upload it to https://github.com/Aidymouse/Hexfriend/issues/25.")
        return false;
    }


    Object.keys(tfield.hexes).forEach(hex_id => {
        let hex = tfield.hexes[hex_id]

        if (hex.tile == null) return;
        if (hex.tile.tileset_id != "default") return;

        if (tile_id_map[hex.tile.id]) {
            hex.tile.id = tile_id_map[hex.tile.id]
        }
    })

    alert("Successfully updated default tileset!")
    return true;

}
