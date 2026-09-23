import type { CoordinatesData, OverlayData } from './data'
import type { IconLayerIcon, Iconset } from './icon'
import type { ListedPathStyle, PathLayerPath, PathStyle } from './path'
import type { TerrainField } from './terrain'
import type { ListedTextStyle, TextLayerText } from './text'
import type { Tileset } from './tilesets'

const LATESTSAVEDATAVERSION = 14
const LATEST_DEFAULT_ICONS_VERSION = 5

export type SaveData = {
  saveVersion: number
  title: string

  coords: CoordinatesData

  TerrainField: TerrainField
  tilesets: Tileset[]
  iconsets: Iconset[]

  icon_hex_size_percentage: number // wtf is this ????

  overlay: OverlayData
  overlay_base64: string | null

  paths: PathLayerPath[]
  texts: TextLayerText[]
  icons: IconLayerIcon[]

  path_styles: ListedPathStyle[]
  text_styles: ListedTextStyle[]
}

export { LATEST_DEFAULT_ICONS_VERSION, LATESTSAVEDATAVERSION }
