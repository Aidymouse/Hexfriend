<script lang="ts">
	import {
		coords_cubeToWorld,
		coords_cubeToq,
		coords_cubeTor,
		coords_qToCube,
		coords_rToCube,
		coords_worldToCube,
		hexOrientation,
	} from '../helpers/hexHelpers';
	import * as store_panning from '../stores/panning';
	import * as store_tfield from '../stores/tfield';
	import { store_selected_tool } from '../stores/tools';
	import type { eraser_data, icon_data } from '../types/data';
	import type { IconLayerIcon } from '../types/icon';
	import type { shortcut_data } from '../types/inputs';
	import type { pan_state } from '../types/panning';
	import { tools } from '../types/toolData';
	import { map_shape } from '../types/settings';
	import type { terrain_field } from '../types/terrain';
	import * as PIXI from 'pixi.js';

	import { get_icon_texture } from '../lib/texture_loader'

	import { afterUpdate, onMount } from 'svelte';


	export let icons: IconLayerIcon[] = [];
	let pixi_icons: {[key: number]: PIXI.Sprite} = {}; // keeps up to date with icons
	
	export let cont_icon: PIXI.Container;


	let pan: pan_state;
	store_panning.store.subscribe((newPan) => {
		pan = newPan;
	});
	
	let selectedTool: tools;
	store_selected_tool.subscribe(n => selectedTool = n);

	export let controls;

	let tfield: terrain_field;
	store_tfield.store.subscribe((newTField) => {
		tfield = newTField;
	});

	export let data_icon: icon_data;
	export let data_eraser: eraser_data;

	let floatingIcon: IconLayerIcon | null = null;
	let draggedIcon: IconLayerIcon | null = null;

	let iconId: number = 0;
	icons.forEach((i) => (iconId = Math.max(iconId, i.id)));
	iconId++;

	$: {
		// Ideally, this would only trigger on a load. It can trigger on any update for now though...
		icons.forEach((i) => (iconId = Math.max(iconId, i.id)));
		iconId++;

		if (floatingIcon) floatingIcon.scale = getIconScale();
	}

	let areIconsInteractive = false
	$: {
		selectedTool = selectedTool
		data_eraser = data_eraser
		data_icon = data_icon

		areIconsInteractive = (selectedTool == 'eraser' && !data_eraser.ignoreIcons) || (selectedTool == 'icon' && data_icon.usingEraser)
	}

	function getIconScale() {
		
		let icon_texture = get_icon_texture(data_icon.texId)
		
		let icon_texture_width = 100
		let icon_texture_height = 100

		let scale: number;
		if (tfield.hexWidth < tfield.hexHeight) {
			scale = (tfield.hexWidth * (data_icon.pHex / 100)) / icon_texture_width;
		} else {
			scale = (tfield.hexHeight * (data_icon.pHex / 100)) / icon_texture_height;
		}

		return scale;
	}

	export function newIcon() {
		let iconX = store_panning.curWorldX();
		let iconY = store_panning.curWorldY();

		if (data_icon.snapToHex) {
			let clickedHexCoords = coords_worldToCube(
				store_panning.curWorldX(),
				store_panning.curWorldY(),
				tfield.orientation,
				tfield.hexWidth,
				tfield.hexHeight
			);
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
		if (data_icon.dragMode) return;

		newIcon();
		//createFloatingIcon();
	}

	export function pointerup() {
		draggedIcon = null;
		if (data_icon.usingEraser) return;

		//newIcon();
		//destroyFloatingIcon();
	}

	export function pointermove() {
		if (floatingIcon) updateFloatingIcon();
		if (draggedIcon) updateDraggedIcon();

		cursorOnLayer = true;

	}

	let cursorOnLayer: boolean = false;
	export function pointerout(e: PointerEvent) {
		cursorOnLayer = false;
		spr_floating_icon.visible = false; // Not too happy about this but it's fine
	}


	// Floating icons have a few bugs / polish requried:
	// - Icon appears weirdly when icon layer is switched too, will need to update when layer is switched to
	function createFloatingIcon() {
		let iconX = store_panning.curWorldX();
		let iconY = store_panning.curWorldY();

		if (data_icon.snapToHex) {
			let mouseHexCoords = coords_worldToCube(
				store_panning.curWorldX(),
				store_panning.curWorldY(),
				tfield.orientation,
				tfield.hexWidth,
				tfield.hexHeight
			);
			let iconCoords = coords_cubeToWorld(
				mouseHexCoords.q,
				mouseHexCoords.r,
				mouseHexCoords.s,
				tfield.orientation,
				tfield.hexWidth,
				tfield.hexHeight
			);

			iconX = iconCoords.x;
			iconY = iconCoords.y;
		}

		floatingIcon = { x: iconX, y: iconY, color: data_icon.color, scale: getIconScale(), id: iconId, texId: data_icon.texId };
	}

	function updateFloatingIcon() {
		if (data_icon.snapToHex) {
			let mouseHexCoords = coords_worldToCube(
				store_panning.curWorldX(),
				store_panning.curWorldY(),
				tfield.orientation,
				tfield.hexWidth,
				tfield.hexHeight
			);
			let iconCoords = coords_cubeToWorld(
				mouseHexCoords.q,
				mouseHexCoords.r,
				mouseHexCoords.s,
				tfield.orientation,
				tfield.hexWidth,
				tfield.hexHeight
			);

			floatingIcon.x = iconCoords.x;
			floatingIcon.y = iconCoords.y;
		} else {
			floatingIcon.x = store_panning.curWorldX();
			floatingIcon.y = store_panning.curWorldY();
		}

		floatingIcon.color = data_icon.color
		floatingIcon.texId = data_icon.texId
	}

	export function moveAllIcons(xMod: number, yMod: number) {
		icons.forEach((icon) => {
			icon.x += xMod;
			icon.y += yMod;
		});

		icons = icons;
	}

	let oldHexWidth: number;
	let oldHexHeight: number;
	// This is called during layer set up when maps are loaded, or when hex fields are focused on.
	export function saveOldHexMeasurements(hexWidth: number, hexHeight: number) {
		oldHexWidth = hexWidth;
		oldHexHeight = hexHeight;
	}

	export function retainIconPositionOnHexResize(newHexWidth: number, newHexHeight: number) {
		// Find proprtional horizontal and vertical distance from center of nearest hex, and retain the position with the new width and height

		icons.forEach((icon: IconLayerIcon) => {
			let closestHexCubeCoords = coords_worldToCube(icon.x, icon.y, tfield.orientation, oldHexWidth, oldHexHeight);
			let closestHexPos = coords_cubeToWorld(
				closestHexCubeCoords.q,
				closestHexCubeCoords.r,
				closestHexCubeCoords.s,
				tfield.orientation,
				oldHexWidth,
				oldHexHeight
			);

			let distanceFromHexLeft = oldHexWidth / 2 + icon.x - closestHexPos.x;
			let distanceFromHexTop = oldHexHeight / 2 + icon.y - closestHexPos.y;

			let proportionalHorizontalDistance = distanceFromHexLeft / oldHexWidth;
			let proportionalVerticalDistance = distanceFromHexTop / oldHexHeight;

			let closestHexPosNew = coords_cubeToWorld(
				closestHexCubeCoords.q,
				closestHexCubeCoords.r,
				closestHexCubeCoords.s,
				tfield.orientation,
				newHexWidth,
				newHexHeight
			);

			icon.x = closestHexPosNew.x - newHexWidth / 2 + newHexWidth * proportionalHorizontalDistance;
			icon.y = closestHexPosNew.y - newHexHeight / 2 + newHexHeight * proportionalVerticalDistance;
		});

		icons = icons;

		oldHexWidth = newHexWidth;
		oldHexHeight = newHexHeight;
	}

	export function retainIconPositionOnOrientationChange(newOrientation: hexOrientation) {
		switch (tfield.mapShape) {
			case map_shape.SQUARE:
				square_retainIconPositionOnOrientationChange(newOrientation);
				break;

			case map_shape.FLOWER:
				flower_retainIconPositionOnOrientationChange(newOrientation);
				break;
		}
	}

	function square_retainIconPositionOnOrientationChange(newOrientation: hexOrientation) {
		// Only really works on square maps afaik
		// Because it relies on row/col coords

		icons.forEach((icon: IconLayerIcon) => {
			let oldOrientation: hexOrientation = newOrientation == 'flatTop' ? 'pointyTop' : 'flatTop';

			// Find the center coordinates of the hex the icon wants to stay in
			let oldClosestHexCubeCoords = coords_worldToCube(icon.x, icon.y, oldOrientation, oldHexWidth, oldHexHeight);
			let oldClosestHexPos = coords_cubeToWorld(
				oldClosestHexCubeCoords.q,
				oldClosestHexCubeCoords.r,
				oldClosestHexCubeCoords.s,
				oldOrientation,
				oldHexWidth,
				oldHexHeight
			);

			let distanceFromHexLeft = oldHexWidth / 2 + icon.x - oldClosestHexPos.x;
			let distanceFromHexTop = oldHexHeight / 2 + icon.y - oldClosestHexPos.y;

			// How far left and down were we in the old hex?
			let proportionalHorizontalDistance = distanceFromHexLeft / oldHexWidth;
			let proportionalVerticalDistance = distanceFromHexTop / oldHexHeight;

			// Find the row / col of the old hex
			let conservedClosestHexRowCol =
				oldOrientation == 'flatTop'
					? coords_cubeToq(tfield.raised, oldClosestHexCubeCoords.q, oldClosestHexCubeCoords.r, oldClosestHexCubeCoords.s)
					: coords_cubeTor(tfield.raised, oldClosestHexCubeCoords.q, oldClosestHexCubeCoords.r, oldClosestHexCubeCoords.s);

			// Find the hex position of the hex at the same row/col, but opposite orientation
			let newHexCubeCoords =
				tfield.orientation == 'flatTop'
					? coords_qToCube(tfield.raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row)
					: coords_rToCube(tfield.raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row);

			// Find X and Y world position of new hex
			let newHexPos = coords_cubeToWorld(
				newHexCubeCoords.q,
				newHexCubeCoords.r,
				newHexCubeCoords.s,
				tfield.orientation,
				tfield.hexWidth,
				tfield.hexHeight
			);

			// Adjust icon position to be the same amount left and down proportional to hex width and height as it was before the transformation
			icon.x = newHexPos.x - tfield.hexWidth / 2 + tfield.hexWidth * proportionalHorizontalDistance;
			icon.y = newHexPos.y - tfield.hexHeight / 2 + tfield.hexHeight * proportionalVerticalDistance;
		});

		icons = icons;

		oldHexWidth = tfield.hexWidth;
		oldHexHeight = tfield.hexHeight;
	}

	function flower_retainIconPositionOnOrientationChange(newOrientation: hexOrientation) {
		// Find the current
	}

	export function handleKeyboardShortcut(shortcutData: shortcut_data) {
		switch (shortcutData.function) {
			case 'toggleSnap': {
				data_icon.snapToHex = !data_icon.snapToHex;
				break;
			}

			case 'toggleEraser': {
				data_icon.usingEraser = !data_icon.usingEraser;
				break;
			}

			// Drag mode handled by key up and key down
		}
	}

	export function keyup(e: KeyboardEvent) {
		switch (e.key) {
			case 'Shift': 
				data_icon.usingEraser = false;
				break;

			case 'Control':
				data_icon.dragMode = false;
				break;

		}
	}

	export function keydown(e: KeyboardEvent) {
		switch (e.key) {
			case "Shift": 
				data_icon.usingEraser = true;
				break;

			case 'Control':
				data_icon.dragMode = true;
				break;


		}
	}

	function shouldEraseIcons(): boolean {
		return (selectedTool == 'eraser' && !data_eraser.ignoreIcons) || data_icon.usingEraser
	}

	let dragOffsetX = 0;
	let dragOffsetY = 0;
	function icon_pointerdown(e: PointerEvent, icon: IconLayerIcon) {
		if (shouldEraseIcons()) {
			deleteIcon(icon)
		} else if ( data_icon.dragMode && draggedIcon == null ) {
			draggedIcon = icon
			dragOffsetX = store_panning.curWorldX() - icon.x
			dragOffsetY = store_panning.curWorldY() - icon.y
		}
	}

	function icon_pointerover(e: CustomEvent<PointerEvent>, icon: IconLayerIcon) {

		if (controls.mouseDown[0] && shouldEraseIcons()) deleteIcon(icon)
	}

	function updateDraggedIcon() {
		if (data_icon.snapToHex) {
			let mouseHexCoords = coords_worldToCube(
				store_panning.curWorldX(),
				store_panning.curWorldY(),
				tfield.orientation,
				tfield.hexWidth,
				tfield.hexHeight
			);
			let iconCoords = coords_cubeToWorld(
				mouseHexCoords.q,
				mouseHexCoords.r,
				mouseHexCoords.s,
				tfield.orientation,
				tfield.hexWidth,
				tfield.hexHeight
			);

			draggedIcon.x = iconCoords.x;
			draggedIcon.y = iconCoords.y;
		} else {
			draggedIcon.x = store_panning.curWorldX() - dragOffsetX
			draggedIcon.y = store_panning.curWorldY() - dragOffsetY
		}

		icons = icons

	}
	

	createFloatingIcon();

	let spr_floating_icon = new PIXI.Sprite()
	spr_floating_icon.anchor.x = 0.5
	spr_floating_icon.anchor.y = 0.5
	spr_floating_icon.alpha = 0.5

	// TODO: This could use a bit of cleanup...
	afterUpdate(() => {

		Object.keys(pixi_icons).forEach(icon_id => {
			pixi_icons[icon_id].marked_for_death = true
		})

		// Update icons to be in line with state
		icons.forEach(icon => {
			if (!pixi_icons[icon.id]) {
				// Create icon
				let new_icon = new PIXI.Sprite( get_icon_texture(icon.texId) )
				new_icon.anchor.x = 0.5
				new_icon.anchor.y = 0.5

				new_icon.on('pointerdown', (e) => { icon_pointerdown(e, icon) })
				new_icon.on('pointerover', (e) => { icon_pointerover(e, icon) })

				pixi_icons[icon.id] = new_icon
				cont_icon.addChild(new_icon)
			}


			pixi_icons[icon.id].x = icon.x
			pixi_icons[icon.id].y = icon.y
			pixi_icons[icon.id].tint = icon.color
			pixi_icons[icon.id].scale.x = icon.scale
			pixi_icons[icon.id].scale.y = icon.scale
			pixi_icons[icon.id].interactive = true // !!! TODO

			pixi_icons[icon.id].marked_for_death = false
		});

		Object.keys(pixi_icons).forEach(icon_id => {
			if (pixi_icons[icon_id].marked_for_death) {
				cont_icon.removeChild(pixi_icons[icon_id])
				delete pixi_icons[icon_id]
			}
		})		


		/* Floating Icon */
		spr_floating_icon.visible = false
		if (floatingIcon) {
			spr_floating_icon.visible = !data_icon.usingEraser && selectedTool == tools.ICON && cursorOnLayer && !data_icon.dragMode && draggedIcon == null
			spr_floating_icon.texture = get_icon_texture(floatingIcon.texId)
			spr_floating_icon.tint = floatingIcon.color

			spr_floating_icon.x = floatingIcon.x
			spr_floating_icon.y = floatingIcon.y
			spr_floating_icon.tint = floatingIcon.color
			spr_floating_icon.scale.x = floatingIcon.scale
			spr_floating_icon.scale.y = floatingIcon.scale
			//spr_floating_icon.interactive = true // !!! TODO

		}



	})

	onMount(() => {
		cont_icon.removeChildren(0)
		
		cont_icon.addChild(spr_floating_icon)

	})

</script>


<!--

{#if floatingIcon}
	<Sprite
		texture={get_icon_texture(floatingIcon.texId)}
		x={floatingIcon.x}
		y={floatingIcon.y}
		tint={data_icon.color}
		anchor={{ x: 0.5, y: 0.5 }}
		scale={{ x: floatingIcon.scale, y: floatingIcon.scale }}
		
		visible={!data_icon.usingEraser && selectedTool == tools.ICON && cursorOnLayer && !data_icon.dragMode && draggedIcon == null}
	/>
{/if}
-->


<!--
	<Container instance={cont_icon}></Container>
{#each icons as icon (icon.id)}
	<Sprite
		texture={get_icon_texture(icon.texId)}
		x={icon.x}
		y={icon.y}
		tint={icon.color}
		anchor={{ x: 0.5, y: 0.5 }}
		scale={{ x: icon.scale, y: icon.scale }}
		interactive={ true }
		on:pointerdown={(e) => {
			icon_pointerdown(e, icon);
		}}
		on:pointerover={(e) => {
			icon_pointerover(e, icon);
		}}
		
	/>
{/each}
-->
