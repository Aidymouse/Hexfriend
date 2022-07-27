<script lang="ts">
	import { coords_cubeToq, coords_cubeTor, coords_cubeToWorld, coords_qToCube, coords_rToCube, coords_worldToCube, hexOrientation } from '../helpers/hexHelpers';
	import type { icon_data } from '../types/data';
	import type { IconLayerIcon } from '../types/icon';
	import type { terrain_field } from '../types/terrain';
	import type { tools } from '../types/toolData';
	import type * as PIXI from 'pixi.js';
	import { Sprite } from 'svelte-pixi';

	export let icons: IconLayerIcon[] = [];

	export let L: PIXI.Loader;
	export let pan;
	export let tfield: terrain_field;
	export let selectedTool: tools;
	export let controls;

	export let data_icon: icon_data;
	export let iconTextureLookupTable: { [key: string]: string };

	let iconId: number = 0;
	icons.forEach((i) => (iconId = Math.max(iconId, i.id)));
	iconId++;

	$: {
		// Ideally, this would only trigger on a load. It can trigger on any update for now though...
		icons.forEach((i) => (iconId = Math.max(iconId, i.id)));
		iconId++;
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
		if (data_icon.usingEraser) {
			return;
		}

		newIcon();
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
		console.log(oldHexWidth, oldHexHeight)

		icons.forEach((icon: IconLayerIcon) => {


			let oldOrientation: hexOrientation = newOrientation == "flatTop" ? "pointyTop" : "flatTop"

			let closestHexCubeCoords = coords_worldToCube(icon.x, icon.y, oldOrientation, oldHexWidth, oldHexHeight)
			let closestHexPos = coords_cubeToWorld(closestHexCubeCoords.q, closestHexCubeCoords.r, closestHexCubeCoords.s, oldOrientation, oldHexWidth, oldHexHeight)
			

			let distanceFromHexLeft = tfield.hexWidth / 2 + icon.x - closestHexPos.x
			let distanceFromHexTop = tfield.hexHeight / 2 + icon.y - closestHexPos.y
			
			let proportionalHorizontalDistance = distanceFromHexLeft / oldHexWidth 
			let proportionalVerticalDistance = distanceFromHexTop / oldHexHeight 


			let conservedClosestHexRowCol = oldOrientation == "flatTop" 
				? coords_cubeToq(tfield.raised, closestHexCubeCoords.q, closestHexCubeCoords.r, closestHexCubeCoords.s)
				: coords_cubeTor(tfield.raised, closestHexCubeCoords.q, closestHexCubeCoords.r, closestHexCubeCoords.s) 



			let newHexCubeCoords = tfield.orientation == "flatTop"
				? coords_qToCube(tfield.raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row)
				: coords_rToCube(tfield.raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row)

			let newHexPos = coords_cubeToWorld(newHexCubeCoords.q, newHexCubeCoords.r, newHexCubeCoords.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight)

			
			//let closestHexPosNew = coords_cubeToWorld(closestHexCubeCoords.q, closestHexCubeCoords.r, closestHexCubeCoords.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight)
			
			// Slips slightly... why??
			icon.x = newHexPos.x - (tfield.hexWidth/2) + tfield.hexWidth * proportionalHorizontalDistance
			icon.y = newHexPos.y - (tfield.hexHeight/2) + tfield.hexHeight * proportionalVerticalDistance

			

		})

		icons = icons

		oldHexWidth = tfield.hexWidth
		oldHexHeight = tfield.hexHeight

	}

</script>

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
