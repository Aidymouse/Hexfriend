import type { coordinates_data } from '$lib/types/data';
import type { Iconset } from '$lib/types/icon';
import type { terrain_field } from '$lib/types/terrain';
import type { Tileset } from '$lib/types/tilesets';

export const LATESTSAVEDATAVERSION = 3;

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
