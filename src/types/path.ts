import type * as PIXI from 'pixi.js';

export type path_style = {
	color: number;
	width: number;
	cap: PIXI.LINE_CAP;
	join: PIXI.LINE_JOIN;
	dashed: boolean;
	dash_length: number;
	dash_gap: number
}

// The actual path object drawn on the screen
export type path_layer_path = {
	id: number;
	style: path_style,
	points: number[];
	hitboxes: PIXI.Rectangle[];
	dashes?: number[];
}


export type listed_path_style = {
	id: number;
	display: string;
	style: path_style;
}
