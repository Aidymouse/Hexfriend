import type { HexOrientation } from "../types/terrain"
import { getHexPath } from "./hexHelpers"
import * as PIXI from 'pixi.js'
import { type Icon } from "../types/icon"
import { get_icon_texture } from '../lib/texture_loader'
import { get_icon_scale_for_hex, get_image_scaled_for_hex_relative, ScaleMode } from "./imageSizing"
import { type Iconset } from "../types/icon"

const debug = false;

export type PreviewHexInfo = {
	hexWidth: number,
	hexHeight: number,
	orientation: HexOrientation,
	color: string
}

/** Generates an icon preview by drawing a specified hex, then an icon on top, turning it into base 64, and returning the base 64.
 * @param icon - The icon
 * @param hexInfo - The hex to generate a preview for
 * @param grph - A pixi graphics object to render to 
 * @param spr - A pixi sprite object to render the icon to
 * @param cont - A pixi container
 * @param app - A pixi application
 * @param customTexture - Will be used in place of the icon loaded texture 
* */
export async function generate_icon_preview(icon: Icon, hexInfo: PreviewHexInfo, grph: PIXI.Graphics, spr: PIXI.Sprite, cont: PIXI.Container, app: PIXI.Application, customTexture?: PIXI.Texture): Promise<string> {

	//debug && console.log("Generating icon preview for", icon.id)

	let path = getHexPath(hexInfo.hexWidth, hexInfo.hexHeight, hexInfo.orientation, 0, 0);
	grph.clear();
	grph.beginFill(hexInfo.color);
	grph.drawPolygon(path);
	grph.endFill();

	const icon_scale = get_icon_scale_for_hex(icon, hexInfo)
	const matrix = new PIXI.Matrix().rotate(PIXI.DEG_TO_RAD * icon.rotation).scale(icon_scale.x, icon_scale.y);


	spr.texture = customTexture ?? get_icon_texture(icon.texId);
	spr.tint = icon.color;
	spr.anchor.set(0.5, 0.5);
	// spr.rotation = PIXI.DEG_TO_RAD * (icon.rotation ?? 0);
	// spr.scale.x = icon_scale.x
	// spr.scale.y = icon_scale.y
	spr.transform.setFromMatrix(matrix);

	let b64 = await app.renderer.extract.base64(cont); //PIXI.autoDetectRenderer().plugins.extract.base64(c)



	return b64;
}


export async function generate_ordered_icon_preview(icon: Icon, hexInfo: PreviewHexInfo, customTexture: PIXI.Texture): Promise<string> {

	// Sprite rotates, container scales
	const app = new PIXI.Application();
	const spr = new PIXI.Sprite();
	const grph = new PIXI.Graphics();
	const cont = new PIXI.Container();
	// const cont_scaler = new PIXI.Container();
	cont.addChild(grph);
	cont.addChild(spr);
	// cont.addChild(cont_scaler);
	// cont_scaler.addChild(spr);

	let path = getHexPath(hexInfo.hexWidth, hexInfo.hexHeight, hexInfo.orientation, 0, 0);
	grph.clear();
	grph.beginFill(hexInfo.color);
	grph.drawPolygon(path);
	grph.endFill();

	const icon_scale = get_icon_scale_for_hex(icon, hexInfo)

	const mtrx_spr = new PIXI.Matrix();
	mtrx_spr.rotate(PIXI.DEG_TO_RAD * icon.rotation);
	mtrx_spr.scale(icon_scale.x, icon_scale.y);



	spr.texture = customTexture ?? get_icon_texture(icon.texId);
	spr.tint = icon.color;
	spr.anchor.set(0.5, 0.5);
	spr.transform.setFromMatrix(mtrx_spr)
	// spr.rotation = PIXI.DEG_TO_RAD * (icon.rotation ?? 0);
	// cont_scaler.scale.x = icon_scale.x
	// cont_scaler.scale.y = icon_scale.y

	let b64 = await app.renderer.extract.base64(cont); //PIXI.autoDetectRenderer().plugins.extract.base64(c)

	spr.destroy();
	grph.destroy();
	// cont_scaler.destroy();
	cont.destroy();
	app.destroy();

	return b64;
}

export const copy_iconset = (set: Iconset, new_id: string)  => {
	let new_iconset = {...set}

	new_iconset.id = new_id
	// for (const icon of new_iconset.icons) {
	// }

	return new_iconset
}
