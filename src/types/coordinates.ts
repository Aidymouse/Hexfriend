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
