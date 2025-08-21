import { coords_cubeToq, coords_cubeTor, coords_cubeToWorld, coords_qToCube, coords_rToCube, coords_worldToCube } from "../helpers/hexHelpers"
import type { IconLayerIcon } from "../types/icon"
import { HexOrientation, HexRaised } from "../types/terrain"

export type HexSizeParams = {
	width: number,
	height: number,
	gap: number
         orientation: HexOrientation
}

/** With old and new hex coords we find the position on the grid of new sized hexes that is equiv. to the position on the old grid */
export const find_new_pos_through_resize = (pos: {x: number, y: number}, old_hex_size: HexSizeParams, new_hex_size: HexSizeParams): {x: number, y: number} => {

    console.log(old_hex_size, new_hex_size)

      // Round pos to hexes' center X, Y
      let closestHexCubeCoords = coords_worldToCube(
        pos.x,
        pos.y,
        old_hex_size.orientation,
        old_hex_size.width,
        old_hex_size.height,
        old_hex_size.gap
      )
      let closestHexPos = coords_cubeToWorld(
        closestHexCubeCoords.q,
        closestHexCubeCoords.r,
        closestHexCubeCoords.s,
        old_hex_size.orientation,
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
        new_hex_size.orientation,
        new_hex_size.width,
        new_hex_size.height,
        new_hex_size.gap,
      )

      const new_x = closestHexPosNew.x - vector_from_hex_center.x * hex_horiz_scale
      const new_y = closestHexPosNew.y - vector_from_hex_center.y * hex_vert_scale

      return {x: new_x, y: new_y}
}

/** Square maps keep things in the same relative row/column position, so the logic for finding a new spot on orientation change is different. 
 * WARN: this goes really weird if you change orientation, change raised col/indented row, then change orientation again. If you keep doing it stuff moves to really weird places. 
 * TODO: Warrants further investigation one day
 * INFO: Orientation change on a flower map is handled by the above fn
 * */
export const find_new_pos_square_orientation_change = (pos: {x: number, y: number}, old_hex_size: HexSizeParams, new_hex_size: HexSizeParams, cur_raised: HexRaised ) => {
      let oldOrientation = old_hex_size.orientation

      // Find the center coordinates of the hex the icon wants to stay in
      let oldClosestHexCubeCoords = coords_worldToCube(
        pos.x,
        pos.y,
        oldOrientation,
        old_hex_size.width,
        old_hex_size.height,
        old_hex_size.gap,
      )
      let oldClosestHexPos = coords_cubeToWorld(
        oldClosestHexCubeCoords.q,
        oldClosestHexCubeCoords.r,
        oldClosestHexCubeCoords.s,
        oldOrientation,
        old_hex_size.width,
        old_hex_size.height,
        old_hex_size.gap,
      )

      let distanceFromHexLeft = old_hex_size.width / 2 + pos.x - oldClosestHexPos.x
      let distanceFromHexTop = old_hex_size.height / 2 + pos.y - oldClosestHexPos.y

      // How far left and down were we in the old hex?
      let proportionalHorizontalDistance = distanceFromHexLeft / old_hex_size.width
      let proportionalVerticalDistance = distanceFromHexTop / old_hex_size.height

      // Find the row / col of the old hex
      let conservedClosestHexRowCol =
        oldOrientation == 'flatTop'
          ? coords_cubeToq(
              cur_raised,
              oldClosestHexCubeCoords.q,
              oldClosestHexCubeCoords.r,
              oldClosestHexCubeCoords.s,
            )
          : coords_cubeTor(
              cur_raised,
              oldClosestHexCubeCoords.q,
              oldClosestHexCubeCoords.r,
              oldClosestHexCubeCoords.s,
            )

      // Find the hex position of the hex at the same row/col, but opposite orientation
      let newHexCubeCoords = new_hex_size.orientation === HexOrientation.FLATTOP 
          ? coords_qToCube(cur_raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row)
          : coords_rToCube(cur_raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row)

      // Find X and Y world position of new hex
      let newHexPos = coords_cubeToWorld(
        newHexCubeCoords.q,
        newHexCubeCoords.r,
        newHexCubeCoords.s,
        new_hex_size.orientation,
        new_hex_size.width,
        new_hex_size.height,
        new_hex_size.gap,
      )

      // Adjust icon position to be the same amount left and down proportional to hex width and height as it was before the transformation
  const new_pos = {
      x: newHexPos.x - new_hex_size.width / 2 + new_hex_size.width * proportionalHorizontalDistance,
       y: newHexPos.y - new_hex_size.height / 2 + new_hex_size.height * proportionalVerticalDistance
  }

  return new_pos
}


