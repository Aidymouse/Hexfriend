<script lang="ts">
	import ColorInput from '../components/ColorInput.svelte';
	import CustomValueToggle from '../components/CustomValueToggle.svelte';
	import SelectGrid from '../components/SelectGrid.svelte';
	import type TextLayer from '../layers/TextLayer.svelte';
	import type { text_data } from '../types/data';
	import type { listed_text_style } from '../types/text';
	import type * as PIXI from 'pixi.js';
	import { text } from 'svelte/internal';

	export let data_text: text_data;
	export let comp_textLayer: TextLayer;

	/* This is fucking barbaric... but I can't find a way to make to make it work */
	function focus(node: HTMLTextAreaElement) {
		setTimeout(() => {
			node.focus();
		}, 10);
	}

	let fonts = ['Arial', 'Comic Sans MS', 'Segoe UI', 'Times New Roman', 'Trebuchet MS'];

	export let textStyles: listed_text_style[];
	let styleId = 0;
	textStyles.forEach((ts) => {
		styleId = Math.max(ts.id, styleId);
	});

	function selectedMatches(style: listed_text_style): boolean {
		return JSON.stringify(style) == JSON.stringify(data_text.style);
	}

	$: {
		data_text.selectedText =
			data_text.selectedText; /* If this line isn't here the textstyles dont update and the selected button gets stuck. Svelte weirdness?  */
		textStyles = textStyles;
	}

	function changeTextStyle(style: PIXI.Text['style']) {
		data_text.style = { ...style };
		//data_text = data_text
		textStyles = textStyles; /* Updates the selected button */
	}

	function newTextStyle() {
		let name = prompt('What would you like to name this text style?');
		if (name == null) return;

		styleId += 1;
		textStyles = [...textStyles, { display: name, style: { ...data_text.style }, id: styleId }];
	}

	let menuX = 0;
	let menuY = 0;

	function updateStyle() {
		if (data_text.contextStyleId == null) return;

		let styleToUpdate = textStyles.find((ts) => ts.id == data_text.contextStyleId);
		styleToUpdate.style = { ...data_text.style };

		textStyles = textStyles;
		data_text.contextStyleId = null;
	}

	function renameStyle() {
		if (data_text.contextStyleId == null) return;

		let styleToEdit: listed_text_style = textStyles.find((ps) => ps.id == data_text.contextStyleId);
		data_text.contextStyleId = null;

		let styleName = prompt('What would you like this text style to be called?');
		if (!styleName) return;

		styleToEdit.display = styleName;
		textStyles = textStyles;
	}

	function duplicateStyle() {
		if (data_text.contextStyleId == null) return;

		let styleToDupe = textStyles.find((ts) => ts.id == data_text.contextStyleId);
		styleId += 1;
		textStyles = [...textStyles, { display: styleToDupe.display, style: { ...styleToDupe.style }, id: styleId }];

		data_text.contextStyleId = null;
	}

	function deleteStyle() {
		if (!confirm('Are you sure you would like to delete this text style?')) return;
		textStyles = textStyles.filter((ts) => ts.id != data_text.contextStyleId);
		data_text.contextStyleId = null;
	}
</script>

<div
	class="panel"
	on:pointerdown={() => {
		if (data_text.contextStyleId) data_text.contextStyleId = null;
	}}
