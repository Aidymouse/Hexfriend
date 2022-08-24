import type { map_shape } from './settings';
import type { Tile } from './tilesets';
import type { hex_id } from './toolData';

// Hexes are the data that get drawn as terrain
export interface TerrainHex {
	// If no tile, the hex is blank
	tile: Tile | null;

	q: number;
	r: number;
	s: number;
}

export interface terrain_field {
	hexWidth: number;
	hexHeight: number;

	grid: { stroke: number; thickness: number; shown: boolean };

	mapShape: map_shape;

	/* Radial Maps */
	hexesOut: number;

	/* All has to do with square maps */
	rows: number;
	columns: number;
	raised: 'odd' | 'even';

	orientation: 'flatTop' | 'pointyTop';
	blankHexColor: number;

	hexes: { [key: hex_id]: TerrainHex };
}
