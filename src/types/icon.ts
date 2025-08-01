import type { ScaleMode } from "../helpers/imageSizing";

export type Icon = {
    display: string;
    id: string; // Within iconset id
    texId: string; // Id of loaded texture
    color: number;
    //pHex: number; 
    base64: string;
    preview: string; // Preview is set to nothing on the icon layer itself
    texWidth: number;
    texHeight: number;
    rotation: number;
    scaleMode: ScaleMode // Needed?
} & ({
    scaleMode: ScaleMode.RELATIVE,
    pHex: number // percent of total hex taken up, where 1 = 100% of hexes shortest dimension
} | {
    scaleMode: ScaleMode.BYDIMENSION,
    pWidth: number,
    pHeight: number

})


/* SAVE DATA */
export type IconLayerIcon = Icon & {
  onLayerId: number,
  x: number,
  y: number
  scale: {x: number, y: number}
}

export type Iconset = {
	name: string;
	id: string;
	author: string;
	version: number;
	collapsed: boolean;
	icons: Icon[];
}

/* Used during program and also saved in list to keep track of icons */
// export interface IconLayerIcon {
// 	x: number;
// 	y: number;
// 	color: number;
// 	scale: number;
// 	pHex: number;
// 	id: number;
// 	texId: string;
// 	rotation: number;
// }
