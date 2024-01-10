import type { TerrainHex } from '../types/terrain';
import type { hex_id } from '../types/toolData';
import type { cube_coords } from '../types/coordinates';
import { hex_orientation } from '../types/terrain';

const hexDirVectors: cube_coords[] = [
	{ q: 1, r: 0, s: -1 },
	{ q: 1, r: -1, s: 0 },
	{ q: 0, r: -1, s: 1 },
	{ q: -1, r: 0, s: 1 },
	{ q: -1, r: 1, s: 0 },
	{ q: 0, r: 1, s: -1 },
];

export function getHexPath(
	width: number,
	height: number,
	orientation: hex_orientation = hex_orientation.FLATTOP,
	centerX: number = 0,
	centerY: number = 0,
	gap: number = 0,
): number[] {
	width += gap;
	height += gap;
	if (orientation == 'pointyTop') {
		return [
			centerX,
			centerY - height / 2,
			centerX + width / 2,
			centerY - height * 0.25,
			centerX + width / 2,
			centerY + height * 0.25,
			centerX,
			centerY + height / 2,
			centerX - width / 2,
			centerY + height * 0.25,
			centerX - width / 2,
			centerY - height * 0.25,
		];
	} else {
		return [
			centerX - width * 0.25,
			centerY - height / 2,
			centerX + width * 0.25,
			centerY - height / 2,
			centerX + width / 2,
			centerY,
			centerX + width * 0.25,
			centerY + height / 2,
			centerX - width * 0.25,
			centerY + height / 2,
			centerX - width / 2,
			centerY,
		];
	}
}

export function get_width_height_from_radius(radius: number, orientation: hex_orientation) {
	if (orientation == hex_orientation.POINTYTOP) {
		return { width: Math.cos(Math.PI / 6) * radius * 2, height: radius * 2 }
	} else {
		return { width:  radius * 2, height: radius / Math.tan(Math.PI / 6) }
	}
}

export function get_radius_from_width_height(width: number, height: number, orientation: hex_orientation) {
	if (orientation == hex_orientation.POINTYTOP) {
		return ((width * Math.cos(Math.PI / 6) / 2) + (height / 2)) / 2
	} else {
		return ((width / 2) + (height * Math.tan(Math.PI / 6))) / 2
	}
}

export function getHexPathRadius(radius: number, orientation: hex_orientation = hex_orientation.FLATTOP, centerX: number = 0, centerY: number = 0): number[] {
	let w: number, h: number;
	if (orientation == hex_orientation.POINTYTOP) {
		h = radius * 2;
		w = Math.cos(Math.PI / 6) * radius * 2;
	} else {
		w = radius * 2;
		h = radius / Math.tan(Math.PI / 6);
	}
	return getHexPath(w, h, orientation, centerX, centerY);
}

export function id_to_coords(hex_id: hex_id): cube_coords {
	let id_parts = hex_id.split(":")
	return {q: +id_parts[0], r: +id_parts[1], s: +id_parts[2]}
}

export function genHexId(q: number, r: number, s: number): hex_id {
	return `${q}:${r}:${s}`;
}

export function genHexId_coordsObj(coords: cube_coords): hex_id {
	let q = coords.q;
	let r = coords.r;
	let s = coords.s;
	return `${q}:${r}:${s}`;
}

export function genHexId_tfieldHex(hex: TerrainHex) {

	return genHexId(hex.q, hex.r, hex.s)

}

export function genCoordsObj(hexId: hex_id): cube_coords {
	let idParts = hexId.split(':');

	return {
		q: parseInt(idParts[0]),
		r: parseInt(idParts[1]),
		s: parseInt(idParts[2]),
	};
}

/* NEIGHBOURS */
export function getRing(centerId: hex_id, radius: number): hex_id[] {
	if (radius == 0) {
		return [centerId]
	}

	let firstHexCoords = cube_add(genCoordsObj(centerId), cube_scale(hexDirVectors[4], radius));

	let curHexCoords = firstHexCoords;

	let ringHexIds = [];

	for (let i = 0; i < 6; i++) {
		let currentHexDir = hexDirVectors[i];
		for (let j = 0; j < radius; j++) {
			ringHexIds.push(genHexId_coordsObj(curHexCoords));
			curHexCoords = cube_add(curHexCoords, currentHexDir);
		}
	}

	return ringHexIds;
}

function cube_scale(coords: cube_coords, scale: number): cube_coords {
	return { q: coords.q * scale, r: coords.r * scale, s: coords.s * scale };
}

function cube_add(c1: cube_coords, c2: cube_coords): cube_coords {
	return { q: c1.q + c2.q, r: c1.r + c2.r, s: c1.s + c2.s };
}

export function getNeighbours(q: number, r: number, s: number): hex_id[] {
	return [
		genHexId(q + 1, r, s - 1),
		genHexId(q + 1, r - 1, s),
		genHexId(q, r - 1, s + 1),
		genHexId(q - 1, r, s + 1),
		genHexId(q - 1, r + 1, s),
		genHexId(q, r + 1, s - 1),
	];
}

