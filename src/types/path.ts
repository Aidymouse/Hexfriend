import type * as PIXI from 'pixi.js';

export interface path_layer_path {
	id: number;
	style: path_style;
	points: number[];
	hitboxes: PIXI.Rectangle[];
	dashes?: number[];
}

export interface path_style {
	color: number;
	width: number;
	cap: PIXI.LINE_CAP;
	join: PIXI.LINE_JOIN;
	dashed: boolean;
	dash_length: number;
	dash_gap: number
}

export interface listed_path_style {
	id: number;
	display: string;
	style: PIXI.LineStyle;
}
