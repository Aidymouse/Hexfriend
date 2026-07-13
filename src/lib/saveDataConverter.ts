import { LATESTSAVEDATAVERSION } from '../types/savedata'
import type { SaveData } from '../types/savedata'
import { HexRaised } from '../types/terrain'
import { ScaleMode } from '../helpers/imageSizing'
import * as PIXI from 'pixi.js'

/** I better make sure I like these names because they can NEVER CHANGE! Or old save versions will need to know what they used to be */
function convert_v1_to_v5(oldData: SaveData): SaveData {
  console.log('Converting save: v4- to v5')

  if (!oldData.TerrainField.largehexes) {
    //@ts-ignore - Largehexes used to be called overlay
    if (oldData.TerrainField.overlay) {
      //@ts-ignore - Largehexes used to be called overlay
      oldData.TerrainField.largehexes = JSON.parse(JSON.stringify(oldData.TerrainField.overlay))
    } else {
      oldData.TerrainField.largehexes = {
        shown: false,
        style: {
          width: 3,
          color: 0x333333,
        },
        offset: {
          x: 0,
          y: 1,
        },
        diameterInHexes: 3,
        raised: HexRaised.EVEN,
        encompassEdges: false,
      }
    }
  }

  // OVERLAY
  // Didn't exist prior to version 5
  if (!oldData.overlay) {
    oldData.overlay = {
      base64: '',
      shown: true,
      x: 0,
      y: 0,
      scale: { x: 1, y: 1 },
      opacity: 0.5,
    }
  }

  // PATH STYLE AND TEXT STYLE IDS // Missing in some map version 2's (yeah, ok, I'm shit with version numbers)
  let pId = 0
  //@ts-ignore - Pre v13 it was pathStyles
  oldData.pathStyles.forEach((pathStyle) => {
    pathStyle.id = pId
    pId++
  })

  let tId = 0
  //@ts-ignore - Pre v13 it was called textStyles
  oldData.textStyles.forEach((textStyle) => {
    textStyle.id = tId
    tId++
  })

  oldData.saveVersion = 5

  return oldData
}

function convert_v5_to_v6(oldData: SaveData): SaveData {
  console.log('Converting save: v5 to v6')
  // Changes in this version:
  //	- tiles got set IDs seperate from their individual ID
  //  - symbol ID is not the same as tile ID anymore, rather they are sorted out by the tilesetcreator
  let new_data: SaveData = JSON.parse(JSON.stringify(oldData))

  new_data.saveVersion = 6
  return new_data
}

function convert_v6_to_v7(oldData: SaveData): SaveData {
  console.log('Converting save: v6 to v7')

  let new_data: SaveData = JSON.parse(JSON.stringify(oldData))

  //@ts-ignore - Pre v13 it was called pathStyles
  new_data.pathStyles = new_data.pathStyles.map((ps) => {
    return { ...ps, style: { ...ps.style, dashed: false, dash_length: 15, dash_gap: 10 } }
  })
  new_data.paths.forEach((p) => {
    //@ts-ignore -
    p.style.dashed = false
    //@ts-ignore -
    p.style.dash_gap = 10
    //@ts-ignore -
    p.style.dash_length = 15
  })

  new_data.saveVersion = 7
  return new_data
}

function convert_v7_to_v8(old_data: SaveData): SaveData {
  console.log('Converting save: v7 to v8')

  let new_data: SaveData = JSON.parse(JSON.stringify(old_data))

  new_data.TerrainField.grid.gap = 0

  new_data.saveVersion = 8
  return new_data
}

function convert_v8_to_v9(old_data: SaveData): SaveData {
  console.log('Converting save: v8 to v9')

  let new_data: SaveData = JSON.parse(JSON.stringify(old_data))

  new_data.icon_hex_size_percentage = 80

  new_data.icons = new_data.icons.map((i) => {
    //@ts-ignore - As of v13 icons don't necessarily have phex, but they did in v9
    if (i.pHex == undefined) {
      return { ...i, pHex: 80 }
    }

    return i
  })

  new_data.saveVersion = 9

  return new_data
}

function convert_v9_to_v10(old_data: SaveData): SaveData {
  console.log('Converting save: v9 to v10')
  let new_data: SaveData = JSON.parse(JSON.stringify(old_data))

  Object.keys(new_data.TerrainField.hexes).forEach((hex_id) => {
    let hex = new_data.TerrainField.hexes[hex_id]
    if (hex.tile == null) return

    // Find tileset ID
    if (hex.tile.tileset_id == undefined) {
      //console.log(`Updating tile ${hex_id}`)

      // Attempt to find tile id. This is fallible if you have tiles with the same ID across two different tilesets
      for (const tileset of old_data.tilesets) {
        for (const tile of tileset.tiles) {
          if (tile.id == hex.tile.id) {
            hex.tile.tileset_id = tileset.id
            break
          }
          if (hex.tile.tileset_id == tileset.id) break
        }
      }

      // Fallback to default
      if (!hex.tile.tileset_id) hex.tile.tileset_id = 'default'
    }

    // Remove unneeded stuff from the save data
    hex.tile.preview = ''
    if (hex.tile.symbol) {
      hex.tile.symbol.base64 = ''
      hex.tile.symbol.preview = ''
    }
  })

  new_data.saveVersion = 10

  return new_data
}

