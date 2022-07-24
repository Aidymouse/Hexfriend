// Tiles get loaded by the loader. The symbol texture gets loaded under the id
interface Tile {
	display: string;
	bgColor: number;
	id: string; // ID doubles up as symbol id, but only us it as such if there is a symbol!
	symbol: TileSymbol | null;
}

interface TileSymbol {
	texId: string;
	color: number;
	texWidth: number;
	texHeight: number;
	pHex: number;
	base64: string;
}

type tileset_name = string
type tile_id = `${tileset_name}_${string}`

interface Tileset {
	name: tileset_name;
	id: tile_id;
	author: string;
	version: number;
	tiles: Tile[];
}



export type { Tile, TileSymbol, Tileset };
