import { ScaleMode } from '../helpers/imageSizing'
import type { Iconset } from '../types/icon'

const convert_v1_to_v2 = (old: Iconset): Iconset => {
  let new_iconset = {...old}
  
  // Icons have scalemode now
  new_iconset.icons.forEach(icon => {
    if (!icon.scaleMode) { icon.scaleMode = ScaleMode.RELATIVE }
  })

  // Supported orientations
  new_iconset.supported_orientations = 'both'

  // Format version
  new_iconset.format_version = 2;

  return new_iconset
}

export const convert_iconset_to_latest = (iconset: Iconset) => {
  let new_iconset: Iconset = {...iconset}

  if (!new_iconset.format_version) { new_iconset = convert_v1_to_v2(new_iconset) }

  return new_iconset;
}
