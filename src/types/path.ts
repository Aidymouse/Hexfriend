import type * as PIXI from 'pixi.js'

export interface path_style { color: number, width: number, cap?: PIXI.LINE_CAP, join?: PIXI.LINE_JOIN }

export interface path {
    id: number
    style: path_style
    points: number[]
}