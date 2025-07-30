import type { HexOrientation } from "../types/terrain"
import { getHexPath } from "./hexHelpers"
import * as PIXI from 'pixi.js'
import { type Icon } from "../types/icon"
import { get_icon_texture } from '../lib/texture_loader'
import { get_image_scaled_for_hex, get_image_scaled_for_hex_relative, ScaleMode } from "./imageSizing"


export type PreviewHexInfo = {
    hexWidth: number,
    hexHeight: number,
    orientation: HexOrientation,
    color: string
}

export async function generate_icon_preview(icon: Icon, hexInfo: PreviewHexInfo, grph: PIXI.Graphics, spr: PIXI.Sprite, cont: PIXI.Container, app: PIXI.Application): Promise<string> {
		let hW = hexInfo.hexWidth;
		let hH = hexInfo.hexHeight;

		let path = getHexPath(hexInfo.hexWidth, hexInfo.hexHeight, hexInfo.orientation, 0, 0);
		grph.clear();
		grph.beginFill(hexInfo.color);
		grph.drawPolygon(path);
		grph.endFill();

		spr.texture = get_icon_texture(icon.texId);
		spr.tint = icon.color;
		spr.anchor.set(0.5, 0.5);
		spr.scale.x = icon.scaleMode === ScaleMode.BYDIMENSION 
            ? get_image_scaled_for_hex(icon.texWidth, icon.texHeight, hexInfo.hexWidth, hexInfo.hexHeight, icon.pWidth, icon.pHeight).x
            : get_image_scaled_for_hex_relative(icon.texWidth, icon.texHeight, hexInfo.hexWidth, hexInfo.hexHeight, icon.pHex).x
		spr.scale.y = icon.scaleMode === ScaleMode.BYDIMENSION
            ? get_image_scaled_for_hex(icon.texWidth, icon.texHeight, hexInfo.hexWidth, hexInfo.hexHeight, icon.pWidth, icon.pHeight).y
            : get_image_scaled_for_hex_relative(icon.texWidth, icon.texHeight, hexInfo.hexWidth, hexInfo.hexHeight, icon.pHex).y
		spr.rotation = PIXI.DEG_TO_RAD * (icon.rotation ?? 0);

		let b64 = await app.renderer.extract.base64(cont); //PIXI.autoDetectRenderer().plugins.extract.base64(c)

		return b64;
	}