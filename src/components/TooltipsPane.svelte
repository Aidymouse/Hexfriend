<script lang="ts">
	// TYPES
	import type { eraser_data, icon_data, overlay_data, path_data, terrain_data, text_data } from '../types/data';
	import { tools } from '../types/toolData';
	
	

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
	import { data_path } from '../stores/data';
	import { data_icon } from '../stores/data';
	
	// COMPONENTS
	import Tooltip from './Tooltip.svelte';


	let selectedTool: tools;
	store_selected_tool.subscribe(n => selectedTool = n)
	
	export let data_terrain: terrain_data;

	export let data_text: text_data;
	export let data_eraser: eraser_data;
	export let data_overlay: overlay_data;

	/* Terrain */
	let c_terrain: terrain_controls = {
		leftMouse: 'Place Terrain',
	};

	function setTooltips_terrain() {
		c_terrain.leftMouse = 'Place Terrain';

		if (data_terrain.usingEyedropper) {
			c_terrain.leftMouse = 'Eyedrop Hex';
		} else if (data_terrain.usingPaintbucket && data_terrain.usingEraser) {
			c_terrain.leftMouse = 'Erase all similar';
		} else if (data_terrain.usingPaintbucket) {
			c_terrain.leftMouse = 'Fill with Terrain';
		} else if (data_terrain.usingEraser) {
			c_terrain.leftMouse = 'Erase Hex';
		}
	}

	/* Icon */
	let c_icon: icon_controls = {
		leftMouse: 'Place Icon',
	};

	function setTooltips_icon() {
		c_icon.leftMouse = 'Place Icon';

		if ($data_icon.usingEraser) {
			c_icon.leftMouse = 'Erase Icon';
		}
	}

	/* Path */
	let c_path: path_controls = {
		leftMouse: 'Place Icon',
	};

	function setTooltips_path() {
		c_path.leftMouse = 'Start New Path';

		if ($data_path.selectedPath) {
			c_path.leftMouse = 'Place Point';
		} else if ($data_path.hoveredPath && !$data_path.dontSelectPaths) {
			c_path.leftMouse = 'Select Path';
		}
	}

	/* Text */
	let c_text: text_controls = {
		leftMouse: 'Place New Text',
		clickAndDrag: 'Move Text',
	};

	function setTooltips_text() {
		c_text.leftMouse = 'Place New Text';

		if (data_text.selectedText) {
			c_text.leftMouse = 'Deselect Text';
		}
	}

	/* Eraser */
	let c_eraser = {
		leftMouse: 'Erase Terrain + Icons',
	};

	function setTooltips_eraser() {
		c_eraser.leftMouse = 'Erase Terrain + Icons';

		if (data_eraser.ignoreIcons && data_eraser.ignoreTerrain) c_eraser.leftMouse = 'Erase Nothing!';
		else if (data_eraser.ignoreIcons) c_eraser.leftMouse = 'Erase Only Terrain';
		else if (data_eraser.ignoreTerrain) c_eraser.leftMouse = 'Erase Only Icons';
	}



	/* Overlay */
	let c_overlay = {
		clickAndDrag: 'Move Overlay'
	}

	function setTooltips_overlay() {
		c_overlay.clickAndDrag = data_overlay.shown ? "Move Overlay" : ""
	}

	$: {
		data_terrain = data_terrain;
		data_text = data_text;
		data_eraser = data_eraser;
		data_overlay = data_overlay;
		setTooltips();
	}

	$: {
		setTooltips();
	}

	function setTooltips() {
		switch (selectedTool) {
			case tools.TERRAIN:
				setTooltips_terrain();
				break;

			case tools.ICON:
				setTooltips_icon();
				break;

			case tools.PATH:
				setTooltips_path();
				break;

			case tools.TEXT:
				setTooltips_text();
				break;

			case tools.ERASER:
				setTooltips_eraser();
				break;

			case tools.OVERLAY:
				setTooltips_overlay();
				break;
		}
	}
</script>

<span>
	<Tooltip control={"Right Mouse"} tip={"Pan"} />
	<Tooltip control={"Scroll"} tip={"Zoom"} />
	
	{#if selectedTool == tools.TERRAIN}
		<Tooltip control={"Left Mouse"} tip={c_terrain.leftMouse} />
		
	{:else if selectedTool == tools.ICON}
		<Tooltip control={"Left Mouse"} tip={c_icon.leftMouse} />
		
	{:else if selectedTool == tools.PATH}
		<Tooltip control={"Left Mouse"} tip={c_path.leftMouse} />
		
	{:else if selectedTool == tools.TEXT}
		<Tooltip control={"Left Mouse"} tip={c_text.leftMouse} />
		<Tooltip control={"Click and Drag"} tip={c_text.clickAndDrag} />
		
	{:else if selectedTool == tools.ERASER}
		<Tooltip control={"Left Mouse"} tip={c_text.leftMouse} />
		
	{:else if selectedTool == tools.OVERLAY}
		<Tooltip control={"Click and Drag"} tip={c_overlay.clickAndDrag} />
	
	{/if}

	{#if data_overlay.base64 != ""}
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
