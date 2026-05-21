import type { HexSizeParams } from '../lib/map_resize'
import { HexRaised, type HexGridParams } from '../types'

export type SquareDimensionShiftResults = {
  // When we add to the left, we actually add to the right and move to maintain the illusion. Applies to all icons, paths, texts, and the overlay
  x_shift: number
  y_shift: number
  new_raised: HexRaised
  // Transform distance the camera actually moved
  // cam_x_shift: number
  // cam_y_shift: number
}

/* returns an X and Y shift that can be added to pan's offset X and Y to create the illusion that the map is not moving */
export const getShiftForSquareReduction = (
  direction: 'left' | 'top' | 'right' | 'bottom',
  amount: number,
  hexInfo: HexGridParams,
) => {

  let shift = getShiftForSquareExpansion(direction, amount, hexInfo)
  if (direction === 'left') {
    shift.x_shift = -shift.x_shift
  } else if (direction === 'top') {
    shift.y_shift = -shift.y_shift
  }
  return shift
}

export const getShiftForSquareExpansion = (
  direction: 'left' | 'top' | 'right' | 'bottom',
  amount: number,
  hexInfo: HexGridParams,
): SquareDimensionShiftResults => {
  let res = {
    x_shift: 0,
    y_shift: 0,
    new_raised: hexInfo.raised,
  }

  switch (direction) {
    case 'left': {
      // Offset moves map to the left, because a tile is actually being added to the right
      if (hexInfo.orientation == 'flatTop') {
        res.x_shift = -(hexInfo.width + hexInfo.gap) * 0.75 * amount

        if (amount % 2 == 1) {
          res.new_raised = hexInfo.raised == HexRaised.ODD ? HexRaised.EVEN : HexRaised.ODD
          res.y_shift = -(hexInfo.height + hexInfo.gap) * 0.5 * (hexInfo.raised == HexRaised.ODD ? -1 : 1)
        }
      } else {
        res.x_shift = -(hexInfo.width + hexInfo.gap) * amount
      }
      return res
    }
    case 'top': {
      if (hexInfo.orientation == 'flatTop') {
        res.y_shift = -(hexInfo.height + hexInfo.gap) * amount
      } else {
        res.y_shift = -(hexInfo.height + hexInfo.gap) * 0.75 * amount

        if (amount % 2 == 1) {
          res.new_raised = hexInfo.raised == HexRaised.ODD ? HexRaised.EVEN : HexRaised.ODD
          res.x_shift = -(hexInfo.width + hexInfo.gap) * 0.5 * (hexInfo.raised == 'odd' ? -1 : 1)
        }
      }
      return res
    }
  }

  return res
}
