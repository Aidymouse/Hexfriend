import type * as PIXI from 'pixi.js'

export interface path {
    id: number
    style: { color: number, width: number, cap?: PIXI.LINE_CAP, join?: PIXI.LINE_JOIN }
    points: number[]
}