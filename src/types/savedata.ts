import type { coordinates_data, overlay_data } from './data';
import type { IconLayerIcon, Iconset } from './icon';
import type { path_style } from './path'
import type { terrain_field } from './terrain';
import type { Tileset } from './tilesets';

const LATESTSAVEDATAVERSION = 11;
const LATESTDEFAULTICONSVERSION = 5;

interface save_data {
	saveVersion: number;
	title: string;

	coords: coordinates_data;

	TerrainField: terrain_field;
	tilesets: Tileset[];
	iconsets: Iconset[];

	icon_hex_size_percentage: number;

	overlay: overlay_data;

	paths: [];
	texts: [];
	icons: IconLayerIcon[];

	pathStyles: path_style[];
	textStyles: any[];
}

export type { save_data }
export { LATESTDEFAULTICONSVERSION, LATESTSAVEDATAVERSION }