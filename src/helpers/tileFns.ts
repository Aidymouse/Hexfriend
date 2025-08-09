import * as PIXI from 'pixi.js'
import { type Tile } from '../types/tilesets'
import { HexOrientation } from '../types/terrain'
import { getHexPathRadius, getHexPath } from './hexHelpers'
import { get_icon_scale_for_hex } from './imageSizing'
import { type PreviewHexInfo } from './iconFns'
import { get_symbol_texture } from '../lib/texture_loader'
import { type Tileset } from '../types/tilesets'


/** Generates a flat top and pointy top preview for a tile. Width and height are swapped for the opposite of the provided hex orientation, to preserve aspect ratio of the hex
 * @param tile
 * @param preview_hex_info
 * @param spr - A pixi sprite to serve as the symbol
 * @param grpg - A pixi graphics to draw the hex bg
 * @param cont - A pixi container from which the result base64 will be extractead. Both grph and spr should be in cont (with spr higher than cont)
 * @param app
 * @returns an object with a base64 string for both the flat top and pointy top preview
 * */
const debug = false;
export async function generate_tile_previews(tile: Tile, preview_hex_info: PreviewHexInfo, spr: PIXI.Sprite, grph: PIXI.Graphics, cont: PIXI.Container, app: PIXI.Application, load_texture_from_tile: boolean = false) {

	const preview_hex_ft = { ...preview_hex_info, orientation: HexOrientation.FLATTOP }
	if (preview_hex_info.orientation === HexOrientation.POINTYTOP) {
		preview_hex_ft.hexHeight = preview_hex_info.hexWidth
		preview_hex_ft.hexWidth = preview_hex_info.hexHeight
	}
	const preview_ft = await generate_tile_preview(tile, preview_hex_ft, spr, grph, cont, app, load_texture_from_tile)

	const preview_hex_pt = { ...preview_hex_info, orientation: HexOrientation.POINTYTOP }
	if (preview_hex_info.orientation === HexOrientation.FLATTOP) {
		preview_hex_pt.hexHeight = preview_hex_info.hexWidth
		preview_hex_pt.hexWidth = preview_hex_info.hexHeight
	}
	const preview_pt = await generate_tile_preview(tile, preview_hex_pt, spr, grph, cont, app, load_texture_from_tile)

	return { flatTop: preview_ft, pointyTop: preview_pt }
}

export async function generate_tile_preview(tile: Tile, preview_hex_info: PreviewHexInfo, spr: PIXI.Sprite, grph: PIXI.Graphics, cont: PIXI.Container, app: PIXI.Application, load_texture_from_tile: boolean = false) {
		//debug && console.log('generate_tile_previews', 'for', tile);
		debug && console.log('generate_tile_previews', 'on', preview_hex_info);
	spr.anchor.set(0.5);
	spr.texture = null
	if (tile.symbol) {
		let tex = get_symbol_texture(tile)
		if (load_texture_from_tile) {
			tex = await PIXI.Assets.load(tile.symbol.base64)
			debug && console.log('generate_tile_previews', 'loaded tex from', tile.symbol.base64);
		}

		debug && console.log('generate_tile_previews', 'tex', tex);


		spr.texture = tex
		// tile.symbol.texWidth = tex.width
		// tile.symbol.texHeight = tex.height
		spr.tint = tile.symbol.color

		// Flat Top Sprite
		const symbol_scale = get_icon_scale_for_hex(tile.symbol, preview_hex_info)
		debug && console.log('generate_tile_previews', 'scale', symbol_scale);
		debug && console.log('generate_tile_previews', 'resultant tex dimensions', {width: tile.symbol.texWidth * symbol_scale.x, height: tile.symbol.texHeight * symbol_scale.y});
		const mtrx = new PIXI.Matrix()
			.rotate(PIXI.DEG_TO_RAD * tile.symbol.rotation)
			.scale(symbol_scale.x, symbol_scale.y)
		spr.transform.setFromMatrix(mtrx)
	}

	grph.clear()
	grph.beginFill(tile.bgColor)
	grph.drawPolygon(getHexPath(preview_hex_info.hexWidth, preview_hex_info.hexHeight, preview_hex_info.orientation, 0, 0))
	grph.endFill()
	const preview = await app.renderer.extract.base64(cont)

	return preview

}

/** Makes a copy of a tileset updated to have a new ID */
export const copy_tileset = (set: Tileset, new_id: string) => {
	let new_tileset = {...set}
	new_tileset.id = new_id
	for (const tile of new_tileset.tiles) {
		tile.tileset_id = new_id
	}

	return new_tileset
}
