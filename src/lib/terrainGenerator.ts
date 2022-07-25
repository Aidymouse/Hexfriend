// Every hex has a percentange chance that its neighbour will be a different terrain type

import type { terrain_field } from "../types/terrain";
import type { Tileset } from "../types/tilesets";

/* Terrain generating through wave function collapse! */

/* Each hex needs a list of values it can possibly be, listed as terrain Id */

let gf_test = {
	/* Terraom Id: [can connect to] */
	/* NOT default that all tiles can connect to themselves */
	default_Plains: ['default_Beach', 'default_Tree', 'default_hills', 'default_Plains'],
	default_Beach: ['default_Plains', 'default_Water', 'default_Beach'],
	default_Water: ['default_Beach', 'default_Water'],
	default_hills: ['default_Mountain', 'default_Plains', 'default_hills'],
	default_Mountain: ['default_hills', 'default_Mountain', 'default_Mountains'],
	default_Mountains: ['default_Mountain', 'default_Mountains'],
	default_Tree: ['default_Plains', 'default_Tree'],
	'default_Deep-Water': ['default_Water', 'default_Deep-Water'],
};

let gf_forested = {
	default_Plains: ['default_Tree', 'default_forest'],
	default_Tree: ['default_forest', 'default_Tree', 'default_Plains'],
	default_forest: ['default_forest', 'default_Tree'],
};

function collapseWaveGen(hexesOut: number, rules = gf_test) {
	// Generate Hexes
	let genHexes = {};
	let visitedHexIds = [];

	for (let q = -hexesOut; q <= hexesOut; q++) {
		for (let r = -hexesOut; r <= hexesOut; r++) {
			if (-q - r >= -hexesOut && -q - r <= hexesOut) {
				genHexes[genHexId(q, r, -q - r)] = { q: q, r: r, s: -q - r, id: null, domain: Object.keys(rules) };
			}
		}
	}

	let hexIds = Object.keys(genHexes);
	let firstHex = null;

	while (visitedHexIds.length < Object.keys(genHexes).length) {
		// Find hex with lowest weight
		let nextHex = genHexes[hexIds[0]];
		hexIds.forEach((hexId) => {
			if (genHexes[hexId].id != null) return;

			if (nextHex.id != null && genHexes[hexId].id == null) {
				nextHex = genHexes[hexId];
				return;
			}

			if (genHexes[hexId].domain.length < nextHex.domain.length) nextHex = genHexes[hexId];
		});

		/* Assign ID randomly from hexes domain (currently uniform) */
		//console.log(nextHex.q, nextHex.r, nextHex.s)
		//console.log(nextHex.domain)

		nextHex.id = nextHex.domain[rand(0, nextHex.domain.length)];
		if (firstHex) nextHex.id = firstHex;
		firstHex = null;

		/* Reduce neighbouring domains */
		let neighbourIds = getHexNeighbours(nextHex.q, nextHex.r, nextHex.s);
		neighbourIds.forEach((nId) => {
			let nHex = genHexes[nId];
			if (!nHex) return;
			if (nHex.id != null) return;

			// Iterate backwards through the neighbours domain
			for (let dI = nHex.domain.length - 1; dI >= 0; dI--) {
				let currentDomainStep = nHex.domain[dI];
				let currentHexAllowedNeighbours = rules[nextHex.id];

				if (currentHexAllowedNeighbours.find((domain) => domain == currentDomainStep)) {
					//console.log(currentDomainStep)
					continue;
				}
				nHex.domain.splice(dI, 1);
				//dI--
			}
		});

		/* Add current hex to visited pile */
		visitedHexIds.push(genHexId(nextHex.q, nextHex.r, nextHex.s));
	}

	return genHexes;
}

//console.log( collapseWaveGen(3, testGen) )

