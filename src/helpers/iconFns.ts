import type { HexOrientation } from "../types/terrain"
import { getHexPath } from "./hexHelpers"
import * as PIXI from 'pixi.js'
import { type Icon } from "../types/icon"
import { get_icon_texture } from '../lib/texture_loader'
import { get_icon_scale_for_hex, get_image_scaled_for_hex_relative, ScaleMode } from "./imageSizing"


export type PreviewHexInfo = {
    hexWidth: number,
    hexHeight: number,
    orientation: HexOrientation,
    color: string
}

/** Generates an icon preview by drawing a specified hex, then an icon on top, turning it into base 64, and returning the base 64. */
export async function generate_icon_preview(icon: Icon, hexInfo: PreviewHexInfo, grph: PIXI.Graphics, spr: PIXI.Sprite, cont: PIXI.Container, app: PIXI.Application): Promise<string> {

		let path = getHexPath(hexInfo.hexWidth, hexInfo.hexHeight, hexInfo.orientation, 0, 0);
		grph.clear();
		grph.beginFill(hexInfo.color);
		grph.drawPolygon(path);
		grph.endFill();

		spr.texture = get_icon_texture(icon.texId);
		spr.tint = icon.color;
		spr.anchor.set(0.5, 0.5);
		const icon_scale = get_icon_scale_for_hex(icon, hexInfo)
		spr.scale.x = icon_scale.x
		spr.scale.y = icon_scale.y
		spr.rotation = PIXI.DEG_TO_RAD * (icon.rotation ?? 0);

		let b64 = await app.renderer.extract.base64(cont); //PIXI.autoDetectRenderer().plugins.extract.base64(c)

		return b64;
	}


