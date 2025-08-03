import { type Tileset } from "../types/tilesets";
import { ScaleMode } from "../helpers/imageSizing";

const convert_pre_v3_to_v4 = (old: Tileset): Tileset => {
	const t = {...old}

	// All tile symbols turned into Icons
	t.tiles.forEach(tile => {
	  if (tile.symbol) {
	    tile.symbol.scaleMode = ScaleMode.RELATIVE
	  }

	  //@ts-ignore - v3 and below had only one preview, which was flat top
	  tile.preview_flatTop = tile.preview


	  // TODO: generate pointy top preview

	  //@ts-ignore
	  delete tile.preview
	})



	// Introduce supported orientations
	t.supported_orientations = 'both';
	t.format_version = 4;

	return t;
}

export const convert_tileset_to_latest = (old: Tileset) => {
	let new_tileset: Tileset = {...old}
	if (!old.format_version || old.format_version < 4) {
		new_tileset = convert_pre_v3_to_v4(new_tileset);
	}

	return new_tileset;
}
