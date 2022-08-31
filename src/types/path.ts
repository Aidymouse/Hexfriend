import type * as PIXI from 'pixi.js';

export interface path_layer_path {
	id: number;
	style: PIXI.LineStyle;
	points: number[];
	hitboxes: PIXI.Rectangle[];
}

export interface listed_path_style {
	id: number;
	display: string;
	style: PIXI.LineStyle;
}
