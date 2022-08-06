import type { map_type } from './settings';
import type { Tile } from './tilesets';
import type { hex_id } from './toolData';
import type * as PIXI from 'pixi.js'

export enum hex_orientation {
	FLATTOP = "flatTop",
	POINTYTOP = "pointyTop"
}

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

	grid: { stroke: number; thickness: number; shown: boolean; overlay: boolean; overlayStyle?: PIXI.LineStyle };

	mapType: map_type;

	/* Radial Maps */
	hexesOut: number;

	/* All has to do with square maps */
	rows: number;
	columns: number;
	raised: 'odd' | 'even';

	orientation: hex_orientation;
	blankHexColor: number;

	hexes: { [key: hex_id]: TerrainHex };
}
