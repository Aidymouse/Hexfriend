import type { TextLayerText } from "../types";

import * as PIXI from 'pixi.js'


/* Checks if two text items match each other */
export const textsMatch = (text1: TextLayerText, text2: TextLayerText, includeId: boolean = true) => {
  for (const [text_key, text_val] of Object.entries(text1)) {
    if (text_key === 'id' && !includeId) { continue }

    if (text_key === 'style') {
      for (const [style_key, style_val] of Object.entries(text_val)) {
	if (style_val !== text2.style[style_key]) {
	  return false
	}
      }
      continue
    }

    if (text_val !== text2[text_key]) {
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
