<script lang="ts">
	import Checkbox from '../components/Checkbox.svelte';
	import ColorInputPixi from '../components/ColorInputPixi.svelte';
	import SelectGrid from '../components/SelectGrid.svelte';
	import type PathLayer from '../layers/PathLayer.svelte';
	import type { path_data } from '../types/data';
	import type { listed_path_style } from '../types/path';
	import * as PIXI from 'pixi.js';
	import { onMount, afterUpdate } from 'svelte';
	

	import { store_has_unsaved_changes } from '../stores/flags';
	import { data_path } from '../stores/data';

	export let comp_pathLayer: PathLayer;

	/* Path Style Management */

	export let pathStyles: listed_path_style[];

	data_path.subscribe(n => {
		pathStyles = pathStyles;
	})

	$: {
		pathStyles = pathStyles
	}
	

	let pathID = 0;
	pathStyles.forEach((pathStyle) => {
		pathID = Math.max(pathID, pathStyle.id + 1);
	});

	function styleMatchesData(pathStyle: PIXI.LineStyle) {
		return JSON.stringify(pathStyle) == JSON.stringify($data_path.style)

	}

	function newPathStyle() {
		let name = prompt('What would you like to name this path style?');
		if (name == null) return;

		pathStyles = [...pathStyles, { display: name, style: { ...$data_path.style }, id: pathID }];
		pathID += 1;

		$store_has_unsaved_changes = true;
	}

	let menuX = 0;
	let menuY = 0;

	function updateStyleToMatch() {
		if ($data_path.contextPathId == null) return;

		let styleToEdit: listed_path_style = pathStyles.find((ps) => ps.id == $data_path.contextPathId);

		styleToEdit.style = { ...$data_path.style };
		//styleToEdit = styleToEdit
		pathStyles = pathStyles;

		$data_path.contextPathId = null;
	}

	function deletePathStyle() {
		if ($data_path.contextPathId == null) return;
		if (!confirm('Are you sure you would like to delete this path style?')) return;

		pathStyles = pathStyles.filter((ps) => ps.id != $data_path.contextPathId);

		$data_path.contextPathId = null;

		$store_has_unsaved_changes = true;
	}

	function renameStyle() {
		if ($data_path.contextPathId == null) return;

		let styleToEdit: listed_path_style = pathStyles.find((ps) => ps.id == $data_path.contextPathId);
		$data_path.contextPathId = null;

		let styleName = prompt('What would you like this path style to be called?');
		if (!styleName) return;

		styleToEdit.display = styleName;
		pathStyles = pathStyles;

		$store_has_unsaved_changes = true;

	}

	// Path Controls
	function deselectPath() {
		if ($data_path.selectedPath.points.length == 2) comp_pathLayer.deletePath($data_path.selectedPath);
		$data_path.selectedPath = null;
	}

	function duplicateStyle() {
		let contextPathStyle: listed_path_style = pathStyles.find((ps) => ps.id == $data_path.contextPathId);

		pathID += 1;
		pathStyles = [...pathStyles, { display: contextPathStyle.display, style: { ...contextPathStyle.style }, id: pathID }];

		$data_path.contextPathId = null;

		$store_has_unsaved_changes = true;
	}

</script>

<div
	class="panel"
	on:pointerdown={() => {
		if ($data_path.contextPathId) $data_path.contextPathId = null;
	}}
>
	<div id="controls">
		<span>
			<ColorInputPixi bind:value={$data_path.style.color} id={'pathColor'} />
			<input id="pathThickness" type="number" min={1} bind:value={$data_path.style.width} />
		</span>

		
		<span class="path-control-grid">
			<p>Line Ends</p>
			<span>
			<SelectGrid
				options = {[
					{title: "Round Ends", value: PIXI.LINE_CAP.ROUND, filename: "lineendround"},		
					{title: "Butt Ends", value: PIXI.LINE_CAP.BUTT, filename: "lineendbutt"},		
					{title: "Square Ends", value: PIXI.LINE_CAP.SQUARE, filename: "lineendsquare"},		
				]}
				bind:value={$data_path.style.cap}
			/>
			</span>
		</span>

		<span class="path-control-grid">
			<p>Corners</p>
			<span>
			<SelectGrid
				options = {[
					{title: "Round Corners", value: PIXI.LINE_JOIN.ROUND, filename: "linecornerround"},		
					{title: "Miter Corners", value: PIXI.LINE_JOIN.MITER, filename: "linecornermiter"},		
					{title: "Bevel Corners", value: PIXI.LINE_JOIN.BEVEL, filename: "linecornerbevel"},		
				]}
				bind:value={$data_path.style.join}
			/>
			</span>
		</span>

		<span class="path-control-grid">
			<label for="dashed-line">Dashed Line</label>
			<Checkbox bind:checked={$data_path.style.dashed} on:change={e => {$data_path = $data_path}}/>
		</span>

		{#if $data_path.style.dashed}
		<span class="path-control-grid" id="dash-param-grid">
			<label for="dash-length">Dash</label>
			<input id="dash-length" type="number" bind:value={$data_path.style.dash_length} min={1}>
			<label for="dash-gap">Gap</label>
			<input id="dash-gap" type="number" bind:value={$data_path.style.dash_gap} min={1}>
		</span>
		{/if}
		
	</div>

	{#if $data_path.selectedPath}
		<div id="selected-path-controls">
			<button on:click={() => {$data_path.add_to = $data_path.add_to == "start" ? "end" : "start"}}>Switch End</button>
			<button on:click={() => {deselectPath();}}>Deselect Path</button>
			<button on:click={() => {comp_pathLayer.remove_latest_point($data_path.selectedPath);}}>Remove Last Point</button>
			<button class="evil" on:click={() => { comp_pathLayer.deletePath($data_path.selectedPath); }}>Delete Path</button >
		</div>
	{/if}

	<!-- PATH STYLES -->
	<div id="path-styles" style={$data_path.selectedPath ? 'padding-top: 0;' : ''}>
		<!-- Path Style Listing -->
		<div style="display: flex; gap: 5px; flex-wrap: wrap">
			{#each pathStyles as pb (pb.id)}
				<button
					on:click={() => {
						$data_path.style = { ...pb.style };
					}}
					class:selected={styleMatchesData(pb.style)}
					on:contextmenu={(e) => {
						e.preventDefault();
						menuX = e.clientX;
						menuY = e.clientY;
						$data_path.contextPathId = pb.id;
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
{#if $data_path.contextPathId != null}
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
		gap: 0.5em;
	}

	div {
		color: var(--text);
	}


	#controls {
		padding: 1em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	#controls input[type="number"] {
		flex-grow: 1;
	}

	#selected-path-controls {
		background-color: var(--light-background);
		padding: 0.625em;
		display: grid;
		grid-template-rows: auto;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		gap: 0.3125em;
	}

	#path-styles {
		padding: 0.625em;
		background-color: var(--light-background);
	}

	.path-control-grid {
		display: grid;
		grid-template-columns: 1fr 2fr;
	}

	.path-control-grid p {
		margin: 0;
		display: flex;
		align-items: center;
	}

	#dash-param-grid {
		grid-template-columns: 1fr 1fr 1fr 1fr;
		width: 100%;
		gap: 0.25em;
	}

	#dash-param-grid input {
		width: 100%;
		margin: 0;
		box-sizing: border-box;
	}

</style>
