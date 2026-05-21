import { map_shape, type CoordinateOffsets, type HexGridParams, type HexId, type TerrainField } from "../types"
import { breakDownHexID, coords_cubeToq, coords_cubeTor, getHexGridParams } from "./hexHelpers"

/* Turns a number into an alphabetical representation e.g. 5 = E, 27 = AA */
  export const numToAlphabet = (num: number) => {
    let n = num
    let col_name = ''
    let alphabet = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ]

    while (n > 0) {
      let mod = (n - 1) % 26
      col_name = alphabet[mod] + col_name
      n = Math.round((n - mod) / 26)
      //console.log(n)
    }

    return col_name
  }

export type HexCoordParams = HexGridParams & { mapShape: map_shape, hexesOut: number }

export const getHexCoordParams = (terrainField: TerrainField): HexCoordParams => {
  let params: HexCoordParams = {
    ...getHexGridParams(terrainField),
    mapShape: terrainField.mapShape,
    hexesOut: terrainField.hexesOut
  }
  return params
}

export type GenCoordFn = (hexId: HexId, seperator: string, offsets: CoordinateOffsets, hexGridInfo: HexCoordParams) => { parts: number[], text: string }

export const genCoord_cube: GenCoordFn = (hexId: HexId, seperator: string, offsets: CoordinateOffsets) => {
        let idParts = breakDownHexID(hexId)
        let parts = [
          idParts.q + offsets.cube.q,
          idParts.r + offsets.cube.r,
          idParts.s + offsets.cube.s,
        ]

        return {
          parts: [idParts.q, idParts.r, idParts.s],
          text: `${parts[0]}${seperator}${parts[1]}${seperator}${parts[2]}`,
        }
}

export const genCoord_rowCol: GenCoordFn = (hexId: HexId, seperator: string, offsets: CoordinateOffsets, hexGridInfo: HexCoordParams) => {
        let cube = breakDownHexID(hexId)
        let idParts =
          hexGridInfo.orientation == 'flatTop'
            ? coords_cubeToq(hexGridInfo.raised, cube.q, cube.r, cube.s)
            : coords_cubeTor(hexGridInfo.raised, cube.q, cube.r, cube.s)

        let parts = [
          idParts.col + offsets.row_col.row,
          idParts.row + offsets.row_col.col,
        ]

        return {
          parts: [idParts.col, idParts.row],
          text: `${parts[0] < 10 && parts[0] >= 0 ? 0 : ''}${parts[0]}${seperator}${parts[1] < 10 && parts[1] >= 0 ? 0 : ''}${parts[1]}`,
        }
}

export const genCoord_axial: GenCoordFn = (hexId: HexId, seperator: string, offsets: CoordinateOffsets, hexGridInfo: HexCoordParams) => {
        let cube = breakDownHexID(hexId)

        let parts = [
           cube.q + offsets.cube.q,
           cube.r + offsets.cube.r
        ]

        return {
          parts: [cube.q, cube.r],
          text: `${parts[0]}${seperator}${parts[1]}`,
        }
}

export const genCoord_letterNumber: GenCoordFn = (hexId: HexId, seperator: string, offsets: CoordinateOffsets, hexGridInfo: HexCoordParams) => {
        let row_offset = 0
        let col_offset = 0

        if (hexGridInfo.mapShape == map_shape.FLOWER) {
          row_offset = hexGridInfo.hexesOut
          col_offset = hexGridInfo.hexesOut
        }

        let cube = breakDownHexID(hexId)

        let idParts =
          hexGridInfo.orientation == 'flatTop'
            ? coords_cubeToq(hexGridInfo.raised, cube.q, cube.r, cube.s)
            : coords_cubeTor(hexGridInfo.raised, cube.q, cube.r, cube.s)

        // Convert column to letter
        let parts = [
          numToAlphabet(idParts.col + col_offset + 1 + Math.max(offsets.row_col.row, 0)),
          idParts.row + row_offset + 1 + offsets.row_col.col,
        ]

        return {
          parts: parts,
          text: `${parts[0]}${seperator}${parts[1]}`,
        }
}
