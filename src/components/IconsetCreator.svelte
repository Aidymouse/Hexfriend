<script lang="ts">
	import type { hexOrientation } from '../helpers/hexHelpers';
	import { getHexPathRadius } from '../helpers/hexHelpers';
	import { download } from '../lib/download2';
	import type { Icon, Iconset } from '../types/icon';
	import ColorInputPixi from './ColorInputPixi.svelte';
	import * as PIXI from 'pixi.js';
	import { afterUpdate, tick } from 'svelte';
	import CanvasHolder from './CanvasHolder.svelte';

	let app = new PIXI.Application({
		width: 300,
		height: 300,
		backgroundAlpha: 0,
	});

	export let appState;

	let orientation: hexOrientation = 'flatTop';

	let workingIconset: Iconset = {
		name: 'New Iconset',
		id: 'new-iconset',
		author: '',
		version: 1,
		icons: [],
	};

	let selectedIcon: Icon | null = null;

	//const l: PIXI.Loader = new PIXI.Loader();
	let texId: number = 0;

	let previewSprite = new PIXI.Sprite();
	//let previewGraphics = new PIXI.Graphics()
	let previewContainer = new PIXI.Container();
	previewContainer.addChild(previewSprite);

	function findID(baseId: string): string {
		let counter = 0;
		let proposedId = `${IDify(workingIconset.name)}_${baseId}${counter == 0 ? '' : counter}`;

		while (workingIconset.icons.find((icon: Icon) => icon.id == proposedId) != null) {
			counter++;
			proposedId = `${IDify(workingIconset.name)}_${baseId}${counter == 0 ? '' : counter}`;
		}

		return proposedId;
	}

	let loadedTextures = {}; // Tex ID -> texture
	let iconTextureLookupTable = {}; // Tex ID -> Tex ID in loaded textures table

	function IDify(name: string): string {
		return name.toLowerCase().replace(' ', '-');
	}

	let newIconFiles: FileList;

	async function loadTexture(texId, result) {
		let newTexture = await PIXI.Assets.load(result);
		loadedTextures[texId] = newTexture;
		return newTexture
	}

	async function newIcon() {
		//console.log(newIconFiles)

		Array.from(newIconFiles).forEach((file) => {
			let r = new FileReader();

			r.readAsDataURL(file);
			r.onload = async (eb) => {

				let iconName = file.name.split('.')[0];
				let texId = findID(IDify(iconName));

				let newTexture = await loadTexture(texId, r.result);
				console.log(newTexture);

				let newIcon: Icon = {
					display: iconName,
					texId: texId,
					id: findID(IDify(iconName)),
					color: 0xffffff,
					pHex: 80,
					base64: r.result as string,
					preview: r.result as string,
					texWidth: newTexture.width,
					texHeight: newTexture.height,
				};

				workingIconset.icons = [...workingIconset.icons, newIcon];
			};
		});
	}

	function duplicateIcon(icon: Icon) {
		let newIcon = { ...icon };

		newIcon.display = 'Copy of ' + icon.display;
		newIcon.id = findID(IDify(newIcon.display));

		workingIconset.icons = [...workingIconset.icons, newIcon];
		selectedIcon = workingIconset.icons[workingIconset.icons.length - 1];
	}

	function removeIcon(icon: Icon) {
		workingIconset.icons = workingIconset.icons.filter((t: Icon) => t.id != icon.id);
	}

	async function generatePreview(icon: Icon) {
		//previewGraphics.clear();
		//previewGraphics.beginFill(DEFAULTBLANKHEXCOLOR);
		//previewGraphics.drawPolygon( getHexPathRadius(25, orientation, 0, 0) );
		//previewGraphics.endFill();

		previewSprite.texture = PIXI.Texture.from(icon.base64);
		previewSprite.scale.set(getIconScale(icon, 25).x);
		previewSprite.anchor.set(0.5);
		previewSprite.tint = icon.color;

		let p = await app.renderer.extract.base64(previewSprite);

		return p;
	}

	$: {
		//if (selectedIcon) selectedIcon.preview = generatePreview(workingIconset.icons[stIndex])

		orientation = orientation;

	}

	function getIconScale(symbol, radius = 150) {
		let h, w;
		if (orientation == 'pointyTop') {
			h = radius * 2;
			w = Math.cos(Math.PI / 6) * radius * 2;
		} else {
			w = radius * 2;
			h = radius / Math.tan(Math.PI / 6);
		}

		let scale;
		if (w < h) {
			scale = (w * symbol.pHex) / 100 / symbol.texWidth;
		} else {
			scale = (h * symbol.pHex) / 100 / symbol.texHeight;
		}

		return { x: scale, y: scale };
	}

	const DEFAULTBLANKHEXCOLOR = 0xf2f2f2;

	function exportIconset() {
		workingIconset.id = IDify(`${workingIconset.name}:v${workingIconset.version}`);
		
		workingIconset.icons.forEach(icon => {
			icon.id = findID(icon.display)
		})

		console.log(workingIconset)
		download(JSON.stringify(workingIconset), workingIconset.name + `_v${workingIconset.version}` + '.hfis');
	}

	let importFiles = [];

	async function importIconset() {
		let importFile = importFiles[0];

		if (!importFile) return;

		let r = new FileReader();
		r.readAsText(importFile);
		r.onload = async (eb) => {
			/* Read the file */
			let setToImport = JSON.parse(eb.target.result);

			//console.log(setToImport)

			/* Load textures */

			setToImport.icons.forEach( (icon: Icon) => {
				loadTexture(icon.texId, icon.base64)
			})

			workingIconset = { ...setToImport };
			await tick();
			//workingIconset.icons = workingIconset.icons;

			selectedIcon = null;
		};
	}

	/* DRAG FUNCTIONS */
	let dragIcon: Icon;
	let phantomIconButtonId;

	function dragButton(e: DragEvent, icon: Icon) {
		//console.log(icon);

		phantomIconButtonId = icon.id;

		e.dataTransfer.setData('text/json', JSON.stringify(icon));
	}

	function dropButton(e: DragEvent) {
		phantomIconButtonId = null;
	}

	function draggedOverButton(e: DragEvent, icon: Icon) {
		if (icon.id == phantomIconButtonId) return;

		let draggedOverIndex = workingIconset.icons.indexOf(icon);
		workingIconset.icons = workingIconset.icons.filter((i) => i.id != phantomIconButtonId);

		// If phantom is on the left, switch them. Otherwise, proceed as normal
		if (draggedOverIndex != 0 && workingIconset.icons[draggedOverIndex - 1].id == phantomIconButtonId) {
			workingIconset.icons.splice(draggedOverIndex + 1, 0, JSON.parse(e.dataTransfer.getData('text/json')));
		} else {
			workingIconset.icons.splice(draggedOverIndex, 0, JSON.parse(e.dataTransfer.getData('text/json')));
		}

		workingIconset = workingIconset;
	}

	let grph_background_hex = new PIXI.Graphics();
	let spr_icon = new PIXI.Sprite();

	app.stage.addChild(grph_background_hex, spr_icon)

	afterUpdate(async () => {

		if (selectedIcon) {

			grph_background_hex.clear();
			grph_background_hex.beginFill(DEFAULTBLANKHEXCOLOR);
			grph_background_hex.drawPolygon(getHexPathRadius(150, orientation, 150, 150));
			grph_background_hex.endFill();
	
			spr_icon.texture = loadedTextures[selectedIcon.texId] 
			spr_icon.x= 150
			spr_icon.y= 150
			spr_icon.anchor.x = 0.5
			spr_icon.anchor.y = 0.5
			spr_icon.tint = selectedIcon.color 
			spr_icon.scale = getIconScale(selectedIcon)

			let new_preview = await generatePreview(selectedIcon);
			if (selectedIcon.preview != new_preview) {
				selectedIcon.preview = new_preview;
				workingIconset = workingIconset;
			} 
		
		}



	})
