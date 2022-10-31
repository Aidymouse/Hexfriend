<script lang="ts">
    /* --- IMPORTS --- */
    // Import Types
    import type { PageData } from './$types';
    import type { terrain_data, icon_data, path_data, text_data, coordinates_data, eraser_data } from '$lib/types/data';
	import type { save_data } from '$lib/types/savedata';
	// Enums
    import { tools } from '$lib/types/tool_data';
	import { coord_system } from '$lib/types/coordinates';
    
    // Import Components
    import ToolButtons from '$lib/components/ToolButtons.svelte';

    // Import Lib
    import * as PIXI from 'pixi.js';
    
    // App Start
    export let data: PageData;

    let loaded_save: save_data = data.loaded_save
    let loaded_save_id = data.loaded_save_id

    let tfield = loaded_save.TerrainField

    let selected_tool = tools.TERRAIN;

    /* --- DATA --- */
    let data_terrain: terrain_data = {
		//bgColor: null,
		//symbol: null,

		tile: undefined,

		usingEyedropper: false,
		usingPaintbucket: false,
		usingEraser: false,
		renderOpacity: 1,
	};

	let data_icon: icon_data = {
		color: 0x000000,
		texId: undefined,
		pHex: 80,
		snapToHex: true,
		usingEraser: false,
		dragMode: false
	};

	let data_path: path_data = {
		style: { color: 0, width: 3, cap: PIXI.LINE_CAP.ROUND, join: PIXI.LINE_JOIN.ROUND },
		hoveredPath: undefined,
		selectedPath: undefined,
		dontSelectPaths: false,
		snap: false,
		contextPathId: undefined,
	};

	let data_text: text_data = {
		style: {
			fontFamily: 'Segoe UI',
			fill: '#000000',
			fontSize: 25,
			miterLimit: 2,
			strokeThickness: 0,
			stroke: '#f2f2f2',
			align: 'left',
			fontStyle: 'normal',
			fontWeight: 'normal',
		},
		selectedText: null,
		editorRef: null,
		usingTextTool: false,
		contextStyleId: null,
	};
	$: data_text.usingTextTool = selected_tool == tools.TEXT;

	let data_coordinates: coordinates_data = {
		shown: true,
		style: { fill: 0x000000, fontSize: 10 },
		system: coord_system.ROWCOL,
		seperator: '.',
		gap: 4,
	};

	let data_eraser: eraser_data = {
		ignoreTerrain: false,
		ignoreIcons: false,
	};

</script>

<main>
    <!-- Idk why we need to wait but it breaks if we dont :/ -->
    {#await import('$lib/components/PrimaryRenderApp.svelte')}
        <p>Pizza</p>
    {:then app}
        <svelte:component this={app.default}>

        </svelte:component>

        <ToolButtons bind:selected_tool bind:hex_orientation={tfield.orientation} bind:data_terrain bind:data_icon bind:data_path />
    {/await}
</main>


