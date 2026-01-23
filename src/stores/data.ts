import type {
  coordinates_data,
  eraser_data,
  icon_data,
  overlay_data,
  path_data,
  terrain_data,
  text_data,
} from '../types/data'
import { coord_system } from '../types/coordinates'
import { type Icon } from '../types/icon'
import { DEFAULTICONSET } from '../lib/defaultIconset'

import * as PIXI from 'pixi.js'
import { get, writable, type Writable } from 'svelte/store'

export let data_terrain: Writable<terrain_data> = writable({
  tile: null,
  usingEyedropper: false,
  usingPaintbucket: false,
  usingEraser: false,
  renderOpacity: 1,
  genPreview: false,
})

export let data_path: Writable<path_data> = writable({
  style: {
    color: 0,
    width: 3,
    cap: PIXI.LINE_CAP.ROUND,
    join: PIXI.LINE_JOIN.ROUND,
    dashed: false,
    dash_length: 10,
    dash_gap: 5,
  },
  hoveredPath: null,
  selectedPath: null,
  dontSelectPaths: null,
  snap: false,
  contextPathId: null,
  add_to: 'start',
})

export let data_icon: Writable<icon_data> = writable({
  icon: DEFAULTICONSET.icons[0],
  snapToHex: true,
  usingEraser: false,
  dragMode: false,
  usingEyedropper: false,
  rotation: 0,
})

export let data_text: Writable<text_data> = writable({
  style: {
    fontFamily: 'Segoe UI',
    fill: '#000000',
    fontSize: 25,
    miterLimit: 2,
    strokeThickness: 0,
    stroke: '#f2f2f2',
    align: 'left',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  alpha: 1,
  selectedText: null,
  editorRef: null,
  usingTextTool: false,
  contextStyleId: null,
})

export let data_overlay: Writable<overlay_data> = writable({
  shown: true,
  base64: '',
  x: 0,
  y: 0,
  scale: { x: 1, y: 1 },
  opacity: 0.5,
})

export let data_coordinates: Writable<coordinates_data> = writable({
  shown: true,
  style: { fill: 0x000000, fontSize: 10 },
  system: coord_system.ROWCOL,
  seperator: '.',
  gap: 4,
  offsets: {
    row_col: { row: 0, col: 0 },
    cube: { q: 0, r: 0, s: 0 },
  },
})

export let data_eraser: Writable<eraser_data> = writable({
  eraseIcons: true,
  eraseTerrain: true,
})
