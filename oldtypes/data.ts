import { type Icon } from './icon'
import type { coord_system } from './coordinates'
import type { FillStyle, PathLayerPath, PathStyle } from './path'
import type { TextLayerText, TextStyle } from './text'
import type { Tile } from './tilesets'
import type * as PIXI from 'pixi.js'

export interface terrain_data {
  tile?: Tile
  usingEyedropper: boolean
  usingPaintbucket: boolean
  usingEraser: boolean
  renderOpacity: number
  /** Might be a hack, but this lets me tell the terrainpanel to generate new previews from anywhere I have terrain_data */
  genPreview: boolean
}

export type icon_data = {
  icon: Icon
  snapToHex: boolean
  usingEraser: boolean
  usingEyedropper: boolean
  dragMode: boolean
}

export type CoordinateOffsets = {
    row_col: { row: number; col: number }
    cube: { q: number; r: number; s: number }
  }

export type CoordinatesData = {
  shown: boolean
  style: Partial<PIXI.Text['style']>
  system: coord_system
  seperator: string
  gap: number
  offsets: CoordinateOffsets
}

export type text_data = {
  style: TextStyle
  selectedText?: TextLayerText
  editorRef: any
  usingTextTool: boolean
  contextStyleId?: number
}

export type PathData = {
  selectedPath?: PathLayerPath
  hoveredPath?: PathLayerPath
  dontSelectPaths: boolean
  snap: boolean
  style: PathStyle
  contextPathId?: number
  add_to: 'start' | 'end' // Which side of the path to add to
}

export interface trace_data {
  opacity: number
  base64: string
}

export interface eraser_data {
  eraseTerrain: boolean
  eraseIcons: boolean
}

export type OverlayData = {
  shown: boolean
  x: number
  y: number
  scale: { x: number; y: number }
  opacity: number
}

const checkboxBase64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsSAAALEgHS3X78AAAELElEQVR4nO2b0XGbQBCGN5kUoBKSDuRXXpA7sDqQKog1w7vjd2bsVGB3YHcg88KrSQVRCSohw2TtwQkcur1dOMT/PYsD9HN7+9/uEQAAAAAAAAAAAAAAAAAAAABD8gn/tpy8TBdEtOQBqiwpjqFjQhABeZluiOh7Q4w3KiL6mSXFo3RsCOIBz4gnIlr1XPVCRGvJjPls/RLnAouxP0EM4t/sJa8OQU7noSVEuVjmZfrD9yYIWSeQl2ktxkZwaR2yvvmELsyQHvIyvRaKUbM4McS9A0EccDZ1FziMT5iDIF3kZbrkdWNQIEgLLIYoS2rBK/WFIP/Q8BoLpSFffH4MQRo0vMZXpSEPWVJUPhdAkI88+S7CPWx9L4AgDHsNrxS1h12WFF7hiiDIX9hRS71GG49ZUtxLLpy9U2evoZnePmdJsZZePOsZkpfpSlmMSrJuNJntDGl4Da309kBEF6FFqlkKwuntb0UxahEufVPcNmYXshpeQ0sM0hKDZrqGqHsNLTFoboIYeQ1x/byN2QiSl+ldLF7DxSwWdQOvUYsRlN52cfYzJC/TKwOvsVMc7wNnPUMMvEbFGVVwQ1wXZytIXqb1FvprjF7DxZfQAfgrXDVevHasL1lSHMyeuv+ZtItMg4hBIYLwPtBNVxqZl+kjp4Vm09vBXtlr7IYQg6QhyyNrGezLeiOgh6qLrbbXcOEtCM8MnwYAlU23U2Cvca04pFl624Uk7fVNIevFdc9x3QyetZMWg3wF4Zxe0gBg2uNkYPxMvYYL3xkSslBecXxXhbO80O7CJuZew4WvIGng/TaSjvAuDIzfkRfxUcQggSAaD3rDISYIXpMepug1XPgK8kvpvg+crYloFJmirWtI8RXkWfHeTxxyJNwZiKH5bmIkPuRV8c/wPtBiYPzus6QYJaNqQ+JDNHPzhY9H4bVHu8gUjRgkEYTjrKYoS94IdGLhNcYwfn2IClS8t6P5Za1cHsXKayiOp0ZQPcQgnt9mSfHBpxh5jYsxywMuggtUeZnW4eZK8Zned1cN0tsovIYLDUEsPMGaTx6pjxtLetuFSgnX6EuulHuoBq1rSFGrqRvEek3+W5tiRbXJIVJRRqlrSFHvOjHwCyHUzRZRprddqDfKcZyO4YusODmYFGZ9WQYexQfvPbJYMGsl5bg9RlZzHLPiF4p1b++OQ8eQrGM2fn2YCsJf6eWAomwlZ8Njwrz7nUXZKpV/XdxOwfj1MViztbFHmZTXcDFo9zv3dfXWPjwJOqgfG4Me2OGNPc0vWbtYNjqDn6DiOK9xNu8w5fS2i9EO7AQax+jrGlJGPUEV0MFycY5iUASHPiUeJYqGNitGP2PoWdyaRJEphNGPRTfcvGuhf1vAz1oMiu0ULs+W5hmUI9c0zjZEAQAAAAAAAAAAAAAAAAAAAAAAQ0R/ADdPiGDrpa0oAAAAAElFTkSuQmCC`
export { checkboxBase64 }
