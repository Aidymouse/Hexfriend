/*
export interface text_style {
	fontFamily: string;
	fill: string;
	fontSize: number;
	miterLimit?: number;
	strokeThickness?: number;
	stroke?: string;
	align?: string;
	fontStyle: string;
	fontWeight: 'normal' | 'bold' | number;
}
*/

import type * as PIXI from 'pixi.js'

export interface text_layer_text {
	id: number;
	text: string;
	style: PIXI.Text['style'];
	x: number;
	y: number;
}

export interface listed_text_style {
	display: string;
	style: PIXI.Text['style'];
	id: number;
}
