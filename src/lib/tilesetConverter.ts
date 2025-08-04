import { type Tileset } from "../types/tilesets";
import { ScaleMode } from "../helpers/imageSizing";
import * as PIXI from 'pixi.js'
import { generate_tile_previews } from '../helpers/tileFns'
import { HexOrientation } from '../types/terrain'
import { DEFAULT_BLANK_HEX_COLOR_STRING } from '../types/defaults'

function convert_v1_to_v2(old_tileset: Tileset): Tileset {

	console.log(`Updating tileset (${old_tileset.name}) format: 1 -> 2`)

	old_tileset.tiles.forEach(tile => {
		tile.tileset_id = old_tileset.id
	})

	// Collapsed
	old_tileset.collapsed = false

	old_tileset.format_version = 2

	return old_tileset

}

function convert_v2_to_v3(old_tileset: Tileset): Tileset {

	console.log(`Updating tileset (${old_tileset.name}) format: 2 -> 3`)

	// Tile Symbol Rotation
	old_tileset.tiles.forEach(tile => {
		if (tile.symbol) tile.symbol.rotation = 0;
	})

	old_tileset.format_version = 3

	return old_tileset

}

const convert_v3_to_v4 = async (old: Tileset): Promise<Tileset> => {
	console.log(`Updating tileset (${old.name}) format: 3 -> 4`)

	const t = { ...old }

	// All tile symbols turned into Icons
	let spr = new PIXI.Sprite();
	let app = new PIXI.Application()
	let cont = new PIXI.Container()
	let grph = new PIXI.Graphics()

	t.tiles.forEach(async (tile) => {

		if (tile.symbol) {
			tile.symbol.scaleMode = ScaleMode.RELATIVE
			tile.symbol.id = `${tile.id}_symbol`
			tile.symbol.display = ""
			tile.symbol.texId = `${tile.id}_symbol`
			tile.symbol.rotation = 0
		}

		const previews = await generate_tile_previews(tile, { hexWidth: 50, hexHeight: 43.3, orientation: HexOrientation.FLATTOP, color: DEFAULT_BLANK_HEX_COLOR_STRING }, spr, grph, cont, app)
		//@ts-ignore - v3 and below had only one preview, which was flat top
		tile.preview_flatTop = previews.flatTop
		tile.preview_pointyTop = previews.pointyTop


		// TODO: generate pointy top preview

		//@ts-ignore
		delete tile.preview
	})



	// Introduce supported orientations
	t.supported_orientations = 'both';
	t.format_version = 4;

	return t;
}

export const convert_tileset_to_latest = async (old: Tileset) => {
	let new_tileset: Tileset = { ...old }
	if (!new_tileset.format_version || new_tileset.format_version === 1) { new_tileset = convert_v1_to_v2(new_tileset) }
	if (new_tileset.format_version === 2) { new_tileset = convert_v2_to_v3(new_tileset) }
	if (new_tileset.format_version === 3) { new_tileset = await convert_v3_to_v4(new_tileset); }

	return new_tileset;
}
