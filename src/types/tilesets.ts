

// Tiles get loaded by the loader. The symbol texture gets loaded under the id
interface Tile {
    display: string
    bgColor: number
    id: string // ID doubles up as symbol id, but only us it as such if there is a symbol!
    symbol: TileSymbol | null
}

interface TileSymbol {
    texId: string,
    color: number,
    texWidth: number,
    texHeight: number,
    pHex: number,
    base64: string,
}

export type { Tile, TileSymbol }