function convert_v10_to_v11(old_data: SaveData): SaveData {
  console.log('Converting save: v10 to v11')

  if (old_data.coords.offsets == null) {
    old_data.coords.offsets = {
      row_col: { row: 0, col: 0 },
      cube: { q: 0, r: 0, s: 0 },
    }
  }

  old_data.saveVersion = 11

  return old_data
}

function convert_v11_to_v12(old_data: SaveData): SaveData {
  console.log('Converting save: v11 to v12')
  Object.entries(old_data.TerrainField.hexes).forEach(([hex_id, hex]) => {
    if (hex.tile && hex.tile.symbol) hex.tile.symbol.rotation = 0
  })

  old_data.saveVersion = 12

  return old_data
}

function convert_v12_to_v13(old_data: SaveData): SaveData {
  console.log('Coverting save: v12 -> v13')

  /** Path Styles become Listed Path Styles */
  //@ts-ignore - Pre v13 it was called pathStyles. ALso the type got updated but they were compatible. The old version was an error but it makes conversion easier
  old_data.path_styles = [...old_data.pathStyles]
  //@ts-ignore - Pre v13 it was called pathStyles
  delete old_data.pathStyles

  /** Text style rename + alpha */
  //@ts-ignore - Pre v13 it was called textStyles
  old_data.text_styles = old_data.textStyles.map((ts) => ({ ...ts, alpha: 1 }))


  /** Icon Scale Modes */
  old_data.icons.forEach((i) => {
    i.scaleMode = i.scaleMode ?? ScaleMode.RELATIVE
    if (typeof i.scale === 'number') {
			 i.scale = { x: i.scale, y: i.scale }
		}
    i.onLayerId = parseInt(i.id)
		console.log(i.scaleMode)
  })

	old_data.iconsets.forEach( iconset => {
		iconset.supported_orientations = iconset.supported_orientations ?? 'both'
	})

	/* Hex tiles with symbols also need scale modes now */
	// TODO:

  old_data.saveVersion = 13

  return old_data
}

/* it occurs to me that the best thing to do would be save old versions of the save data types, but that means copying a LOT of other nested types. And I'm lazy. */
const convert_v13_to_v14 = (oldData: SaveData): SaveData => {
  console.log('Coverting save: v13 -> v14')

  // @ts-ignore
  oldData.TerrainField.gap = oldData.TerrainField.grid.gap
  // @ts-ignore
  delete oldData.TerrainField.grid.gap

  // Text 'alpha' got moved into style
  oldData.texts.forEach((t) => {
    // @ts-ignore
    t.style.alpha = t.alpha ?? 1
    // @ts-ignore
    delete t.alpha
    if (typeof t.style.fill === 'string') {
      t.style.fill = PIXI.utils.string2hex(t.style.fill)
    }
    if (typeof t.style.stroke === 'string') {
      t.style.stroke = PIXI.utils.string2hex(t.style.stroke)
    }
  })

  // Above text changes require update to text styles as well
  oldData.text_styles.forEach((ts) => {
    if (typeof ts.style.fill === 'string') {
      ts.style.fill = PIXI.utils.string2hex(ts.style.fill)
    }
    if (typeof ts.style.stroke === 'string') {
      ts.style.stroke = PIXI.utils.string2hex(ts.style.stroke)
    }
    ts.style.alpha = ts.style.alpha ?? 1
  })

  // Overlay moved base64 out of data
  // @ts-ignore
  oldData.overlay_base64 = oldData.overlay.base64 === '' ? null : oldData.overlay.base64

  // Strip base64 from icons stored on the map. We don't need all that !!!!
  oldData.icons.forEach(icon => {
    icon.base64 = ""
  })

  // Paths gained fill attribs in style
  oldData.paths.forEach(path => {
    path.style.filled = path.style.filled ?? false
    path.style.fill_color = path.style.fill_color ?? path.style.color
    path.style.fill_opacity = path.style.fill_opacity ?? 0.5
  })

  oldData.saveVersion = 14

  return oldData
}

export const makeEfficient = (save_data: SaveData) => {

  for (const [hexId, terrainHex] of Object.entries(save_data.TerrainField.hexes)) {
    if (terrainHex.tile) {
      delete terrainHex.tile.preview_flatTop
      delete terrainHex.tile.preview_pointyTop
    }
  }
}

export function convertSaveDataToLatest(oldData: SaveData): SaveData {
  // Update to latest version
  let newData: SaveData = JSON.parse(JSON.stringify(oldData))

  if (newData.saveVersion < 5) {
    newData = convert_v1_to_v5(newData)
  }
  if (newData.saveVersion == 5) {
    newData = convert_v5_to_v6(newData)
  }
  if (newData.saveVersion == 6) {
    newData = convert_v6_to_v7(newData)
  }
  if (newData.saveVersion == 7) {
    newData = convert_v7_to_v8(newData)
  }
  if (newData.saveVersion == 8) {
    newData = convert_v8_to_v9(newData)
  }
  if (newData.saveVersion == 9) {
    newData = convert_v9_to_v10(newData)
  }
  if (newData.saveVersion == 10) {
    newData = convert_v10_to_v11(newData)
  }
  if (newData.saveVersion == 11) {
    newData = convert_v11_to_v12(newData)
  }
  if (newData.saveVersion == 12) {
    newData = convert_v12_to_v13(newData)
  }
  if (newData.saveVersion == 13) {
    newData = convert_v13_to_v14(newData)
  }

  makeEfficient(newData)


  return newData
}