/** These are never used - I like the idea though. */
  // export function retainIconPositionOnOrientationChange(newOrientation: HexOrientation) {
  //   switch ($tfield.mapShape) {
  //     case map_shape.SQUARE:
  //       square_retainIconPositionOnOrientationChange(newOrientation)
  //       break
  //
  //     case map_shape.FLOWER:
  //       flower_retainIconPositionOnOrientationChange(newOrientation)
  //       break
  //   }
  // }
  //
  // function square_retainIconPositionOnOrientationChange(newOrientation: HexOrientation) {
  //   // Only really works on square maps afaik
  //   // Because it relies on row/col coords
  //
  //   icons.forEach((icon: IconLayerIcon) => {
  //     let oldOrientation: HexOrientation =
  //       newOrientation === HexOrientation.FLATTOP ? HexOrientation.POINTYTOP : HexOrientation.FLATTOP
  //
  //     // Find the center coordinates of the hex the icon wants to stay in
  //     let oldClosestHexCubeCoords = coords_worldToCube(
  //       icon.x,
  //       icon.y,
  //       oldOrientation,
  //       oldHexWidth,
  //       oldHexHeight,
  //       $tfield.grid.gap,
  //     )
  //     let oldClosestHexPos = coords_cubeToWorld(
  //       oldClosestHexCubeCoords.q,
  //       oldClosestHexCubeCoords.r,
  //       oldClosestHexCubeCoords.s,
  //       oldOrientation,
  //       oldHexWidth,
  //       oldHexHeight,
  //       $tfield.grid.gap,
  //     )
  //
  //     let distanceFromHexLeft = oldHexWidth / 2 + icon.x - oldClosestHexPos.x
  //     let distanceFromHexTop = oldHexHeight / 2 + icon.y - oldClosestHexPos.y
  //
  //     // How far left and down were we in the old hex?
  //     let proportionalHorizontalDistance = distanceFromHexLeft / oldHexWidth
  //     let proportionalVerticalDistance = distanceFromHexTop / oldHexHeight
  //
  //     // Find the row / col of the old hex
  //     let conservedClosestHexRowCol =
  //       oldOrientation == 'flatTop'
  //         ? coords_cubeToq(
  //             $tfield.raised,
  //             oldClosestHexCubeCoords.q,
  //             oldClosestHexCubeCoords.r,
  //             oldClosestHexCubeCoords.s,
  //           )
  //         : coords_cubeTor(
  //             $tfield.raised,
  //             oldClosestHexCubeCoords.q,
  //             oldClosestHexCubeCoords.r,
  //             oldClosestHexCubeCoords.s,
  //           )
  //
  //     // Find the hex position of the hex at the same row/col, but opposite orientation
  //     let newHexCubeCoords =
  //       $tfield.orientation == 'flatTop'
  //         ? coords_qToCube($tfield.raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row)
  //         : coords_rToCube($tfield.raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row)
  //
  //     // Find X and Y world position of new hex
  //     let newHexPos = coords_cubeToWorld(
  //       newHexCubeCoords.q,
  //       newHexCubeCoords.r,
  //       newHexCubeCoords.s,
  //       $tfield.orientation,
  //       $tfield.hexWidth,
  //       $tfield.hexHeight,
  //       $tfield.grid.gap,
  //     )
  //
  //     // Adjust icon position to be the same amount left and down proportional to hex width and height as it was before the transformation
  //     icon.x = newHexPos.x - $tfield.hexWidth / 2 + $tfield.hexWidth * proportionalHorizontalDistance
  //     icon.y = newHexPos.y - $tfield.hexHeight / 2 + $tfield.hexHeight * proportionalVerticalDistance
  //   })
  //
  //   icons = icons
  //
  //   oldHexWidth = $tfield.hexWidth
  //   oldHexHeight = $tfield.hexHeight
  // }
  //
  // function flower_retainIconPositionOnOrientationChange(newOrientation: HexOrientation) {
  //   // Find the current
  // }
