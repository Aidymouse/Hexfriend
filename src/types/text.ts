import { type ITextStyle } from "pixi.js";
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

/** Same as pixi text style but only has the stuff I let you actually control */
export type text_style = Pick<ITextStyle, 'fontFamily' | 'fill' | 'fontSize' | 'strokeThickness' | 'stroke' | 'align' | 'fontStyle' | 'fontWeight'>

/* The text object that sits on the text layer */
export type text_layer_text = {
	id: number;
	text: string;
	style: text_style;
	alpha: number;
	x: number;
	y: number;
	rotation: number;
}

export type listed_text_style = {
	display: string;
	alpha: number;
	style: text_style;
	id: number;
}
