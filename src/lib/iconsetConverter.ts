import { ScaleMode } from '../helpers/imageSizing'
import type { Iconset } from '../types/icon'
import * as PIXI from 'pixi.js'

const convert_v1_to_v2 = async (old: Iconset): Promise<Iconset> => {
  let new_iconset = {...old}
  
  // Icon Updates
  for (const icon of new_iconset.icons) {
    // Scale Mode
    if (!icon.scaleMode) { icon.scaleMode = ScaleMode.RELATIVE }
    // Rotation
    if (!icon.rotation) { icon.rotation = 0 }

    // Icon might not have texWidth and texHeight stored, which will break scale. So we need to find it.
    if (!icon.texWidth || !icon.texHeight) {
	const tex = await PIXI.Assets.load(icon.base64)
	icon.texWidth = tex.width;
	icon.texHeight = tex.height;
    }

  }

  // Supported orientations
  new_iconset.supported_orientations = 'both'



  // Format version
  new_iconset.format_version = 2;

  return new_iconset
}

export const convert_iconset_to_latest = async (iconset: Iconset) => {
  let new_iconset: Iconset = {...iconset}

  if (!new_iconset.format_version) { new_iconset = await convert_v1_to_v2(new_iconset) }

  return new_iconset;
}
