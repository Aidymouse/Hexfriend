import type { hex_orientation } from "./terrain";

export enum coord_system {
	CUBE,
	ROWCOL,
	AXIAL,
	LETTERNUMBER
}

export interface cube_coords {
	q: number;
	r: number;
	s: number;
}

export interface hex_world_attributes {
	orientation: hex_orientation;
	hex_width: number;
	hex_height: number;
	grid_gap: number;
}