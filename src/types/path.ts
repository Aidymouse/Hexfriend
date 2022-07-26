import type * as PIXI from 'pixi.js';

export interface path {
	id: number;
	style: PIXI.LineStyle;
	points: number[];
}

export interface listed_path_style {
	display: string;
	style: PIXI.LineStyle;
}
