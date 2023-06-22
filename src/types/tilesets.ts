// Tiles get loaded by the loader. The symbol texture gets loaded under the id
interface Tile {
	display: string;
	bgColor: number;
	id: string; // This is the stringified version of a JSON object containing the tiles ID and tileset id
	symbol: TileSymbol | null;
	tileset_id: string;
	preview: string // Just the background
}

interface TileSymbol {
	color: number;
	texWidth: number;
	texHeight: number;
	pHex: number;
	base64: string;
	preview: string;
}

interface Tileset {
	name: string;
	id: string;
	author: string;
	version: number;
	collapsed: boolean; // This needs to go in a list of collapsed IDs in the save data somewhere, not in the tileset itself !
	tiles: Tile[];
}

export const LATESTDEFAULTTILESETVERSION = 5

export type { Tile, TileSymbol, Tileset };
