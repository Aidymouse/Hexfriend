import { type ITextStyle } from 'pixi.js'
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
export type TextStyle = Pick<
  ITextStyle,
  'fontFamily' /*| 'fill' | 'fontSize'*/ | 'strokeThickness' /*| 'stroke'*/ | 'align' | 'fontStyle' | 'fontWeight'
> & { 
  // Overrides from text style, for type reasons
  fontSize: number 
  fill: number
  stroke: number

  alpha: number 
}

/* The text object that sits on the text layer */
export type TextLayerText = {
  id: number
  text: string
  style: TextStyle
  x: number
  y: number
  rotation: number
}

export type ListedTextStyle = {
  display: string
  style: TextStyle
  id: number
}
