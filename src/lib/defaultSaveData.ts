import { coords_qToCube, genHexId } from '../helpers/hexHelpers';
import { coord_system } from '../types/coordinates';
import type { coordinates_data } from '../types/data';
import type { Iconset } from '../types/icon';
import type { save_data } from '../types/savedata';
import { map_type } from '../types/settings';
import type { terrain_field } from '../types/terrain';
import type { Tile, Tileset } from '../types/tilesets';
import { DEFAULTICONSET } from './defaultIconset';
import { DEFAULTTILESET } from './defaultTileset';

const CURRENTSAVEVERSION = 1;

let DEFAULTSAVEDATA: save_data = {
	saveVersion: CURRENTSAVEVERSION,
	title: '',

	TerrainField: {
		hexWidth: 50,
		hexHeight: 45,
		orientation: 'flatTop',

		rows: 20,
		columns: 20,
		raised: 'even', // Which row / column should be higher / indented. This is implemented with an invisible hex. It's all quite messy.

		hexesOut: 10,

		mapType: map_type.SQUARE,
		blankHexColor: 0xf2f2f2,

		grid: { stroke: 0x333333, thickness: 2, shown: true },

		hexes: {},
	},

	coords: {
		shown: false,
		style: { fill: 0x000000, fontSize: 10, stroke: 0xffffff, strokeThickness: 2, fontFamily: 'Segoe UI' },
		system: coord_system.ROWCOL,
		seperator: '.',
		gap: 4,
	},

	tilesets: [DEFAULTTILESET],

	iconsets: [DEFAULTICONSET],

	paths: [],
	icons: [],
	texts: [],

	pathStyles: [
		{ display: 'River', style: { color: 10813439, width: 6, cap: 'round', join: 'round' } },
		{ display: 'Path', style: { color: 16774327, width: 4, cap: 'round', join: 'bevel' } },
		{ display: 'Trail', style: { color: 16367733, width: 3, cap: 'round', join: 'round' } },
		{ display: 'Pass', style: { color: 12632256, width: 5, cap: 'round', join: 'miter' } },
		{ display: 'Border', style: { color: 16711680, width: 5, cap: 'round', join: 'round' } },
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
		},
	],
};

//console.log(JSON.stringify(DEFAULTSAVEDATA.tilesets['default']))

for (let col = 0; col < DEFAULTSAVEDATA.TerrainField.columns; col++) {
	for (let row = 0; row < DEFAULTSAVEDATA.TerrainField.rows; row++) {
		let cubeCoords = coords_qToCube('even', col, row);
		let q = cubeCoords.q;
		let r = cubeCoords.r;
		let s = cubeCoords.s;

		DEFAULTSAVEDATA.TerrainField.hexes[genHexId(q, r, s)] = { q: q, r: r, s: s, tile: null };
	}
}

export default DEFAULTSAVEDATA;
