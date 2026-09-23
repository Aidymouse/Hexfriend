import { initCanvas, initTextureStore, initTranslation, TextureStore } from './init/index.js'
import type { Translation } from './types/translationTypes'

/* Global state that is ASSUMED TO ALWAYS BE INITED!!! */
declare global {
  var ctx: CanvasRenderingContext2D
  var tl: Translation
  var textureStore: TextureStore
}

/*
 * In charge of initing all the hexfriend app!
 */
export const initHexfriend = () => {
  initCanvas()
  initTextureStore()
  initTranslation()
}
