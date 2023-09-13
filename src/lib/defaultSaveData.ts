import { coords_qToCube, genHexId } from '../helpers/hexHelpers';
import { coord_system } from '../types/coordinates';
import type { coordinates_data } from '../types/data';
import type { Iconset } from '../types/icon';
import type { save_data } from '../types/savedata';
import { LATESTSAVEDATAVERSION } from '../types/savedata';
import { map_shape } from '../types/settings';
import { hex_orientation, hex_raised, terrain_field } from '../types/terrain';
import type { Tile, Tileset } from '../types/tilesets';
import { DEFAULTICONSET } from './defaultIconset';
import { DEFAULTTILESET } from './defaultTileset';

let DEFAULTSAVEDATA: save_data = {
	saveVersion: LATESTSAVEDATAVERSION,
	title: '',

	TerrainField: {
		hexWidth: 50,
		hexHeight: 45,
		orientation: hex_orientation.FLATTOP,

		rows: 20,
		columns: 20,
		raised: hex_raised.EVEN, // Which row / column should be higher / indented. This is implemented with an invisible hex. It's all quite messy.

		hexesOut: 7,
		mapShape: map_shape.FLOWER,

		blankHexColor: 0xf2f2f2,

		grid: { stroke: 0x333333, thickness: 1, gap: 0, shown: true },

		largehexes: {
			shown: false,
			style: { width: 3, color: 0x333333 },
			offset: { x: 0, y: 1 },
			diameterInHexes: 3,
			raised: hex_raised.EVEN,
			encompassEdges: false,
		},

		hexes: {}, // Populated below
	},

	icon_hex_size_percentage: 80,

	coords: {
		shown: false,
		style: { fill: 0x000000, fontSize: 10, stroke: 0xffffff, strokeThickness: 2, fontFamily: 'Segoe UI' },
		system: coord_system.ROWCOL,
		seperator: '.',
		gap: 4,
		offsets: {
			row_col: {row: 0, col: 0},
			cube: {q: 0, r: 0, s: 0}
		}
	},

	tilesets: [DEFAULTTILESET],

	iconsets: [DEFAULTICONSET],

	overlay: {
		base64: "",
		shown: true,
		x: 0,
		y: 0,
		scale: {x: 1, y: 1},
		opacity: 0.5,
	},

	paths: [],
	icons: [],
	texts: [],

	pathStyles: [
		{ display: 'River', style: { color: 10742015, width: 6, cap: 'round', join: 'round', dashed: false, dash_length: 10, dash_gap: 5 }, id: 1 },
		{ display: 'Path', style: { color: 16774327, width: 4, cap: 'round', join: 'round', dashed: false, dash_length: 10, dash_gap: 5 }, id: 2 },
		{ display: 'Trail', style: { color: 16367733, width: 3, cap: 'round', join: 'round', dashed: false, dash_length: 10, dash_gap: 5 }, id: 3 },
		{ display: 'Pass', style: { color: 12632256, width: 5, cap: 'round', join: 'round', dashed: false, dash_length: 10, dash_gap: 5 }, id: 4 },
		{ display: 'Border', style: { color: 16711680, width: 5, cap: 'round', join: 'round', dashed: false, dash_length: 10, dash_gap: 5 }, id: 5 },
		{ display: 'Minor Border', style: { color: 16711680, width: 4, cap: 'round', join: 'round', dashed: true, dash_length: 15, dash_gap: 10 }, id: 6 },
	],

	textStyles: [
		{
			display: 'Region',
			style: {
				fontFamily: 'Times New Roman',
				fill: '#ffffff',
				fontSize: 50,
				miterLimit: 2,
				strokeThickness: 10,
				stroke: '#000000',
				align: 'left',
				fontStyle: 'normal',
				fontWeight: 'normal',
			},
			id: 0,
		},
		{
			display: 'Barony',
			style: {
				fontFamily: 'Times New Roman',
				fill: '#ffffff',
				fontSize: 40,
				miterLimit: 2,
				strokeThickness: 8,
				stroke: '#713800',
				align: 'left',
				fontStyle: 'normal',
				fontWeight: 'normal',
			},
			id: 1,
		},
		{
			display: 'City',
			style: {
				fontFamily: 'Segoe UI',
				fill: '#ffffff',
				fontSize: 30,
				miterLimit: 2,
				strokeThickness: 5,
				stroke: '#800000',
				align: 'left',
				fontStyle: 'normal',
				fontWeight: 'normal',
			},
			id: 2,
		},
		{
			display: 'Town',
			style: {
				fontFamily: 'Segoe UI',
				fill: '#ffffff',
				fontSize: 25,
				miterLimit: 2,
				strokeThickness: 5,
				stroke: '#000066',
				align: 'left',
				fontStyle: 'normal',
				fontWeight: 'normal',
			},
			id: 3,
		},
		{
			display: 'Village',
			style: {
				fontFamily: 'Segoe UI',
				fill: '#000000',
				fontSize: 20,
				miterLimit: 2,
				strokeThickness: 0,
				stroke: '#ffffff',
				align: 'left',
				fontStyle: 'normal',
				fontWeight: 'normal',
			},
			id: 4,
		},
		{
			display: 'River',
			style: {
				fontFamily: 'Segoe UI',
				fill: '#000000',
				fontSize: 17,
				miterLimit: 2,
				strokeThickness: 3,
				stroke: '#ffffff',
				align: 'left',
				fontStyle: 'italic',
				fontWeight: 'normal',
			},
			id: 5,
		},
		{
			display: 'Dungeon',
			style: {
				fontFamily: 'Segoe UI',
				fill: '#ffffff',
				fontSize: 20,
				miterLimit: 2,
				strokeThickness: 6,
				stroke: '#aa0000',
				align: 'left',
				fontStyle: 'normal',
				fontWeight: 'bold',
			},
			id: 6,
		},
	],
};

//console.log(JSON.stringify(DEFAULTSAVEDATA.tilesets['default']))

// FOr testing, generate a flower shaped map
let hexesOut = 7;

for (let q = -hexesOut; q <= hexesOut; q++) {
	for (let r = -hexesOut; r <= hexesOut; r++) {
		if (q + r <= hexesOut && q + r >= -hexesOut) {
			let s = -q - r;

			DEFAULTSAVEDATA.TerrainField.hexes[genHexId(q, r, s)] = { q: q, r: r, s: s, tile: null };
		}
	}
}

/*

for (let col = 0; col < DEFAULTSAVEDATA.TerrainField.columns; col++) {
	for (let row = 0; row < DEFAULTSAVEDATA.TerrainField.rows; row++) {
		let cubeCoords = coords_qToCube('even', col, row);
		let q = cubeCoords.q;
		let r = cubeCoords.r;
		let s = cubeCoords.s;

		DEFAULTSAVEDATA.TerrainField.hexes[genHexId(q, r, s)] = { q: q, r: r, s: s, tile: null };
	}
}

*/
export default DEFAULTSAVEDATA;
