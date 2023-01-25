<script lang="ts">
	import { afterUpdate } from 'svelte';
	import type { path_data, terrain_data, icon_data, overlay_data } from '../types/data';
	import { tools } from '../types/toolData';

	export let data_terrain: terrain_data;
	export let data_icon: icon_data;
	export let data_path: path_data;
	export let data_overlay: overlay_data;

	$: {
		data_terrain=data_terrain
		data_icon=data_icon
		data_path=data_path

		buttons=buttons
	}

	let buttons = [
		{ 
			display: 'Terrain',
			toolCode: tools.TERRAIN,

			miniButtons: [
				
				{
					display: "Hex Eraser",
					action: function() { data_terrain.usingEraser = !data_terrain.usingEraser },
					image: "/assets/img/tools/mini_eraser.png",
					obj: data_terrain,
					field: "usingEraser"
				},

				{
					display: "Hex Eyedropper",
					action: function() { data_terrain.usingEyedropper = !data_terrain.usingEyedropper },
					image: "/assets/img/tools/eyedropper.png",
					obj: data_terrain,
					field: "usingEyedropper"
				},


				{
					display: "Hex Paintbucket",
					action: function() { data_terrain.usingPaintbucket = !data_terrain.usingPaintbucket },
					image: "/assets/img/tools/paintbucket.png",
					obj: data_terrain,
					field: "usingPaintbucket"
				},
			]
		},


		{ display: 'Icon', toolCode: tools.ICON, miniButtons: [
			{
				display: "Icon Eraser",
				action: function() { data_icon.usingEraser = !data_icon.usingEraser },
				image: "/assets/img/tools/mini_eraser.png",
				obj: data_icon,
				field: "usingEraser"
			},

			{
				display: "Drag Icons",
				action: function() { data_icon.dragMode = !data_icon.dragMode },
				image: "/assets/img/tools/drag.png",
				obj: data_icon,
				field: "dragMode"
			},

			{
				display: "Snap Icon",
				action: function() { data_icon.snapToHex = !data_icon.snapToHex },
				image: "/assets/img/tools/snap_icon.png",
				obj: data_icon,
				field: "snapToHex"
			}
		] },

		{ display: 'Path', toolCode: tools.PATH, miniButtons: [
			{
				display: "Snap Path Point",
				action: function() { data_path.snap = !data_path.snap },
				image: "/assets/img/tools/snap_path.png",
				obj: data_path,
				field: "snap"
			}
		] },
		{ display: 'Text', toolCode: tools.TEXT, miniButtons: [] },
		{ display: 'Eraser', toolCode: tools.ERASER, miniButtons: [] },

		{display: 'Overlay', toolCode: tools.OVERLAY, miniButtons: []},
	];

	export let selectedTool: string;
	export let hexOrientation: 'flatTop' | 'pointyTop';

	export let changeTool: Function;

	afterUpdate(() => {

		let el_selected_button = document.getElementById(`tool-button-${selectedTool}`)

		document.getElementById("highlighter").style.left = el_selected_button.offsetLeft + "px";

	})

</script>

<main>
	<span id="highlighter"></span>

	{#each buttons as b}


	<button
		class:selected={selectedTool == b.toolCode}
		on:click={() => { changeTool(b.toolCode) }}
		title={`${b.display} Tool`}
		class="tool-button"
		class:hidden = {b.toolCode == tools.OVERLAY && data_overlay.base64 == ""}
		id={`tool-button-${b.toolCode}`}
	>
		<!-- Button Image -->
		<span class="tool-img-wrapper" class:rotated90={ (b.toolCode == tools.TERRAIN || b.toolCode == tools.OVERLAY) && hexOrientation == "pointyTop"}>
			<img src={`/assets/img/tools/${b.toolCode}.png`} alt={`${b.display} Tool`} />
			<img src={`/assets/img/tools/w_${b.toolCode}.png`} alt={`${b.display} Tool`} class:see-through={selectedTool != b.toolCode}/>
		</span>
	</button>

			<!-- Mini Buttons 
			{#if selectedTool == b.toolCode && b.miniButtons.length > 0}
			<div class="mini-button-container">
				{#each b.miniButtons as mb}
						<button 
							class="mini-button"
							class:selected={ mb.obj ? mb.obj[mb.field] : false }
							on:click={mb.action}
							title={mb.display}
						>

							<img draggable={false} src={mb.image} alt={mb.display}>
							
						</button>
					{/each}
				</div>
			{/if}
			-->
			

	{/each}

	
</main>

<style>

	main {
		display: flex;
		height: 2.5em;
		padding: 0.5em;

		background-color: var(--primary-bg);

		border-radius: 1.75em;
		gap: 0.5em;
	}


	.tool-button {

		height: 100%;
		aspect-ratio: 1/1;

		position: relative;

		border: none;
		background-color: transparent;

		outline: none;
		cursor: pointer;
	}


	.tool-button:hover {
		background-color: rgba;
	}

	.tool-img-wrapper {
		position: relative;
		width: 100%;
		height: 100%;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.tool-img-wrapper img {
		position: absolute;
		height: 96%;
		transition-duration: 0.2s;
	}

	.tool-img-wrapper img.see-through {
		opacity: 0;
		transition-duration: 0.2s;
	}

	.rotated90 {
		rotate: 90deg;
	}


	#highlighter {
		height: 2.5em;
		aspect-ratio: 1/1;

		background-color: var(--hexfriend-green);
		position: absolute;
		border-radius: 50%;

		transition-duration: 0.2s;
		transition-timing-function: cubic-bezier(0.0, 0.1, 0.265, 1.3);
	}


	.hidden {
		display: none;
	}

</style>