>
	<div id="controls">
		
		<span>
			<ColorInput bind:value={data_text.style.fill} name="textFill" />
			
			<input id="fontSize" type="number" bind:value={data_text.style.fontSize} />
			
			<div id="font-style-container">
				<div id="font-style-options">
					<div class="font-style-option">
						<CustomValueToggle offValue={'normal'} onValue={'bold'} bind:value={data_text.style.fontWeight}
							><b>B</b></CustomValueToggle
						>
					</div>

					<div class="font-style-option">
						<CustomValueToggle offValue={'normal'} onValue={'italic'} bind:value={data_text.style.fontStyle}
							><i style="font-family: Times New Roman">I</i></CustomValueToggle
						>
					</div>

				</div>
			</div>

			<SelectGrid values={['left', 'center', 'right']} bind:value={data_text.style.align} filenamePrefix={'textalign'} />

		</span>

		<span>
			<select id="textFont" bind:value={data_text.style.fontFamily}>
				{#each fonts as font}
					<option value={font}>{font}</option>
				{/each}
			</select>
		</span>

		<span>
			<label for="textStroke">Outline</label>
			<ColorInput bind:value={data_text.style.stroke} name="textStroke" />
			<input type="number" bind:value={data_text.style.strokeThickness} />
		</span>
	</div>

	{#if data_text.selectedText}
		<div id="selected-text-controls">
			<div id="text-area-wrapper">
				<textarea bind:value={data_text.selectedText.text} use:focus bind:this={data_text.editorRef} />
				<!-- The editor ref is literally jsut used to let us focus the text area by clicking on the text. -->
				<button
				on:click={() => {
					comp_textLayer.deleteText(data_text.selectedText);
				}}
				class="evil"
				>Delete Selected Text
				</button>
			</div>
		</div>
	{/if}

	<!-- TEXT STYLES -->
	<div id="text-styles" style={data_text.selectedText ? 'padding-top: 0px' : ''}>
		<div style="display: flex; gap: 5px; flex-wrap: wrap">
			{#each textStyles as ts (ts.id)}
				<button
					on:click={() => {
						changeTextStyle(ts.style);
					}}
					on:contextmenu={(e) => {
						e.preventDefault();
						menuX = e.clientX;
						menuY = e.clientY;
						data_text.contextStyleId = ts.id;
					}}
					class:selected={selectedMatches(ts.style)}>{ts.display}</button
				>
			{/each}
			<button
				class="green-button"
				style="width: 28px;"
				on:click={() => {
					newTextStyle();
				}}
				title="Save current text style"
			>
				+
			</button>
		</div>
	</div>
</div>

{#if data_text.contextStyleId != null}
	<div class={'context-menu'} style={`top: ${menuY}px; left: ${menuX}px`}>
		<button on:click={updateStyle} title={'Update this path style to match what is currently set above.'}>Update Style</button>
		<button on:click={renameStyle}>Rename</button>
		<button on:click={duplicateStyle}>Duplicate</button>
		<button on:click={deleteStyle}>Delete</button>
	</div>
{/if}

<style>
	.panel {
		color: white;
	}

	#controls {
		padding: 1em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	#controls span {
		display: flex;
		justify-content: flex-start;
		flex-direction: row;
		gap: 0.5em;
		width: 100%;
		flex-grow: 0;
		align-items: center;
	}

	#controls span select {
		width: 100%;
	}

	#controls span input[type="number"] {
		flex: 2 1 50px;
		width: 2em;
	}

	.selected {
		outline: #8cc63f solid 1px;
		border-color: #8cc63f;
	}

	#selected-text-controls {
		padding: 1em;
		background-color: #555555;
	}

	#selected-text-controls #text-area-wrapper {
		position: relative;
		width: 100%;
		box-sizing: border-box;
		min-height: 60px;
	}

	#selected-text-controls textarea {
		box-sizing: border-box;
		min-height: 60px;
		max-width: 100%;
		min-width: 100%;
		height: 100%;
	}

	#selected-text-controls button {
		width: 100%;
		margin-top: 0.5em;
	}

	#text-styles {
		padding: 0.5em;
		background-color: #555555;
	}


	/* FONT STYLE */
	#font-style-options {
		display: flex;
		gap: 1px;
		background-color: #555555;
		border: solid 1px #555555;
		border-radius: 3px;
	}

	.font-style-option {
		width: 30px;
		height: 30px;
	}

	#font-style-container {
		display: inline-block;
		border-radius: 3px;
	}

</style>
