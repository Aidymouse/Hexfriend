import type { coordinates_data, overlay_data } from './data';
import type { Iconset } from './icon';
import type { path_style } from './path'
import type { terrain_field } from './terrain';
import type { Tileset } from './tilesets';

const LATESTSAVEDATAVERSION = 7;
const LATESTDEFAULTTILESVERSION = 4;
const LATESTDEFAULTICONSVERSION = 5;

interface save_data {
	saveVersion: number;
	title: string;

	coords: coordinates_data;

	TerrainField: terrain_field;
	tilesets: Tileset[];
	iconsets: Iconset[];

	overlay: overlay_data;

	paths: [];
	texts: [];
	icons: [];

	pathStyles: path_style[];
	textStyles: any[];
}

export type { save_data }
export { LATESTDEFAULTICONSVERSION, LATESTDEFAULTTILESVERSION, LATESTSAVEDATAVERSION }