</script>

<main>
	<nav>
		<div id="set-controls">
			<div id="grid">
				<button
					on:click={() => {
						appState = 'normal';
					}}
					style="grid-column: 1/3;">Exit Iconset Builder</button
				>

				<label for="setName">Iconset Name</label>
				<input id="setName" type="text" bind:value={workingIconset.name} placeholder="Iconset Name" />

				<label for="setAuthor">Author</label>
				<input id="setAuthor" type="text" bind:value={workingIconset.author} placeholder="You!" />

				<label for="setVersion">Version</label>
				<input id="setVersion" type="number" bind:value={workingIconset.version} />

				<button on:click={() => importIconset()} class="file-input-button">
					Import
					<input
						type="file"
						bind:files={importFiles}
						accept={'.hfis'}
						on:change={(e) => {
							importIconset();
							e.target.value = '';
						}}
					/>
				</button>

				<button on:click={() => exportIconset()}>Export</button>
			</div>
		</div>

		<div
			id="icon-buttons"
			on:dragover={(e) => {
				e.preventDefault();
			}}
			on:dragenter={(e) => {
				e.preventDefault();
			}}
			on:drop={dropButton}
		>
			{#each workingIconset.icons as icon (icon.id)}
				<button
					class="icon-button"
					class:selected={selectedIcon == icon}
					style={icon.id == phantomIconButtonId ? 'opacity: 0' : ''}
					on:click={() => {
						selectedIcon = icon;
					}}
					draggable={true}
					on:dragstart={(e) => {
						dragButton(e, icon);
					}}
					on:dragenter={(e) => {
						draggedOverButton(e, icon);
					}}
					title={icon.display}
				>
					<img src={icon.preview} draggable="false" alt="Button for {icon.display}" />
				</button>
			{/each}

			<button class="icon-button file-input-button">
				+
				<input
					type="file"
					multiple
					accept="image/*"
					bind:files={newIconFiles}
					on:change={() => {
						newIcon();
					}}
				/>
			</button>
		</div>
	</nav>

	{#if selectedIcon}
		<div id="icon-preview">

			<div id="pixi-container" style="width: 18.75em; height: 18.75em;">

				<CanvasHolder {app} />
			</div>

			<input
				type="text"
				bind:value={selectedIcon.display}
				on:change={() => {
					workingIconset.icons = workingIconset.icons;
				}}
			/>

			<div id="icon-controls">
				<button
					on:click={() => {
						orientation = orientation == 'flatTop' ? 'pointyTop' : 'flatTop';
					}}
					title="Change Hex Orientation"
				>
					<img src="/assets/img/tools/changeOrientation.png" alt="Change Orientation" />
				</button>
				<button
					on:click={() => {
						duplicateIcon(selectedIcon);
					}}
					title="Duplicate this Hex"
				>
					<img src="/assets/img/tools/duplicate.png" alt="Duplicate Hex" />
				</button>
				<button
					on:click={() => {
						removeIcon(selectedIcon);
						selectedIcon = null;
					}}
					title="Delete this Hex"
				>
					<img src="/assets/img/tools/trash.png" alt="Trash" />
				</button>
			</div>
			<!--
      <button on:click={() => {orientation = orientation == "flatTop" ? "pointyTop" : "flatTop"; workingIconset.icons=workingIconset.icons}}>Change Orientation</button>
      <button on:click={() => { deleteIcon() } }>Delete Hex</button>
      <button on:click={() => { duplicateIcon() }}> Duplicate Hex </button>
      -->
		</div>

		<div id="icon-style">
			<!-- Background Color -->
			<div class="color" style="margin-bottom: 0.625em">
				<ColorInputPixi bind:value={selectedIcon.color} w={50} h={50} />

				<div>
					<p>Tint</p>
					<p class="color-string">{PIXI.utils.hex2string(selectedIcon.color)}</p>
				</div>
			</div>

			<div id="symbol-scale">
				<div id="scale-holder">
					<p>Icon scale</p><input type="number" bind:value={selectedIcon.pHex} /><p>%</p>
				</div>
				<div>
					<input type="range" min="5" max="100" bind:value={selectedIcon.pHex} />
				</div>
			</div>
		</div>
	{:else}
		<div id="editor-placeholder">
			<p style="color: var(--text); margin-bottom: 0.625em;">Select a icon or make a new one!</p>

			<p style="font-size: 10pt">For best results, use white 100px by 100px images.</p>
			<p style="font-size: 10pt">Hint: You can upload multiple images at once!</p>
		</div>
	{/if}
</main>

<style>

	main {
		display: grid;
		grid-template-columns: 19.375em 1fr 1fr;
		grid-template-rows: 1fr;
		margin: 0;
		height: 100%;
		color: var(--text);
		background-color: var(--dark-background);
	}

	nav {
		height: 100%;
		background-color: var(--light-background);
	}

	#set-controls {
		padding: 0.625em;
		background-color: var(--primary-background);
		box-sizing: border-box;
	}

	#set-controls #grid {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-auto-rows: 1fr;
		gap: 0.3125em;
	}

	#grid input {
		width: 100%;
		box-sizing: border-box;
	}

	button {
		border: solid 1px var(--lighter-background);
	}

	input[type='text'] {
		border-radius: var(--large-radius);
	}

	.file-input-button {
		position: relative;
	}

	.file-input-button input {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0;
	}

	#icon-buttons {
		padding: 0.625em;
		display: grid;
		gap: 0.625em;
		grid-template-columns: repeat(5, 3.125em);
		grid-template-rows: 3.125em;
		grid-auto-rows: 3.125em;
	}

	.icon-button {
		width: 3.125em;
		height: 3.125em;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.icon-button img {
		width: 100%;
	}

	#editor-placeholder {
		grid-column: 2/4;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	#editor-placeholder p {
		color: var(--lightest-background);
		margin: 0;
	}

	#icon-preview {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	#icon-controls {
		margin-top: 0.3125em;
		display: flex;
		gap: 0.3125em;
	}

	#icon-controls button {
		width: 2.5em;
		height: 2.5em;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#icon-controls button img {
		height: 80%;
	}

	#icon-style {
		display: flex;
		justify-content: center;
		flex-direction: column;
		width: 50%;
	}

	.color {
		display: grid;
		grid-template-columns: 3.75em 1fr;
		grid-template-rows: 3.75em;
		column-gap: 0.625em;
	}

	.color div {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.color p {
		margin: 0;
	}

	.color .color-string {
		font-size: 10pt;
		color: var(--lightest-background);
	}

	#scale-holder {
		display: flex;
		align-items: baseline;
		justify-content: flex-end;
	}

	#scale-holder p {
		margin: 0;
	}

	#scale-holder :first-child {
		flex-grow: 1;
	}

	#scale-holder input {
		flex-shrink: 1;
		width: 6ch;
		height: 2em;
	}

	#scale-holder :last-child {
		margin-inline-start: 0.5em;
	}
</style>
