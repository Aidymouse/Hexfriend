import type { HexOrientation } from "./terrain";
import * as PIXI from 'pixi.js'

export enum coord_system {
	CUBE,
	ROWCOL,
	AXIAL,
	LETTERNUMBER
}

export type cube_coords = {
	q: number;
	r: number;
	s: number;
}

export type CoordText = {
	/* The pixi text object displayed on the screen */
	pixiText: PIXI.Text
	/* The individual parts of the coordinate that are assembled into text */
	parts: number[]
}
