<script lang="ts">
	import ColorInput from '../components/ColorInput.svelte';
	import CustomValueToggle from '../components/CustomValueToggle.svelte';
	import SelectGrid from '../components/SelectGrid.svelte';
	import type * as PIXI from 'pixi.js';
	import type { text_data } from '../types/data';
	import type { listed_text_style } from '../types/text';
	import type TextLayer from '../layers/TextLayer.svelte';

	export let data_text: text_data;
	export let comp_textLayer: TextLayer;

	/* This is fucking barbaric... but I can't find a way to make to make it work */
	function focus(node: HTMLTextAreaElement) {
		setTimeout(() => {
			node.focus();
		}, 10);
	}

	export let textStyles: listed_text_style[];

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

		textStyles = [...textStyles, { display: name, style: { ...data_text.style } }];
	}

	let fonts = ['Arial', 'Comic Sans MS', 'Segoe UI', 'Times New Roman', 'Trebuchet MS'];
</script>

<div class="panel">
	<div id="controls">
		<label for="textFill">Color</label>
		<ColorInput bind:value={data_text.style.fill} name="textFill" />

		<label for="fontSize">Font Size</label>
		<input id="fontSize" type="number" bind:value={data_text.style.fontSize} />

		<label for="textStroke">Outline</label>
		<ColorInput bind:value={data_text.style.stroke} name="textStroke" />

		<label for="textStrokeThickness">Thickness</label>
		<input for="textStrokeThickness" type="number" bind:value={data_text.style.strokeThickness} />

		<label for="textFont">Font</label>
		<select id="textFont" bind:value={data_text.style.fontFamily}>
			{#each fonts as font}
				<option value={font}>{font}</option>
			{/each}
		</select>

		<div id="font-style-controls">
			<span>
				<div id="font-style-container">
					<div id="font-style-options">
						<div class="font-style-option">
							<CustomValueToggle offValue={'normal'} onValue={'italic'} bind:value={data_text.style.fontStyle}
								><i style="font-family: Times New Roman">I</i></CustomValueToggle
							>
						</div>

						<div class="font-style-option">
							<CustomValueToggle offValue={'normal'} onValue={'bold'} bind:value={data_text.style.fontWeight}
								><b>B</b></CustomValueToggle
							>
						</div>
					</div>
				</div>
			</span>

			<span>
				<SelectGrid values={['left', 'center', 'right']} bind:value={data_text.style.align} filenamePrefix={'textalign'} />
			</span>
		</div>
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
				>
					<img src="/assets/img/tools/trash.png" alt="Trash" title="Delete Selected Text" />
				</button>
			</div>
		</div>
	{/if}

	<div id="text-styles" style={data_text.selectedText ? 'padding-top: 0px' : ''}>
		<div style="display: flex; gap: 5px; flex-wrap: wrap">
			{#each textStyles as ts}
				<button
					on:click={() => {
						changeTextStyle(ts.style);
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

<style>
	.panel {
		color: white;
	}

	#controls {
		padding: 10px;
		display: grid;
		grid-template-columns: 1fr 2fr;
		row-gap: 5px;
	}

	.selected {
		outline: #8cc63f solid 1px;
		border-color: #8cc63f;
	}

	#selected-text-controls {
		padding: 10px;
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
		position: absolute;
		top: 5px;
		right: 5px;
		width: 30px;
		height: 30px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#selected-text-controls button img {
		height: 80%;
	}

	#text-styles {
		padding: 10px;
		background-color: #555555;
	}

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

	#font-style-controls {
		grid-column: 1/3;
		display: flex;
		justify-content: center;
		gap: 5px;
	}
</style>
