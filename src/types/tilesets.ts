import { type Icon } from "./icon";
// Tiles get loaded by the loader. The symbol texture gets loaded under the id
export type Tile = {
	display: string;
	bgColor: number; // Some tiles don't really need a bg color, but, whatever
	id: string; // Local to the tileset
	symbol: TileSymbol | null; // TODO: make this Icon
	tileset_id: string;
	preview: string // Just the background
}

export type TileSymbol = {
	color: number;
	texWidth: number;
	texHeight: number;
	pHex: number;
	base64: string;
	preview: string;
	rotation?: number; // Added in format v3
}

export type Tileset = {
	name: string;
	id: string;
	author: string;
	version: number;
	collapsed: boolean; // This needs to go in a list of collapsed IDs in the save data somewhere, not in the tileset itself !
	tiles: Tile[];
	format_version: number; // Internal ID of tileset format. 
}

export const LATEST_TILESET_FORMAT_VERSION = 3
export const LATEST_DEFAULT_TILESET_VERSION = 8


