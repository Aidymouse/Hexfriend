<script lang="ts">
	// TYPES
	import type { eraser_data, icon_data, overlay_data, path_data, terrain_data, text_data } from '../types/data';
	import { tools } from '../types/toolData';
	
	import { data_eraser, data_overlay, data_text } from '../stores/data';
	

	interface terrain_controls {
		leftMouse: string;
	}

	interface icon_controls {
		leftMouse: string;
	}

	interface path_controls {
		leftMouse: string;
	}
	
	interface text_controls {
		leftMouse: string;
		clickAndDrag: string;
	}
	
	// STORES
	import { store_selected_tool } from '../stores/tools'
	import { data_path, data_icon, data_terrain } from '../stores/data';
	
	// COMPONENTS
	import Tooltip from './Tooltip.svelte';

	/* Terrain */
	let c_terrain: terrain_controls = {
		leftMouse: 'Place Terrain',
	};

	data_terrain.subscribe(n => {
		c_terrain.leftMouse = "Place Terrain"
		if (n.usingEyedropper) c_terrain.leftMouse = 'Eyedrop Hex';
		else if (n.usingPaintbucket && n.usingEraser) c_terrain.leftMouse = 'Erase all similar';
		else if (n.usingPaintbucket) c_terrain.leftMouse = 'Fill with Terrain';
		else if (n.usingEraser) c_terrain.leftMouse = 'Erase Hex';
	})

	/* Icon */
	let c_icon: icon_controls = {
		leftMouse: 'Place Icon',
	};

	data_icon.subscribe( (n: icon_data) => {
		c_icon.leftMouse = "Place Icon";
		if (n.usingEraser) c_icon.leftMouse = "Erase Icon";
		if (n.dragMode) c_icon.leftMouse = "Move Icon";
		if (n.usingEyedropper) c_icon.leftMouse = "Eyedrop Icon";
	})

	/* Path */
	let c_path: path_controls = {
		leftMouse: 'Start New Path',
	};

	data_path.subscribe(n => {
		c_path.leftMouse = 'Start New Path';

		if ($data_path.selectedPath) c_path.leftMouse = 'Place Point';
		else if ($data_path.hoveredPath && !$data_path.dontSelectPaths) c_path.leftMouse = 'Select Path'; 
	})


	/* Text */
	let c_text: text_controls = {
		leftMouse: 'Place New Text',
		clickAndDrag: 'Move Text',
	};

	data_text.subscribe(n => {
		c_text.leftMouse = "Place New Text";
		if (data_text.selectedText) c_text.leftMouse = 'Deselect Text';
	})


	/* Eraser */
	let c_eraser = {
		leftMouse: 'Erase Terrain + Icons',
	};

	data_eraser.subscribe(n => {
		c_eraser.leftMouse = "Erase Terrain & Icons"

		if (!n.eraseIcons && !n.eraseTerrain) c_eraser.leftMouse = "Erase Nothing!";
		else if (!n.eraseIcons) c_eraser.leftMouse = "Erase Terrain Only";
		else if (!n.eraseTerrain) c_eraser.leftMouse = "Erase Icons Only";
	})




	/* Overlay */
	let c_overlay = {
		clickAndDrag: 'Move Overlay'
	}


</script>

<span>
	<Tooltip control={"Right Mouse"} tip={"Pan"} />
	<Tooltip control={"Scroll Mouse"} tip={"Zoom"} />
	
	{#if $store_selected_tool == tools.TERRAIN}
		<Tooltip control={"Left Mouse"} tip={c_terrain.leftMouse} />
		
	{:else if $store_selected_tool == tools.ICON}
		<Tooltip control={"Left Mouse"} tip={c_icon.leftMouse} />
		
	{:else if $store_selected_tool == tools.PATH}
		<Tooltip control={"Left Mouse"} tip={c_path.leftMouse} />
		
	{:else if $store_selected_tool == tools.TEXT}
		<Tooltip control={"Left Mouse"} tip={c_text.leftMouse} />
		<Tooltip control={"Click and Drag"} tip={c_text.clickAndDrag} />
		
	{:else if $store_selected_tool == tools.ERASER}
		<Tooltip control={"Left Mouse"} tip={c_eraser.leftMouse} />
		
	{:else if $store_selected_tool == tools.OVERLAY}
		<Tooltip control={"Click and Drag"} tip={c_overlay.clickAndDrag} />
	
	{/if}

	{#if $data_overlay.base64 != ""}
		<Tooltip control="Ctrl+Q" tip="Toggle Overlay" />
	{/if}

	<Tooltip control="Ctrl+/" tip="View Keybinds" style="margin-top: 4px;"/>

</span>

<style>

	span {
		position: absolute;
		right: 0;
		bottom: 0;

		padding: 1em;

		width: 12.5em;
		display: flex;

		align-items: flex-end;
		flex-direction: column;
	}
</style>
