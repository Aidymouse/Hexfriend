// Tiles get loaded by the loader. The symbol texture gets loaded under the id
interface Tile {
	display: string;
	bgColor: number;
	id: string; // Local to the tileset
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
	rotation?: number; // Added in format v3
}

interface Tileset {
	name: string;
	id: string;
	author: string;
	version: number;
	collapsed: boolean; // This needs to go in a list of collapsed IDs in the save data somewhere, not in the tileset itself !
	tiles: Tile[];
	format_version: number; // Internal ID of tileset format. 
}

export const LATESTDEFAULTTILESETVERSION = 8

export const LATESTTILESETFORMATVERSION = 3

export type { Tile, TileSymbol, Tileset };
