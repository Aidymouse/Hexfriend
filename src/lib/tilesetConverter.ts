import { type Tileset } from "../types/tilesets";

const convert_pre_v3_to_v4 = (old: Tileset): Tileset => {
	const t = {...old}

	// All tile symbols turned into Icons
	t.tiles.forEach(tile => {
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
