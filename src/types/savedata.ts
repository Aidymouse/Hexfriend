import type { coordinates_data, overlay_data } from './data'
import type { IconLayerIcon, Iconset } from './icon'
import type { listed_path_style, path_style } from './path'
import type { TerrainField } from './terrain'
import type { listed_text_style } from './text'
import type { Tileset } from './tilesets'

const LATESTSAVEDATAVERSION = 13
const LATEST_DEFAULT_ICONS_VERSION = 5

export type SaveData = {
  saveVersion: number
  title: string

  coords: coordinates_data

  TerrainField: TerrainField
  tilesets: Tileset[]
  iconsets: Iconset[]

  icon_hex_size_percentage: number // wtf is this ????

  overlay: overlay_data

  paths: []
  texts: []
  icons: IconLayerIcon[]

  path_styles: listed_path_style[]
  text_styles: listed_text_style[]
}

export { LATEST_DEFAULT_ICONS_VERSION, LATESTSAVEDATAVERSION }
