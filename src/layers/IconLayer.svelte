<script lang="ts">
	import type { eraser_data, icon_data } from '../types/data';
	import type { IconLayerIcon, Icon } from '../types/icon';
	import type { shortcut_data } from '../types/inputs';
	import type { pan_state } from '../types/panning';
	import type { terrain_field } from '../types/terrain';
	import type { cube_coords } from '../types/coordinates';
	import type { hex_orientation } from '../types/terrain';
	
	// Enums
	import { tools } from '../types/toolData';
	import { map_shape } from '../types/settings';
	import { store_has_unsaved_changes } from '../stores/flags';
	
	// Stores
	import * as store_panning from '../stores/panning';
	import { tfield } from '../stores/tfield';
	import { store_inputs } from '../stores/inputs';
	import { store_selected_tool } from '../stores/tools';
	import { data_icon } from '../stores/data';
	import { resize_parameters } from '../stores/resize_parameters';


	// Lib
	import {
		coords_cubeToWorld,
		coords_cubeToq,
		coords_cubeTor,
		coords_qToCube,
		coords_rToCube,
		coords_worldToCube,
	} from '../helpers/hexHelpers';
	import * as PIXI from 'pixi.js';
	import { get_icon_texture } from '../lib/texture_loader'
	import { afterUpdate, onMount } from 'svelte';
	

	export let pHex: number;

	export let icons: IconLayerIcon[] = [];
	let pixi_icons: {[key: number]: PIXI.Sprite} = {}; // keeps up to date with icons
	
	export let cont_icon: PIXI.Container;


	// seems unused - check back later?
	// let pan: pan_state;
	// store_panning.store.subscribe((newPan) => {
	// 	pan = newPan;
	// });
	
	let selectedTool: tools;
	store_selected_tool.subscribe(n => selectedTool = n);

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

	$: {
		selectedTool = selectedTool
		data_eraser = data_eraser
	}

	function getIconScale() {
		
		let icon_texture = get_icon_texture($data_icon.texId)
		
		let icon_texture_width = 100
		let icon_texture_height = 100

		let scale: number;
		if ($tfield.hexWidth < $tfield.hexHeight) {
			scale = ($tfield.hexWidth * (pHex / 100)) / icon_texture_width;
		} else {
			scale = ($tfield.hexHeight * (pHex / 100)) / icon_texture_height;
		}

		return scale;
	}

	export function newIcon() {
		let iconX = store_panning.curWorldX();
		let iconY = store_panning.curWorldY();

		if ($data_icon.snapToHex) {
			let clickedHexCoords = coords_worldToCube(
				store_panning.curWorldX(),
				store_panning.curWorldY(),
				$tfield.orientation,
				$tfield.hexWidth,
				$tfield.hexHeight,
				$tfield.grid.gap,
			);
			let iconCoords = coords_cubeToWorld(
				clickedHexCoords.q,
				clickedHexCoords.r,
				clickedHexCoords.s,
				$tfield.orientation,
				$tfield.hexWidth,
				$tfield.hexHeight,
				$tfield.grid.gap,
			);
			iconX = iconCoords.x;
			iconY = iconCoords.y;
		}

		icons.push({ x: iconX, y: iconY, color: $data_icon.color, scale: getIconScale(), pHex: pHex, id: iconId, texId: $data_icon.texId });
		iconId++;
		icons = icons;

		$store_has_unsaved_changes = true;
	}

	export function place_icon(icon: Icon, position: cube_coords) {
		let icon_pos = coords_cubeToWorld(position.q, position.r, position.s, $tfield.orientation, $tfield.hexWidth, $tfield.hexHeight, $tfield.grid.gap)

		icons.push({ x: icon_pos.x, y: icon_pos.y, color: icon.color, scale: getIconScale(), id: iconId, texId: icon.texId });
		iconId++;
		icons = icons;

		$store_has_unsaved_changes = true;
	}

	function deleteIcon(icon: IconLayerIcon) {
		let iconIndex = icons.indexOf(icon);
		icons.splice(iconIndex, 1);
		icons = icons;

		$store_has_unsaved_changes = true;
	}

	export function deleteIcons() {
		icons = [];

		$store_has_unsaved_changes = true;
	}

	export function pointerdown() {
		if ($data_icon.usingEraser) return;
		if ($data_icon.dragMode) return;
		if ($data_icon.usingEyedropper) return;

		newIcon();
		//createFloatingIcon();
	}

	export function pointerup() {
		draggedIcon = null;
		//if ($data_icon.usingEraser) return;

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

		if ($data_icon.snapToHex) {
			let mouseHexCoords = coords_worldToCube(
				store_panning.curWorldX(),
				store_panning.curWorldY(),
				$tfield.orientation,
				$tfield.hexWidth,
				$tfield.hexHeight,
				$tfield.grid.gap,
			);
			let iconCoords = coords_cubeToWorld(
				mouseHexCoords.q,
				mouseHexCoords.r,
				mouseHexCoords.s,
				$tfield.orientation,
				$tfield.hexWidth,
				$tfield.hexHeight,
				$tfield.grid.gap,
			);

			iconX = iconCoords.x;
			iconY = iconCoords.y;
		}

		floatingIcon = { x: iconX, y: iconY, color: $data_icon.color, scale: getIconScale(), id: iconId, texId: $data_icon.texId };
	}

	function updateFloatingIcon() {
		if ($data_icon.snapToHex) {
			let mouseHexCoords = coords_worldToCube(
				store_panning.curWorldX(),
				store_panning.curWorldY(),
				$tfield.orientation,
				$tfield.hexWidth,
				$tfield.hexHeight,
				$tfield.grid.gap,
			);
			let iconCoords = coords_cubeToWorld(
				mouseHexCoords.q,
				mouseHexCoords.r,
				mouseHexCoords.s,
				$tfield.orientation,
				$tfield.hexWidth,
				$tfield.hexHeight,
				$tfield.grid.gap,
			);

			floatingIcon.x = iconCoords.x;
			floatingIcon.y = iconCoords.y;
		} else {
			floatingIcon.x = store_panning.curWorldX();
			floatingIcon.y = store_panning.curWorldY();
		}

		floatingIcon.color = $data_icon.color
		floatingIcon.texId = $data_icon.texId
	}

	export function moveAllIcons(xMod: number, yMod: number) {
		icons.forEach((icon) => {
			icon.x += xMod;
			icon.y += yMod;
		});

		icons = icons;
		
	}

	// This is called during layer set up when maps are loaded, or when hex fields are focused on.

	export function retain_icon_position_on_hex_resize(newHexWidth: number, newHexHeight: number, newGap: number) {
		// Find proprtional horizontal and vertical distance from center of nearest hex, and retain the position with the new width and height
		icons.forEach((icon: IconLayerIcon) => {
			let closestHexCubeCoords = coords_worldToCube(icon.x, icon.y, $tfield.orientation, $resize_parameters.old_hex_width, $resize_parameters.old_hex_height, $resize_parameters.old_gap );
			let closestHexPos = coords_cubeToWorld(
				closestHexCubeCoords.q,
				closestHexCubeCoords.r,
				closestHexCubeCoords.s,
				$tfield.orientation,
				$resize_parameters.old_hex_width,
				$resize_parameters.old_hex_height,
				$resize_parameters.old_gap,
			);

			let vector_from_hex_center = {
				x: closestHexPos.x - icon.x,
				y: closestHexPos.y - icon.y
			}

			let hex_horiz_scale = newHexWidth / $resize_parameters.old_hex_width;
			let hex_vert_scale = newHexHeight / $resize_parameters.old_hex_height;

			let closestHexPosNew = coords_cubeToWorld(
				closestHexCubeCoords.q,
				closestHexCubeCoords.r,
				closestHexCubeCoords.s,
				$tfield.orientation,
				newHexWidth,
				newHexHeight,
				newGap
			);

			icon.x = closestHexPosNew.x - vector_from_hex_center.x*hex_horiz_scale;
			icon.y = closestHexPosNew.y - vector_from_hex_center.y*hex_vert_scale;
		});

		icons = icons;

	}

	export function retainIconPositionOnOrientationChange(newOrientation: hex_orientation) {
		switch ($tfield.mapShape) {
			case map_shape.SQUARE:
				square_retainIconPositionOnOrientationChange(newOrientation);
				break;

			case map_shape.FLOWER:
				flower_retainIconPositionOnOrientationChange(newOrientation);
				break;
		}
	}

	function square_retainIconPositionOnOrientationChange(newOrientation: hex_orientation) {
		// Only really works on square maps afaik
		// Because it relies on row/col coords

		icons.forEach((icon: IconLayerIcon) => {
			let oldOrientation: hex_orientation = newOrientation == 'flatTop' ? 'pointyTop' : 'flatTop';

			// Find the center coordinates of the hex the icon wants to stay in
			let oldClosestHexCubeCoords = coords_worldToCube(icon.x, icon.y, oldOrientation, oldHexWidth, oldHexHeight, $tfield.grid.gap);
			let oldClosestHexPos = coords_cubeToWorld(
				oldClosestHexCubeCoords.q,
				oldClosestHexCubeCoords.r,
				oldClosestHexCubeCoords.s,
				oldOrientation,
				oldHexWidth,
				oldHexHeight,
				$tfield.grid.gap,
			);

			let distanceFromHexLeft = oldHexWidth / 2 + icon.x - oldClosestHexPos.x;
			let distanceFromHexTop = oldHexHeight / 2 + icon.y - oldClosestHexPos.y;

			// How far left and down were we in the old hex?
			let proportionalHorizontalDistance = distanceFromHexLeft / oldHexWidth;
			let proportionalVerticalDistance = distanceFromHexTop / oldHexHeight;

			// Find the row / col of the old hex
			let conservedClosestHexRowCol =
				oldOrientation == 'flatTop'
					? coords_cubeToq($tfield.raised, oldClosestHexCubeCoords.q, oldClosestHexCubeCoords.r, oldClosestHexCubeCoords.s)
					: coords_cubeTor($tfield.raised, oldClosestHexCubeCoords.q, oldClosestHexCubeCoords.r, oldClosestHexCubeCoords.s);

			// Find the hex position of the hex at the same row/col, but opposite orientation
			let newHexCubeCoords =
				$tfield.orientation == 'flatTop'
					? coords_qToCube($tfield.raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row)
					: coords_rToCube($tfield.raised, conservedClosestHexRowCol.col, conservedClosestHexRowCol.row);

			// Find X and Y world position of new hex
			let newHexPos = coords_cubeToWorld(
				newHexCubeCoords.q,
				newHexCubeCoords.r,
				newHexCubeCoords.s,
				$tfield.orientation,
				$tfield.hexWidth,
				$tfield.hexHeight,
				$tfield.grid.gap,
			);

			// Adjust icon position to be the same amount left and down proportional to hex width and height as it was before the transformation
			icon.x = newHexPos.x - $tfield.hexWidth / 2 + $tfield.hexWidth * proportionalHorizontalDistance;
			icon.y = newHexPos.y - $tfield.hexHeight / 2 + $tfield.hexHeight * proportionalVerticalDistance;
		});

		icons = icons;

		oldHexWidth = $tfield.hexWidth;
		oldHexHeight = $tfield.hexHeight;
	}

	function flower_retainIconPositionOnOrientationChange(newOrientation: hex_orientation) {
		// Find the current
	}

	export function handleKeyboardShortcut(shortcutData: shortcut_data) {
		switch (shortcutData.function) {
			case 'toggleSnap': {
				$data_icon.snapToHex = !$data_icon.snapToHex;
				pointermove()
				break;
			}

			case 'toggleEraser': {
				$data_icon.usingEraser = !$data_icon.usingEraser;
				break;
			}

			// Drag mode handled by key up and key down
		}
	}

	export function keyup(e: KeyboardEvent) {
		switch (e.key) {
			case 'Shift': 
				$data_icon.usingEraser = false;
				break;

			case 'Control':
				$data_icon.dragMode = false;
				break;
			
			case 'Alt':
				$data_icon.usingEyedropper = false;
				break

		}
	}

	export function keydown(e: KeyboardEvent) {
		switch (e.key) {
			case "Shift": 
				$data_icon.usingEraser = true;
				break;

			case 'Control':
				$data_icon.dragMode = true;
				break;

			case 'Alt':
				$data_icon.usingEyedropper = true;
				break


		}
	}

	function shouldEraseIcons(): boolean {
		return (selectedTool == 'eraser' && !data_eraser.ignoreIcons) || $data_icon.usingEraser
	}

	let dragOffsetX = 0;
	let dragOffsetY = 0;
	function icon_pointerdown(e: PointerEvent, icon: IconLayerIcon) {
		if (shouldEraseIcons()) {
			deleteIcon(icon)
			$store_has_unsaved_changes = true;

		} else if ( $data_icon.dragMode && draggedIcon == null ) {
			draggedIcon = icon
			dragOffsetX = store_panning.curWorldX() - icon.x
			dragOffsetY = store_panning.curWorldY() - icon.y
		
		} else if ($data_icon.usingEyedropper) {
			
			pHex = icon.pHex
			$data_icon.color = icon.color
			$data_icon.texId = icon.texId

			updateFloatingIcon();

		}
	}

	function icon_pointerover(e: CustomEvent<PointerEvent>, icon: IconLayerIcon) {

		if ($store_inputs.mouseDown[0] && shouldEraseIcons()) deleteIcon(icon)
	}

	function updateDraggedIcon() {
		if ($data_icon.snapToHex) {
			let mouseHexCoords = coords_worldToCube(
				store_panning.curWorldX(),
				store_panning.curWorldY(),
				$tfield.orientation,
				$tfield.hexWidth,
				$tfield.hexHeight,
				$tfield.grid.gap
			);
			let iconCoords = coords_cubeToWorld(
				mouseHexCoords.q,
				mouseHexCoords.r,
				mouseHexCoords.s,
				$tfield.orientation,
				$tfield.hexWidth,
				$tfield.hexHeight,
				$tfield.grid.gap
			);

			draggedIcon.x = iconCoords.x;
			draggedIcon.y = iconCoords.y;
		} else {
			draggedIcon.x = store_panning.curWorldX() - dragOffsetX
			draggedIcon.y = store_panning.curWorldY() - dragOffsetY
		}

		icons = icons
		$store_has_unsaved_changes = true;

	}
	

	createFloatingIcon();

	let spr_floating_icon = new PIXI.Sprite()
	spr_floating_icon.anchor.x = 0.5
	spr_floating_icon.anchor.y = 0.5
	spr_floating_icon.alpha = 0.5

	// TODO: This could use a bit of cleanup...
	afterUpdate(() => {
		let marked_for_saving: number[] = []

		// Update icons to be in line with state
		icons.forEach(icon => {
			// if the icon doesn't exist
			if (!pixi_icons[icon.id]) {
				// Create icon
				let new_icon = new PIXI.Sprite( get_icon_texture(icon.texId) )
				new_icon.anchor.x = 0.5
				new_icon.anchor.y = 0.5
				// register icon events
				new_icon.on('pointerdown', (e) => { icon_pointerdown(e, icon) })
				new_icon.on('pointerover', (e) => { icon_pointerover(e, icon) })
				// add the icon
				pixi_icons[icon.id] = new_icon
				cont_icon.addChild(new_icon)
			}

			pixi_icons[icon.id].x = icon.x
			pixi_icons[icon.id].y = icon.y
			pixi_icons[icon.id].tint = icon.color
			pixi_icons[icon.id].scale.x = icon.scale
			pixi_icons[icon.id].scale.y = icon.scale
			pixi_icons[icon.id].eventMode = 'static'

			marked_for_saving.push(icon.id)
		});

		Object.keys(pixi_icons).forEach(icon_id => {
			if (!marked_for_saving.includes(+icon_id)) {
				// this can be slow when using the generator
				cont_icon.removeChild(pixi_icons[icon_id])
				// this is not the problem
				delete pixi_icons[icon_id]
			}
		})

		/* Floating Icon */
		spr_floating_icon.visible = false
		if (floatingIcon) {
			spr_floating_icon.visible = !$data_icon.usingEraser && selectedTool == tools.ICON && cursorOnLayer && !$data_icon.dragMode && draggedIcon == null && !$data_icon.usingEyedropper
			spr_floating_icon.texture = get_icon_texture(floatingIcon.texId)
			spr_floating_icon.tint = floatingIcon.color

			spr_floating_icon.x = floatingIcon.x
			spr_floating_icon.y = floatingIcon.y
			spr_floating_icon.tint = floatingIcon.color
			spr_floating_icon.scale.x = floatingIcon.scale
			spr_floating_icon.scale.y = floatingIcon.scale
			// spr_floating_icon.eventMode = 'static' // !!! TODO

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
		tint={$data_icon.color}
		anchor={{ x: 0.5, y: 0.5 }}
		scale={{ x: floatingIcon.scale, y: floatingIcon.scale }}
		
		visible={!$data_icon.usingEraser && selectedTool == tools.ICON && cursorOnLayer && !$data_icon.dragMode && draggedIcon == null}
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
