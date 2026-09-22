import { initCanvas } from './init'
import type { Translation } from './types'

declare global {
  var ctx: CanvasRenderingContext2D
  var tl: Translation

}

/* 
 * In charge of initing all the hexfriend app!
 */
export const initHexfriend = () => {
  initCanvas()
}
