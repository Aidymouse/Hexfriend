import * as PIXI_Assets from '@pixi/assets'
import type { Iconset } from 'src/types/icon'
import type { Tileset } from 'src/types/tilesets'
import type { Texture } from 'pixi.js'

// ICON TEXTURES //
export let loaded_icon_textures: { [key: string]: Texture } = {}
export let icon_texture_lookup_table: { [key: string]: string } = {}

export async function load_icon_texture(icon_id: string, icon_base_64: string) {
    let new_texture: string;

		if (PIXI_Assets.Cache.has(icon_base_64 as string)) {
			new_texture = PIXI_Assets.Cache.get(icon_base_64 as string);
			icon_texture_lookup_table[icon_id] = new_texture.textureCacheIds[1]

		} else {
			PIXI_Assets.Assets.add(icon_id, icon_base_64 as string)
			loaded_icon_textures[icon_id] = await PIXI_Assets.Assets.load(icon_id)
			new_texture = loaded_symbol_textures[icon_id]
			icon_texture_lookup_table[icon_id] = icon_id

		}
		return new_texture
}

export function load_iconset_textures(iconset: Iconset) {
    iconset.icons.forEach(icon => {
        load_icon_texture(icon.texId, icon.base64)
    })
}

export function get_icon_texture(icon_id: string): Texture {
    return loaded_icon_textures[ icon_texture_lookup_table[icon_id] ] 
}




// SYMBOL TEXTURES //
export let loaded_symbol_textures: { [key: string]: Texture } = {}
export let symbol_texture_lookup_table: { [key: string]: string } = {}

async function load_symbol_texture(texture_id: string, base64: string) {
		let new_texture: string;

		if (PIXI_Assets.Cache.has(base64 as string)) {
			new_texture = PIXI_Assets.Cache.get(base64 as string);
			symbol_texture_lookup_table[texture_id] = new_texture.textureCacheIds[1]

		} else {
			PIXI_Assets.Assets.add(texture_id, base64 as string)
			loaded_symbol_textures[texture_id] = await PIXI_Assets.Assets.load(texture_id)
			new_texture = loaded_symbol_textures[texture_id]
			symbol_texture_lookup_table[texture_id] = texture_id

		}
		return new_texture
}

export function load_tileset_textures(tileset: Tileset) {
    tileset.tiles.forEach(tile => {

        if (!tile.symbol) return;

        load_symbol_texture(tile.id, tile.symbol.base64)

    })
}

export function get_symbol_texture(tile_id: string): Texture {
    return loaded_symbol_textures[ symbol_texture_lookup_table[tile_id] ]
}

