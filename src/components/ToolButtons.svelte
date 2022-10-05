<script lang="ts">
	import type { path_data, terrain_data, icon_data } from '../types/data';
	import { tools } from '../types/toolData';

	export let data_terrain: terrain_data;
	export let data_icon: icon_data;
	export let data_path: path_data;

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
					image: "/assets/img/tools/eraser.png",
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
				image: "/assets/img/tools/eraser.png",
				obj: data_icon,
				field: "usingEraser"
			},

			{
				display: "Drag Mode",
				action: function() { data_icon.dragMode = !data_icon.dragMode },
				image: "/assets/img/tools/drag.png",
				obj: data_icon,
				field: "dragMode"
			}
		] },

		{ display: 'Path', toolCode: tools.PATH, miniButtons: [
			{
				display: "Snap Point",
				action: function() { data_path.snap = !data_path.snap },
				image: "/assets/img/tools/snap.png",
				obj: data_path,
				field: "snap"
			}
		] },
		{ display: 'Text', toolCode: tools.TEXT, miniButtons: [] },
		{ display: 'Eraser', toolCode: tools.ERASER, miniButtons: [] },
	];

	export let selectedTool: string;
	export let hexOrientation: 'flatTop' | 'pointyTop';

	export let changeTool: Function;
</script>

<main>
	{#each buttons as b}
		<div class="tool-button-container">

			<button
				class:selected={selectedTool == b.toolCode}
				on:click={() => { changeTool(b.toolCode) }}
				title={`${b.display} Tool`}
			>
				<!-- Button Image -->
				{#if b.toolCode == 'terrain'}
					<img src={`/assets/img/tools/${b.toolCode}_${hexOrientation == 'flatTop' ? 'ft' : 'pt'}.png`} alt={`${b.display} Tool`} />
				{:else}
					<img src={`/assets/img/tools/${b.toolCode}.png`} alt={`${b.display} Tool`} />
				{/if}

			</button>

			<!-- Mini Buttons -->
			
			{#if selectedTool == b.toolCode}
			<div class="mini-button-container">
				{#each b.miniButtons as mb}
						<button 
							class="mini-button"
							class:selected={ mb.obj ? mb.obj[mb.field] : false }
							on:click={mb.action}
							title={mb.display}
						>

							<img src={mb.image} alt={mb.display}>

						</button>
					{/each}
				</div>
			{/if}
			

		</div>
	{/each}
</main>

<style>
	main {
		display: grid;
		grid-template-columns: 3.2em;
		grid-template-rows: 3.2em;
		grid-auto-rows: 3.2em;
		gap: 0.7em;
	}

	main button {
		width: 100%;
		height: 100%;
	}

	button {
		display: flex;
		align-items: center;
		justify-content: center;
		transition-duration: 0.2s;
	}

	.selected {
		border-color: #8cc63f;
		outline: #8cc63f solid 1px;
		transition-duration: 0.2s;
	}

	.tool-button-container {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.mini-button-container {
		position: absolute;
		left: 100%;
		margin-left: 0.7em;
		top: 0;

		display: flex;
		flex-direction: column;
		gap: 0.7em;
	}

	.mini-button {
		width: 2.8em;
		height: 2.8em;
	}

	.mini-button img {
		width: 100%;
		height: 100%;
	}

</style>
