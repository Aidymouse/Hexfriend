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
export interface HF_text {
	id: number;
	text: string;
	style: PIXI.Text['style'];
	x: number;
	y: number;
}

export interface listed_text_style {
	display: string;
	style: PIXI.Text['style'];
}