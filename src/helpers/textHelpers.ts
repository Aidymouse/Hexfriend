import type { TextLayerText, TextStyle } from "../types";

import * as PIXI from 'pixi.js'


/* Checks if two text items match each other */
export const textsMatch = (text1: TextLayerText, text2: TextLayerText, includeId: boolean = true) => {
  for (const [text_key, text_val] of Object.entries(text1)) {
    if (text_key === 'id' && !includeId) { continue }

    if (text_key === 'style') {
      if (!textStylesMatch(text1.style, text2.style)) { return false }
      continue
    }

    if (text_val !== text2[text_key]) {
      return false
    }
  }

  return true

}

export const textStylesMatch = (style1: TextStyle, style2: TextStyle) => {
      for (const [style_key, style_val] of Object.entries(style1)) {
	if (style_val !== style2[style_key]) {
	  return false
	}
      }

      return true
}

export const getTextWidth = (text: TextLayerText): number => {
  let tm = PIXI.TextMetrics.measureText(text.text, new PIXI.TextStyle(text.style))
  return tm.width
}

export const getTextHeight = (text: TextLayerText): number => {
  let tm = PIXI.TextMetrics.measureText(text.text, new PIXI.TextStyle(text.style))
  return tm.height
}


export const getTextMetrics = (text: TextLayerText): PIXI.TextMetrics => {
  let tm = PIXI.TextMetrics.measureText(text.text, new PIXI.TextStyle(text.style))
  return tm
}

export const ALIGN_MAP = {
    left: { x: 0, y: 0 },
    center: { x: 0.5, y: 0 },
    right: { x: 1, y: 0 },
  }

export const getTextHoverBox = (text: TextLayerText): {width: number, height: number ,x: number, y: number, thickness: number} => {
  const tm = getTextMetrics(text)
  const tW = tm.width
  const tH = tm.height
  const thickness = Math.max(text.style.fontSize / 20, 2)

  return {
    x: text.x - tW * ALIGN_MAP[text.style.align].x - thickness,
    y: text.y - thickness,
    width: tW + thickness + thickness,
    height: tH + thickness + thickness,
    thickness,
  }
}

