<script lang="ts">
	import Checkbox from '../components/Checkbox.svelte';
	import ColorInputPixi from '../components/ColorInputPixi.svelte';
	import SelectGrid from '../components/SelectGrid.svelte';
	import type PathLayer from '../layers/PathLayer.svelte';
	import type { path_data } from '../types/data';
	import type { listed_path_style } from '../types/path';
	import * as PIXI from 'pixi.js';

	export let data_path: path_data;
	export let comp_pathLayer: PathLayer;

	/* Path Style Management */
	$: {
		if (data_path.selectedPath) {
			data_path.selectedPath.style = { ...data_path.style };
		}

		pathStyles = pathStyles;
	}

	export let pathStyles: listed_path_style[];

	let pathID = 0;
	pathStyles.forEach((pathStyle) => {
		pathID = Math.max(pathID, pathStyle.id + 1);
	});

	function styleMatchesData(pathStyle: PIXI.LineStyle) {
		if (pathStyle.color != data_path.style.color) return false;
		if (pathStyle.width != data_path.style.width) return false;
		if (pathStyle.cap != data_path.style.cap) return false;
		if (pathStyle.join != data_path.style.join) return false;

		return true;
	}

	function newPathStyle() {
		let name = prompt('What would you like to name this path style?');
		if (name == null) return;

		pathStyles = [...pathStyles, { display: name, style: { ...data_path.style }, id: pathID }];
		pathID += 1;
	}

	let menuX = 0;
	let menuY = 0;

	function updateStyleToMatch() {
		if (data_path.contextPathId == null) return;

		let styleToEdit: listed_path_style = pathStyles.find((ps) => ps.id == data_path.contextPathId);

		styleToEdit.style = { ...data_path.style };
		//styleToEdit = styleToEdit
		pathStyles = pathStyles;

		data_path.contextPathId = null;
	}

	function deletePathStyle() {
		if (data_path.contextPathId == null) return;
		if (!confirm('Are you sure you would like to delete this path style?')) return;

		pathStyles = pathStyles.filter((ps) => ps.id != data_path.contextPathId);

		data_path.contextPathId = null;
	}

	function renameStyle() {
		if (data_path.contextPathId == null) return;

		let styleToEdit: listed_path_style = pathStyles.find((ps) => ps.id == data_path.contextPathId);
		data_path.contextPathId = null;

		let styleName = prompt('What would you like this path style to be called?');
		if (!styleName) return;

		styleToEdit.display = styleName;
		pathStyles = pathStyles;
	}

	// Path Controls
	function deselectPath() {
		if (data_path.selectedPath.points.length == 2) comp_pathLayer.deletePath(data_path.selectedPath);
		data_path.selectedPath = null;
	}

	function duplicateStyle() {
		let contextPathStyle: listed_path_style = pathStyles.find((ps) => ps.id == data_path.contextPathId);

		pathID += 1;
		pathStyles = [...pathStyles, { display: contextPathStyle.display, style: { ...contextPathStyle.style }, id: pathID }];

		data_path.contextPathId = null;
	}
</script>

<div
	class="panel"
	on:pointerdown={() => {
		if (data_path.contextPathId) data_path.contextPathId = null;
	}}
>
	<div id="controls">
		<label for="pathColor">Color</label>
		<ColorInputPixi bind:value={data_path.style.color} id={'pathColor'} />

		<label for="pathThickness">Thickness</label>
		<input id="pathThickness" type="number" bind:value={data_path.style.width} />

		<button
			id="snap"
			class="small-panel-button"
			title={'Snap'}
			on:click={() => {
				data_path.snap = !data_path.snap;
			}}
			class:selected={data_path.snap}
		>
			<img src="/assets/img/tools/snap.png" alt={'Snap'} />
		</button>

		<p class="control-label">Line Cap</p>
		<span>
			<SelectGrid
				values={[PIXI.LINE_CAP.ROUND, PIXI.LINE_CAP.BUTT, PIXI.LINE_CAP.SQUARE]}
				bind:value={data_path.style.cap}
				filenamePrefix={'lineend'}
			/>
		</span>

		<p class="control-label">Line End</p>
		<span>
			<SelectGrid
				values={[PIXI.LINE_JOIN.ROUND, PIXI.LINE_JOIN.MITER, PIXI.LINE_JOIN.BEVEL]}
				bind:value={data_path.style.join}
				filenamePrefix={'linecorner'}
			/>
		</span>
	</div>

	{#if data_path.selectedPath}
		<div id="selected-path-controls">
			<button
				on:click={() => {
					deselectPath();
				}}>Deselect Current Path</button
			>
			<button
				on:click={() => {
					comp_pathLayer.removeLastPoint(data_path.selectedPath);
				}}>Remove Last Point</button
			>
			<button
				style="color: #FF6666;"
				on:click={() => {
					comp_pathLayer.deletePath(data_path.selectedPath);
				}}>Delete Path</button
			>
		</div>
	{/if}

	<!-- PATH STYLES -->
	<div id="path-styles" style={data_path.selectedPath ? 'padding-top: 0px;' : ''}>
		<!-- Path Style Listing -->
		<div style="display: flex; gap: 5px; flex-wrap: wrap">
			{#each pathStyles as pb (pb.id)}
				<button
					on:click={() => {
						data_path.style = { ...pb.style };
					}}
					class:selected={styleMatchesData(pb.style)}
					on:contextmenu={(e) => {
						e.preventDefault();
						menuX = e.clientX;
						menuY = e.clientY;
						data_path.contextPathId = pb.id;
					}}
				>
					{pb.display}
				</button>
			{/each}
			<button
				class="green-button"
				style="width: 28px;"
				on:click={() => {
					newPathStyle();
				}}
				title="Save current path style"
			>
				+
			</button>
		</div>
	</div>
</div>

<!-- Path Style Context Menu -->
{#if data_path.contextPathId != null}
	<div class={'context-menu'} style={`top: ${menuY}px; left: ${menuX}px`}>
		<button on:click={updateStyleToMatch} title={'Update this path style to match what is currently set above.'}>Update Style</button>
		<button on:click={renameStyle}>Rename</button>
		<button on:click={duplicateStyle}>Duplicate</button>
		<button on:click={deletePathStyle}>Delete</button>
	</div>
{/if}

<style>
	span {
		display: flex;
	}
	div {
		color: white;
	}

	.control-label {
		margin: 0;
	}

	.small-panel-button {
		position: absolute;
		width: 25px;
		height: 25px;
		margin: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0;
	}

	.small-panel-button img {
		width: 90%;
		height: auto;
	}

	#snap {
		top: 10px;
		right: 10px;
	}

	#controls {
		padding: 10px;
		display: grid;
		grid-template-columns: 1fr 2fr;
		row-gap: 5px;
	}

	#selected-path-controls {
		background-color: #555555;
		padding: 10px;
		display: grid;
		grid-template-rows: auto;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 5px;
	}

	#path-styles {
		padding: 10px;
		background-color: #555555;
	}

	.selected {
		border-color: #8cc63f;
		outline: #8cc63f solid 1px;
		transition-duration: 0.2s;
	}
</style>
