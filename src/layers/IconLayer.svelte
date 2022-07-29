<script lang="ts">
	import { coords_cubeToq, coords_cubeTor, coords_cubeToWorld, coords_qToCube, coords_rToCube, coords_worldToCube, hexOrientation } from '../helpers/hexHelpers';
	import type { icon_data } from '../types/data';
	import type { IconLayerIcon } from '../types/icon';
	import type { terrain_field } from '../types/terrain';
	import { tools } from '../types/toolData';
	import type * as PIXI from 'pixi.js';
	import { Container, Sprite } from 'svelte-pixi';

	export let icons: IconLayerIcon[] = [];

	export let L: PIXI.Loader;
	export let pan;
	export let tfield: terrain_field;
	export let selectedTool: tools;
	export let controls;

	export let data_icon: icon_data;
	export let iconTextureLookupTable: { [key: string]: string };

	let floatingIcon: IconLayerIcon | null = null;

	let iconId: number = 0;
	icons.forEach((i) => (iconId = Math.max(iconId, i.id)));
	iconId++;

	$: {
		// Ideally, this would only trigger on a load. It can trigger on any update for now though...
		icons.forEach((i) => (iconId = Math.max(iconId, i.id)));
		iconId++;

		if (floatingIcon) floatingIcon.scale = getIconScale()
	}

	function getIconScale() {
		let scale: number;
		if (tfield.hexWidth < tfield.hexHeight) {
			scale = (tfield.hexWidth * (data_icon.pHex / 100)) / L.resources[getIconTextureId(data_icon.texId)].texture.width;
		} else {
			scale = (tfield.hexHeight * (data_icon.pHex / 100)) / L.resources[getIconTextureId(data_icon.texId)].texture.height;
		}

		return scale;
	}

	function getIconTextureId(id: string): string {
		if (Object.keys(iconTextureLookupTable).find((k) => k == id)) {
			return iconTextureLookupTable[id];
		}

		return id;
	}

	export function newIcon() {
		let iconX = pan.worldX;
		let iconY = pan.worldY;

		if (data_icon.snapToHex) {
			let clickedHexCoords = coords_worldToCube(pan.worldX, pan.worldY, tfield.orientation, tfield.hexWidth, tfield.hexHeight);
			let iconCoords = coords_cubeToWorld(
				clickedHexCoords.q,
				clickedHexCoords.r,
				clickedHexCoords.s,
				tfield.orientation,
				tfield.hexWidth,
				tfield.hexHeight
			);
			iconX = iconCoords.x;
			iconY = iconCoords.y;
		}

		icons.push({ x: iconX, y: iconY, color: data_icon.color, scale: getIconScale(), id: iconId, texId: data_icon.texId });
		iconId++;
		icons = icons;
	}

	function deleteIcon(icon: IconLayerIcon) {
		let iconIndex = icons.indexOf(icon);
		icons.splice(iconIndex, 1);
		icons = icons;
	}

	export function pointerdown() {
		if (data_icon.usingEraser) return;

		newIcon();
		//createFloatingIcon();
	}

	export function pointerup() {
		if (data_icon.usingEraser) return;

		//newIcon();
		//destroyFloatingIcon();
	}

	export function pointermove() {
		if (floatingIcon) updateFloatingIcon();
		cursorOnLayer = true

	}

	let cursorOnLayer: boolean = false
	export function pointerout() {
		cursorOnLayer = false
	}

	// Floating icons have a few bugs / polish requried:
		// - Icon sticks around but doesnt move when mouse is not on layer
		// - Icon appears weirdly when icon layer is switched too, will need to update when layer is switched to
		// - Scale only updates when the mouse goes back onto the layer. Want it to update smoothly as its chaanged (may be non issue as floating icon wont be seen when mouse is off layer)
	function createFloatingIcon() {
		let iconX = pan.worldX;
		let iconY = pan.worldY;

		if (data_icon.snapToHex) {
			let mouseHexCoords = coords_worldToCube(pan.worldX, pan.worldY, tfield.orientation, tfield.hexWidth, tfield.hexHeight)
			let iconCoords = coords_cubeToWorld(mouseHexCoords.q, mouseHexCoords.r, mouseHexCoords.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight)

			iconX = iconCoords.x
			iconY = iconCoords.y

		}

		floatingIcon = { x: iconX, y: iconY, color: data_icon.color, scale: getIconScale(), id: iconId, texId: data_icon.texId }
	}

	function updateFloatingIcon() {
		if (data_icon.snapToHex) {
			let mouseHexCoords = coords_worldToCube(pan.worldX, pan.worldY, tfield.orientation, tfield.hexWidth, tfield.hexHeight)
			let iconCoords = coords_cubeToWorld(mouseHexCoords.q, mouseHexCoords.r, mouseHexCoords.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight)

			floatingIcon.x = iconCoords.x
			floatingIcon.y = iconCoords.y

		} else {
			floatingIcon.x = pan.worldX
			floatingIcon.y = pan.worldY
		
		}
	}


	export function moveAllIcons(xMod: number, yMod: number) {
		icons.forEach((icon) => {
			icon.x += xMod;
			icon.y += yMod;
		});

		icons = icons;
	}

	let oldHexWidth: number
	let oldHexHeight: number
	// This is called during layer set up when maps are loaded, or when hex fields are focused on.
	export function saveOldHexMeasurements(hexWidth: number, hexHeight: number) {
		oldHexWidth = hexWidth;
		oldHexHeight = hexHeight;
	}


	export function retainIconPositionOnHexResize(newHexWidth: number, newHexHeight: number) {
		// Find proprtional horizontal and vertical distance from center of nearest hex, and retain the position with the new width and height

		icons.forEach((icon: IconLayerIcon) => {

			let closestHexCubeCoords = coords_worldToCube(icon.x, icon.y, tfield.orientation, oldHexWidth, oldHexHeight)
			let closestHexPos = coords_cubeToWorld(closestHexCubeCoords.q, closestHexCubeCoords.r, closestHexCubeCoords.s, tfield.orientation, oldHexWidth, oldHexHeight)
			
			let distanceFromHexLeft = oldHexWidth / 2 + icon.x - closestHexPos.x
			let distanceFromHexTop = oldHexHeight/2 + icon.y - closestHexPos.y
			
			let proportionalHorizontalDistance = distanceFromHexLeft / oldHexWidth 
			let proportionalVerticalDistance = distanceFromHexTop / oldHexHeight 
			
			let closestHexPosNew = coords_cubeToWorld(closestHexCubeCoords.q, closestHexCubeCoords.r, closestHexCubeCoords.s, tfield.orientation, newHexWidth, newHexHeight)
			
			icon.x = closestHexPosNew.x - (newHexWidth/2) + newHexWidth * proportionalHorizontalDistance
			icon.y = closestHexPosNew.y - (newHexHeight/2) + newHexHeight * proportionalVerticalDistance

		})

		icons = icons

		oldHexWidth = newHexWidth
		oldHexHeight = newHexHeight

	}

	export function retainIconPositionOnOrientationChange(newOrientation: hexOrientation) {
		// Only really works on square maps afaik
		// Because it relies on row/col coords

		icons.forEach((icon: IconLayerIcon) => {

			let oldOrientation: hexOrientation = newOrientation == "flatTop" ? "pointyTop" : "flatTop"

			// Find the center coordinates of the hex the icon wants to stay in
			let oldClosestHexCubeCoords = coords_worldToCube(icon.x, icon.y, oldOrientation, oldHexWidth, oldHexHeight)
			let oldClosestHexPos = coords_cubeToWorld(oldClosestHexCubeCoords.q, oldClosestHexCubeCoords.r, oldClosestHexCubeCoords.s, oldOrientation, oldHexWidth, oldHexHeight)

			let distanceFromHexLeft = oldHexWidth / 2 + icon.x - oldClosestHexPos.x
			let distanceFromHexTop = oldHexHeight / 2 + icon.y - oldClosestHexPos.y
			
			// How far left and down were we in the old hex?
			let proportionalHorizontalDistance = distanceFromHexLeft / oldHexWidth 
			let proportionalVerticalDistance = distanceFromHexTop / oldHexHeight 


			// Find the row / col of the old hex
			let conservedClosestHexRowCol = oldOrientation == "flatTop" 
				? coords_cubeToq(tfield.raised, oldClosestHexCubeCoords.q, oldClosestHexCubeCoords.r, oldClosestHexCubeCoords.s)
				: coords_cubeTor(tfield.raised, oldClosestHexCubeCoords.q, oldClosestHexCubeCoords.r, oldClosestHexCubeCoords.s) 


			// Find the hex position of the hex at the same row/col, but opposite orientation
			let newHexCubeCoords = tfield.orientation == "flatTop"
				? coords_qToCube(tfield.raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row)
				: coords_rToCube(tfield.raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row)

			// Find X and Y world position of new hex
			let newHexPos = coords_cubeToWorld(newHexCubeCoords.q, newHexCubeCoords.r, newHexCubeCoords.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight)

			
			// Adjust icon position to be the same amount left and down proportional to hex width and height as it was before the transformation 
			icon.x = newHexPos.x - (tfield.hexWidth/2) + tfield.hexWidth * proportionalHorizontalDistance
			icon.y = newHexPos.y - (tfield.hexHeight/2) + tfield.hexHeight * proportionalVerticalDistance
			
		})

		icons = icons

		oldHexWidth = tfield.hexWidth
		oldHexHeight = tfield.hexHeight

	}

	createFloatingIcon();

</script>


{#if floatingIcon}
	<Sprite
		texture = {L.resources[getIconTextureId(data_icon.texId)].texture}
		x={floatingIcon.x}
		y={floatingIcon.y}
		tint={data_icon.color}
		anchor={{ x: 0.5, y: 0.5 }}
		scale={{ x: floatingIcon.scale, y: floatingIcon.scale }}
		alpha={0.5}
		visible={!data_icon.usingEraser && selectedTool == tools.ICON && cursorOnLayer}
	/>
{/if}

{#each icons as icon (icon.id)}
	<Sprite
		texture={L.resources[getIconTextureId(icon.texId)].texture}
		x={icon.x}
		y={icon.y}
		tint={icon.color}
		anchor={{ x: 0.5, y: 0.5 }}
		scale={{ x: icon.scale, y: icon.scale }}
		interactive={selectedTool == 'eraser' || (selectedTool == 'icon' && data_icon.usingEraser)}
		on:pointerdown={(e) => {
			if (e.detail.data.button == 0) deleteIcon(icon);
		}}
		on:pointerover={(e) => {
			if (controls.mouseDown[0]) deleteIcon(icon);
		}}
	/>
{/each}
