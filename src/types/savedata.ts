import type { coordinates_data } from './data';
import type { Iconset } from './icon';
import type { terrain_field } from './terrain';
import type { Tileset } from './tilesets';

export const LATESTSAVEDATAVERSION = 4;

export interface save_data {
	saveVersion: number;
	title: string;

	coords: coordinates_data;

	TerrainField: terrain_field;
	tilesets: Tileset[];
	iconsets: Iconset[];
	paths: [];
	texts: [];
	icons: [];

	pathStyles: any[];
	textStyles: any[];
}
