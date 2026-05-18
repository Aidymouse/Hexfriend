import { type OverlayData } from '../types/data'

/* Check if overlay data (transform params, position) match */
export const overlayDataMatches = (data1: OverlayData, data2: OverlayData) => {
  for (const [k, v] of Object.entries(data1)) {
    if (k === 'scale') {
      if (data1.scale.x !== data2.scale.x) {
        return false
      }
      if (data1.scale.y !== data2.scale.y) {
        return false
      }
    } else {
      if (v !== data2[k]) {
        return false
      }
    }
  }
  return true
}
