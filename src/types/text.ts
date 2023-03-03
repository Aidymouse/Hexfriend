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

/* HF stands for Hexfriend */
export interface text_layer_text {
	id: number;
	text: string;
	style: PIXI.Text['style'];
	alpha: number;
	x: number;
	y: number;
	rotation: number;
}

export interface listed_text_style {
	display: string;
	alpha: number;
	style: PIXI.Text['style'];
	id: number;
}