/* COORDS */
function AxialToCube(q: number, r: number): cube_coords {
	return { q: q, r: r, s: -q - r };
}

export function cube_round(frac: cube_coords): cube_coords {
	let q = Math.round(frac.q);
	let r = Math.round(frac.r);
	let s = Math.round(frac.s);

	let q_diff = Math.abs(q - frac.q);
	let r_diff = Math.abs(r - frac.r);
	let s_diff = Math.abs(s - frac.s);

	if (q_diff > r_diff && q_diff > s_diff) {
		q = -r - s;
	} else if (r_diff > s_diff) {
		r = -q - s;
	} else {
		s = -q - r;
	}

	return { q: q, r: r, s: s };
}

export function coords_worldToCube(worldX: number, worldY: number, hex_orientation: hex_orientation, hexWidth: number, hexHeight: number, gridGap: number): cube_coords {
	hexWidth += gridGap;
	hexHeight += gridGap;
	if (hex_orientation == 'flatTop') {
		// This is the inversion of the axialToWorld
		// Of course, substituting -q-r in as S

		let q = worldX / (hexWidth * 0.75);
		let r = ((2 * worldY) / hexHeight - q) / 2;

		let roundedCoords = cube_round(AxialToCube(q, r));

		return roundedCoords;
	} else if (hex_orientation == 'pointyTop') {
		let r = worldY / (hexHeight * 0.75);
		let q = ((2 * worldX) / hexWidth - r) / 2;

		let roundedCoords = cube_round(AxialToCube(q, r));

		return roundedCoords;
	}
}

export function coords_cubeToWorld(
	q: number,
	r: number,
	s: number,
	hex_orientation: hex_orientation,
	hexWidth: number,
	hexHeight: number,
	gridGap: number = 0
): { x: number; y: number } {
	hexWidth += gridGap;
	hexHeight += gridGap;
	if (hex_orientation == 'flatTop') {
		let hx = q * hexWidth * 0.75;
		let hy = (r * hexHeight) / 2 - (s * hexHeight) / 2;

		return {
			x: hx,
			y: hy,
		};
	} else if (hex_orientation == 'pointyTop') {
		let hx = (q * hexWidth) / 2 - (s * hexWidth) / 2;
		let hy = r * hexHeight * 0.75;

		return {
			x: hx,
			y: hy,
		};
	}
}

// EVEN Q = second column has raised tile - the DEFAULT for new maps
// ODD Q = first column has raised tile
function coords_cubeToEvenq(q: number, r: number, s) {
	let col = q;
	let row = r + (q + (q & 1)) / 2;
	return { col: col, row: row };
}

function coords_cubeToOddq(q: number, r: number, s) {
	let col = q;
	let row = r + (q - (q & 1)) / 2;
	return { col: col, row: row };
}

export function coords_cubeToq(raisedColumn: 'odd' | 'even', q: number, r: number, s: number) {
	if (raisedColumn == 'even') return coords_cubeToEvenq(q, r, s);
	return coords_cubeToOddq(q, r, s);
}

function coords_evenqToCube(col: number, row: number) {
	let q = col;
	let r = row - (col + (col & 1)) / 2;
	return { q: q, r: r, s: -q - r };
}

function coords_oddqToCube(col: number, row: number) {
	let q = col;
	let r = row - (col - (col & 1)) / 2;
	return { q: q, r: r, s: -q - r };
}

export function coords_qToCube(oddOrEven: 'odd' | 'even', col: number, row: number) {
	if (oddOrEven == 'even') return coords_evenqToCube(col, row);
	return coords_oddqToCube(col, row);
}

// EVEN R = first row is indented
// ODD R = second row is indented
function coords_cubeToEvenr(q, r, s) {
	let col = q + (r + (r & 1)) / 2;
	let row = r;
	return { col: col, row: row };
}

function coords_cubeToOddr(q, r, s) {
	let col = q + (r - (r & 1)) / 2;
	let row = r;
	return { col: col, row: row };
}

export function coords_cubeTor(indentedRow: 'odd' | 'even', q, r, s) {
	if (indentedRow == 'even') return coords_cubeToEvenr(q, r, s);
	return coords_cubeToOddr(q, r, s);
}

function coords_evenrToCube(col, row) {
	var q = col - (row + (row & 1)) / 2;
	var r = row;
	return { q: q, r: r, s: -q - r };
}

function coords_oddrToCube(col, row) {
	var q = col - (row - (row & 1)) / 2;
	var r = row;
	return { q: q, r: r, s: -q - r };
}

export function coords_rToCube(indentedRow: 'odd' | 'even', col, row) {
	if (indentedRow == 'even') return coords_evenrToCube(col, row);
	return coords_oddrToCube(col, row);
}

// ODD R = second row is indented
