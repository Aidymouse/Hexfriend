import type { map_shape } from './settings';
import type { Tile } from './tilesets';
import type { hex_id } from './toolData';
import type * as PIXI from 'pixi.js'

export enum hex_orientation {
	FLATTOP = "flatTop",
	POINTYTOP = "pointyTop"
}

export enum hex_raised {
	EVEN = "even",
	ODD = "odd"
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

	grid: { stroke: number; thickness: number; shown: boolean; };

	mapShape: map_shape;
	overlay: {
		shown: boolean;
		style: {width: number; color: number; };
		offset: {x: number; y: number; };
		diameterInHexes: number;
		raised: hex_raised;
		encompassEdges: boolean;
	};

	shape: map_shape;

	/* Radial Maps */
	hexesOut: number;

	/* All has to do with square maps */
	rows: number;
	columns: number;
	raised: hex_raised;

	orientation: hex_orientation;
	blankHexColor: number;

	hexes: { [key: hex_id]: TerrainHex };
}
