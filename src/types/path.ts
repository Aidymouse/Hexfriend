import type * as PIXI from 'pixi.js'

export type PathStyle = {
  color: number
  width: number
  cap: PIXI.LINE_CAP
  join: PIXI.LINE_JOIN
  dashed: boolean
  dash_length: number
  dash_gap: number

  filled: boolean
  fill_color: PIXI.FillStyle['color']
  fill_opacity: PIXI.FillStyle['alpha']
}

// The actual path object drawn on the screen
export type PathLayerPath = {
  id: number
  style: PathStyle
  points: number[]
  hitboxes: PIXI.Rectangle[]
  dashes?: number[]
}

export type ListedPathStyle = {
  id: number
  display: string
  style: PathStyle
}