/*
let genFunction: {[key: string]: {[key:string]: number} } = {
    'default_plains': {'default_plains': 25, 'default_desert': 25, 'default_water': 25, 'default_tree': 25, 'default_deepwater': 0},
    'default_desert': { 'default_plains': 30, 'default_desert': 30, 'default_water': 20, 'default_tree': 20, 'default_deepwater': 0 },
    'default_water': { 'default_plains': 10, 'default_desert': 10, 'default_water': 10, 'default_tree': 20, 'default_deepwater': 50 },
    'default_tree': { 'default_plains': 15, 'default_desert': 5, 'default_water': 20, 'default_tree': 60, 'default_deepwater': 0 },
    'default_deepwater': { 'default_plains': 0, 'default_desert': 0, 'default_water': 50, 'default_tree': 0, 'default_deepwater': 50 },
}
*/

let genFunction: { [key: string]: { [key: string]: number } } = {
	default_plains: { default_plains: 50, default_desert: 0, default_water: 15, default_tree: 20, default_deepwater: 15 },
	default_desert: { default_plains: 30, default_desert: 30, default_water: 20, default_tree: 20, default_deepwater: 0 },
	default_water: { default_plains: 35, default_desert: 0, default_water: 40, default_tree: 25, default_deepwater: 0 },
	default_tree: { default_plains: 25, default_desert: 0, default_water: 10, default_tree: 65, default_deepwater: 0 },
	default_deepwater: { default_plains: 50, default_desert: 0, default_water: 0, default_tree: 0, default_deepwater: 50 },
};

function genHexId(q: number, r: number, s: number): string {
	return q.toString() + ':' + r.toString() + ':' + s.toString();
}

function rand(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getHexNeighbours(q: number, r: number, s: number): string[] {
	return [
		genHexId(q + 1, r, s - 1),
		genHexId(q + 1, r - 1, s),
		genHexId(q, r - 1, s + 1),
		genHexId(q - 1, r, s + 1),
		genHexId(q - 1, r + 1, s),
		genHexId(q, r + 1, s - 1),
	];
}

function generateTerrain(tfield: terrain_field, tileset: Tileset) {
	let addedNeighbours = [];
	let coloredHexes = []; // hexid's

	addedNeighbours.push({ generateFrom: null, hexId: '0:0:0' });

	let c = 0;

	while (addedNeighbours.length != 0) {
		c++;
		let cur = addedNeighbours.pop();
		let hex = tfield.hexes[cur.hexId];
		// Color self, then add neighbours

		// Color self
		let coloredBy: string;
		if (cur.generateFrom == null) {
			//console.log(n.hex)
			coloredBy = 'default_plains';
			colorWith(hex, 'default_plains', tileset);
		} else {
			let terrainNum: number = rand(1, 100);
			var cumChance = 0;

			for (let [id, chance] of Object.entries(genFunction[cur.generateFrom])) {
				cumChance += chance;

				if (terrainNum <= cumChance) {
					colorWith(hex, id, tileset);
					coloredBy = id;
					tfield.hexes = tfield.hexes;
					break;
				}
			}
		}

		// Push neighbours
		let hexNeighbours = getHexNeighbours(hex.q, hex.r, hex.s);

		hexNeighbours.forEach((nId) => {
			if (tfield.hexes[nId] != undefined) {
				if (coloredHexes.find((c) => c == nId) == undefined && addedNeighbours.find((c) => c.hexId == nId) == undefined) {
					addedNeighbours.push({ generateFrom: coloredBy, hexId: nId });
				}
			}
		});

		// Add self to the list of colored hexes

		coloredHexes.push(cur.hexId);
	}
}

function colorWith(hex, tileid, tileset) {
	let tile = tileset.find((tile) => tile.id == tileid);
	//console.log(tile);

	hex.bgColor = tile.bgColor;

	if (tile.symbol) {
		hex.symbol = { ...tile.symbol };
		hex.symbolId = tile.id;
	} else {
		hex.symbol = null;
		hex.symbolId = null;
	}
}


export { generateTerrain, collapseWaveGen }