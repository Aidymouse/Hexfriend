import { coords_cubeToWorld, coords_worldToCube } from "../helpers/hexHelpers"
import type { IconLayerIcon } from "../types/icon"
import type { HexOrientation } from "../types/terrain"

export type HexSizeParams = {
	width: number,
	height: number,
	gap: number
}

/** With old and new hex coords we find the position on the grid of new sized hexes that is equiv. to the position on the old grid */
export const find_new_pos_through_resize = (pos: {x: number, y: number}, old_hex_size: HexSizeParams, new_hex_size: HexSizeParams, orientation: HexOrientation): {x: number, y: number} => {
    // Find proprtional horizontal and vertical distance from center of nearest hex, and retain the position with the new width and height
      let closestHexCubeCoords = coords_worldToCube(
        pos.x,
        pos.y,
        orientation,
        old_hex_size.width,
        old_hex_size.height,
        old_hex_size.gap
      )
      let closestHexPos = coords_cubeToWorld(
        closestHexCubeCoords.q,
        closestHexCubeCoords.r,
        closestHexCubeCoords.s,
        orientation,
        old_hex_size.width,
        old_hex_size.height,
        old_hex_size.gap,
      )

      let vector_from_hex_center = {
        x: closestHexPos.x - pos.x,
        y: closestHexPos.y - pos.y,
      }

      let hex_horiz_scale = new_hex_size.width / old_hex_size.width
      let hex_vert_scale = new_hex_size.height / old_hex_size.height

      let closestHexPosNew = coords_cubeToWorld(
        closestHexCubeCoords.q,
        closestHexCubeCoords.r,
        closestHexCubeCoords.s,
        orientation,
        new_hex_size.width,
        new_hex_size.height,
        new_hex_size.gap,
      )

      const new_x = closestHexPosNew.x - vector_from_hex_center.x * hex_horiz_scale
      const new_y = closestHexPosNew.y - vector_from_hex_center.y * hex_vert_scale

      return {x: new_x, y: new_y}
}


  export function retainIconPositionOnOrientationChange(newOrientation: HexOrientation) {
    switch ($tfield.mapShape) {
      case map_shape.SQUARE:
        square_retainIconPositionOnOrientationChange(newOrientation)
        break

      case map_shape.FLOWER:
        flower_retainIconPositionOnOrientationChange(newOrientation)
        break
    }
  }

  function square_retainIconPositionOnOrientationChange(newOrientation: HexOrientation) {
    // Only really works on square maps afaik
    // Because it relies on row/col coords

    icons.forEach((icon: IconLayerIcon) => {
      let oldOrientation: HexOrientation =
        newOrientation === HexOrientation.FLATTOP ? HexOrientation.POINTYTOP : HexOrientation.FLATTOP

      // Find the center coordinates of the hex the icon wants to stay in
      let oldClosestHexCubeCoords = coords_worldToCube(
        icon.x,
        icon.y,
        oldOrientation,
        oldHexWidth,
        oldHexHeight,
        $tfield.grid.gap,
      )
      let oldClosestHexPos = coords_cubeToWorld(
        oldClosestHexCubeCoords.q,
        oldClosestHexCubeCoords.r,
        oldClosestHexCubeCoords.s,
        oldOrientation,
        oldHexWidth,
        oldHexHeight,
        $tfield.grid.gap,
      )

      let distanceFromHexLeft = oldHexWidth / 2 + icon.x - oldClosestHexPos.x
      let distanceFromHexTop = oldHexHeight / 2 + icon.y - oldClosestHexPos.y

      // How far left and down were we in the old hex?
      let proportionalHorizontalDistance = distanceFromHexLeft / oldHexWidth
      let proportionalVerticalDistance = distanceFromHexTop / oldHexHeight

      // Find the row / col of the old hex
      let conservedClosestHexRowCol =
        oldOrientation == 'flatTop'
          ? coords_cubeToq(
              $tfield.raised,
              oldClosestHexCubeCoords.q,
              oldClosestHexCubeCoords.r,
              oldClosestHexCubeCoords.s,
            )
          : coords_cubeTor(
              $tfield.raised,
              oldClosestHexCubeCoords.q,
              oldClosestHexCubeCoords.r,
              oldClosestHexCubeCoords.s,
            )

      // Find the hex position of the hex at the same row/col, but opposite orientation
      let newHexCubeCoords =
        $tfield.orientation == 'flatTop'
          ? coords_qToCube($tfield.raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row)
          : coords_rToCube($tfield.raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row)

      // Find X and Y world position of new hex
      let newHexPos = coords_cubeToWorld(
        newHexCubeCoords.q,
        newHexCubeCoords.r,
        newHexCubeCoords.s,
        $tfield.orientation,
        $tfield.hexWidth,
        $tfield.hexHeight,
        $tfield.grid.gap,
      )

      // Adjust icon position to be the same amount left and down proportional to hex width and height as it was before the transformation
      icon.x = newHexPos.x - $tfield.hexWidth / 2 + $tfield.hexWidth * proportionalHorizontalDistance
      icon.y = newHexPos.y - $tfield.hexHeight / 2 + $tfield.hexHeight * proportionalVerticalDistance
    })

    icons = icons

    oldHexWidth = $tfield.hexWidth
    oldHexHeight = $tfield.hexHeight
  }

  function flower_retainIconPositionOnOrientationChange(newOrientation: HexOrientation) {
    // Find the current
  }
