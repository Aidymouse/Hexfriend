import type { map_shape } from './settings';
import type { Tile } from './tilesets';
import type { hex_id } from './toolData';
import type * as PIXI from 'pixi.js';


export enum HexOrientation {
	FLATTOP = 'flatTop',
	POINTYTOP = 'pointyTop',
}

export enum hex_raised {
	EVEN = 'even',
	ODD = 'odd',
}

// Hexes are the data that get drawn as terrain
export type TerrainHex = {
	// If no tile, the hex is blank
	tile: Tile | null;

	q: number;
	r: number;
	s: number;
}

export type terrain_field = {
	hexWidth: number;
	hexHeight: number;

	grid: { stroke: number; thickness: number; gap: number; shown: boolean; };

	mapShape: map_shape;
	largehexes: {
		shown: boolean;
		style: { width: number; color: number };
		offset: { x: number; y: number };
		diameterInHexes: number;
		raised: hex_raised;
		encompassEdges: boolean;
	};

	/* Radial Maps */
	hexesOut: number;

	/* All has to do with square maps */
	rows: number;
	columns: number;
	raised: hex_raised;

	orientation: HexOrientation;
	blankHexColor: number;

	hexes: { [key: hex_id]: TerrainHex };
}
