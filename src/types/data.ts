import type * as PIXI from 'pixi.js'

export interface icon_data {
    color: number,
    texId?: string,
    pHex: number,
    snapToHex: boolean
}

export interface coordinates_data {
    shown: boolean,
    style: PIXI.Text["style"],
    system: "evenq" | "cubeId",
    seperator: string
}