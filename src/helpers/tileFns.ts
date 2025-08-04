import * as PIXI from 'pixi.js'
import { type Tile } from '../types/tilesets'
import { HexOrientation } from '../types/terrain'
import { getHexPathRadius, getHexPath } from './hexHelpers'
import { get_icon_scale_for_hex } from './imageSizing'
import { type PreviewHexInfo } from './iconFns'


/** Generates a flat top and pointy top preview for a tile 
 * @param tile
 * @param preview_hex_info
 * @param spr - A pixi sprite to serve as the symbol
 * @param grpg - A pixi graphics to draw the hex bg
 * @param cont - A pixi container from which the result base64 will be extractead. Both grph and spr should be in cont (with spr higher than cont)
 * @param app
 * @returns an object with a base64 string for both the flat top and pointy top preview
 * */
export async function generate_tile_previews(tile: Tile, preview_hex_info: PreviewHexInfo, spr: PIXI.Sprite, grph: PIXI.Graphics, cont: PIXI.Container, app: PIXI.Application) {
	spr.anchor.set(0.5);
	spr.texture = null
	if (tile.symbol) {
		const tex = await PIXI.Assets.load(tile.symbol.base64)
		spr.texture = tex
		tile.symbol.texWidth = tex.width
		tile.symbol.texHeight = tex.height
		spr.tint = tile.symbol.color

		// Flat Top Sprite
		const symbol_scale = get_icon_scale_for_hex(tile.symbol, preview_hex_info)
		const mtrx = new PIXI.Matrix()
			.rotate(PIXI.DEG_TO_RAD * tile.symbol.rotation)
			.scale(symbol_scale.x, symbol_scale.y)
		spr.transform.setFromMatrix(mtrx)
	}

	// Flat Top
	grph.clear()
	grph.beginFill(tile.bgColor)
	grph.drawPolygon(getHexPath(preview_hex_info.hexWidth, preview_hex_info.hexHeight, HexOrientation.FLATTOP, 0, 0))
	grph.endFill()
	const preview_ft = await app.renderer.extract.base64(cont)

	// Pointy Top
	grph.clear()
	grph.beginFill(tile.bgColor)
	grph.drawPolygon(getHexPath(preview_hex_info.hexWidth, preview_hex_info.hexHeight, HexOrientation.POINTYTOP, 0, 0))
	grph.endFill()

	const preview_pt = await app.renderer.extract.base64(cont)

	// tile.preview_pointyTop = preview_pt
	// tile.preview_flatTop = preview_ft
	// tile = { ...tile, preview_pointyTop: preview_pt, preview_flatTop: preview_ft }
	// selectedTile = selectedTile
	// previews[tile.id] = {
	//   [HexOrientation.FLATTOP]: preview_ft,
	//   [HexOrientation.POINTYTOP]: preview_pt,
	// }

	// tile.preview_flatTop = preview_ft
	// tile.preview_pointyTop = preview_pt

	return { flatTop: preview_ft, pointyTop: preview_pt }
}
