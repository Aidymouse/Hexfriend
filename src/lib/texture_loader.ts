import * as PIXI from 'pixi.js'

import type { Iconset } from '../types/icon'
import type { Tile, Tileset } from '../types/tilesets'
import type { Texture } from 'pixi.js'

// ICON TEXTURES //
export let loaded_icon_textures: { [key: string]: Texture } = {}
export let icon_texture_lookup_table: { [key: string]: string } = {}

export async function load_icon_texture(icon_id: string, base64: string) {
	let new_texture = await PIXI.Assets.load(base64);
	console.log(`Loading Icon Texture with id: ${icon_id}`)

	loaded_icon_textures[icon_id] = new_texture
	
	/*
	if (PIXI.Assets.cache.has(icon_id)) {
		new_texture = PIXI.Cache.get(base64);
		icon_texture_lookup_table[icon_id] = new_texture.textureCacheIds[1]

	} else {
		PIXI.Assets.add(icon_id, base64)
		loaded_icon_textures[icon_id] = await PIXI.Assets.load(icon_id)
		new_texture = loaded_icon_textures[icon_id]
		icon_texture_lookup_table[icon_id] = icon_id

	}
	*/

	return new_texture
}

export async function load_iconset_textures(iconset: Iconset) {
	for (const icon of iconset.icons) {
        await load_icon_texture(icon.texId, icon.base64)
	}
}

export function get_icon_texture(icon_id: string): Texture {
    return loaded_icon_textures[ icon_id ] 
}




// SYMBOL TEXTURES //
export let loaded_symbol_textures: { [key: string]: Texture } = {}
export let symbol_texture_lookup_table: { [key: string]: string } = {}

async function load_symbol_texture(texture_id: string, base64: string) {

	loaded_symbol_textures[ texture_id ] = await PIXI.Assets.load(base64);

}

export async function load_tileset_textures(tileset: Tileset) {
  for (const tile of tileset.tiles) {
		
    if (!tile.symbol) { continue; }

    let tile_symbol_texture_id = `${tile.tileset_id}:${tile.id}`
    await load_symbol_texture(tile_symbol_texture_id, tile.symbol.base64)

  }
}

export function get_symbol_texture(tile: Tile): Texture {
  let tile_symbol_texture_id = `${tile.tileset_id}:${tile.id}`
	
  return loaded_symbol_textures[ tile_symbol_texture_id ]
}

