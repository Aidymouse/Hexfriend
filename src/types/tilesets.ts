import { type Icon } from "./icon";
import type { HexOrientation } from "./terrain";
// Tiles get loaded by the loader. The symbol texture gets loaded under the id

export type Tile = {
	display: string;
	// Some tiles won't *really* need a bg color, if they're all icon cos they're images, but, whatever
	bgColor: number; 
	// Local to the tileset
	id: string; 
	// Picture to draw on the hex. This also implicitly sets the tile type as dynamic or bydimension
	symbol: Icon | null; 
	// Used to identify which tile to select when the tile is clicked on
	tileset_id: string; 
	// Previews for the tile panel
	preview_flatTop: string; 
	preview_pointyTop: string; 
}

// export type TileSymbol = {
// 	color: number;
// 	texWidth: number;
// 	texHeight: number;
// 	pHex: number;
// 	base64: string;
// 	preview: string;
// 	rotation?: number; // Added in format v3
// }

// enum TilesetType {
//   dynamic="dynamic",
//   images="images",
// }

export type Tileset = {
	name: string;
	id: string;
	author: string;
	version: number;
	collapsed: boolean; // This needs to go in a list of collapsed IDs in the save data somewhere, not in the tileset itself !
	tiles: Tile[];
	format_version: number; // Internal ID of tileset format. 
	supported_orientations: HexOrientation.FLATTOP | HexOrientation.POINTYTOP | 'both'
	//tileset_type: TilesetType
}

export const LATEST_TILESET_FORMAT_VERSION = 4
export const LATEST_DEFAULT_TILESET_VERSION = 8


