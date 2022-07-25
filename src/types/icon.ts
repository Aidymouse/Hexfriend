export interface Icon {
	display: string;
	texId: string;
	id: string;
	color: number;
	pHex: number; // percent of total hex taken up, where 1 = 100% of hexes shortest dimension
	base64: string;
	preview: string;
	texWidth: number;
	texHeight: number;
}

export interface Iconset {
	name: string;
	id: string;
	author: string;
	version: number;
	icons: Icon[];
}

export interface IconLayerIcon {
	x: number,
	y: number,
	color: number,
	scale: number,
	id: number,
	texId: string
}