import type { coord_system } from './cordinates';
import type { path, path_style } from './path';
import type { HF_text, text_style } from './text';
import type { Tile, TileSymbol } from './tilesets';
import type * as PIXI from 'pixi.js';

export interface terrain_data {
	tile?: Tile;
	usingEyedropper: boolean;
	usingPaintbucket: boolean;
	usingEraser: boolean;
	renderOpacity: number;
}

export interface icon_data {
	color: number;
	texId?: string;
	pHex: number;
	snapToHex: boolean;
	usingEraser: boolean;
}

export interface coordinates_data {
	shown: boolean;
	style: PIXI.Text['style'];
	system: coord_system;
	seperator: string;
	gap: number;
}

export interface text_data {
	style: text_style;
	selectedText?: HF_text;
	editorRef: any;
	usingTextTool: boolean;
}

export interface path_data {
	selectedPath: path;
	snap: boolean;
	style: path_style;
}

export interface trace_data {
	opacity: number;
	base64: string;
}

const checkboxBase64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsSAAALEgHS3X78AAAELElEQVR4nO2b0XGbQBCGN5kUoBKSDuRXXpA7sDqQKog1w7vjd2bsVGB3YHcg88KrSQVRCSohw2TtwQkcur1dOMT/PYsD9HN7+9/uEQAAAAAAAAAAAAAAAAAAAABD8gn/tpy8TBdEtOQBqiwpjqFjQhABeZluiOh7Q4w3KiL6mSXFo3RsCOIBz4gnIlr1XPVCRGvJjPls/RLnAouxP0EM4t/sJa8OQU7noSVEuVjmZfrD9yYIWSeQl2ktxkZwaR2yvvmELsyQHvIyvRaKUbM4McS9A0EccDZ1FziMT5iDIF3kZbrkdWNQIEgLLIYoS2rBK/WFIP/Q8BoLpSFffH4MQRo0vMZXpSEPWVJUPhdAkI88+S7CPWx9L4AgDHsNrxS1h12WFF7hiiDIX9hRS71GG49ZUtxLLpy9U2evoZnePmdJsZZePOsZkpfpSlmMSrJuNJntDGl4Da309kBEF6FFqlkKwuntb0UxahEufVPcNmYXshpeQ0sM0hKDZrqGqHsNLTFoboIYeQ1x/byN2QiSl+ldLF7DxSwWdQOvUYsRlN52cfYzJC/TKwOvsVMc7wNnPUMMvEbFGVVwQ1wXZytIXqb1FvprjF7DxZfQAfgrXDVevHasL1lSHMyeuv+ZtItMg4hBIYLwPtBNVxqZl+kjp4Vm09vBXtlr7IYQg6QhyyNrGezLeiOgh6qLrbbXcOEtCM8MnwYAlU23U2Cvca04pFl624Uk7fVNIevFdc9x3QyetZMWg3wF4Zxe0gBg2uNkYPxMvYYL3xkSslBecXxXhbO80O7CJuZew4WvIGng/TaSjvAuDIzfkRfxUcQggSAaD3rDISYIXpMepug1XPgK8kvpvg+crYloFJmirWtI8RXkWfHeTxxyJNwZiKH5bmIkPuRV8c/wPtBiYPzus6QYJaNqQ+JDNHPzhY9H4bVHu8gUjRgkEYTjrKYoS94IdGLhNcYwfn2IClS8t6P5Za1cHsXKayiOp0ZQPcQgnt9mSfHBpxh5jYsxywMuggtUeZnW4eZK8Zned1cN0tsovIYLDUEsPMGaTx6pjxtLetuFSgnX6EuulHuoBq1rSFGrqRvEek3+W5tiRbXJIVJRRqlrSFHvOjHwCyHUzRZRprddqDfKcZyO4YusODmYFGZ9WQYexQfvPbJYMGsl5bg9RlZzHLPiF4p1b++OQ8eQrGM2fn2YCsJf6eWAomwlZ8Njwrz7nUXZKpV/XdxOwfj1MViztbFHmZTXcDFo9zv3dfXWPjwJOqgfG4Me2OGNPc0vWbtYNjqDn6DiOK9xNu8w5fS2i9EO7AQax+jrGlJGPUEV0MFycY5iUASHPiUeJYqGNitGP2PoWdyaRJEphNGPRTfcvGuhf1vAz1oMiu0ULs+W5hmUI9c0zjZEAQAAAAAAAAAAAAAAAAAAAAAAQ0R/ADdPiGDrpa0oAAAAAElFTkSuQmCC`;
export { checkboxBase64 };
