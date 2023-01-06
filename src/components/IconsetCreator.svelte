<script lang="ts">
	import type { hexOrientation } from '../helpers/hexHelpers';
	import { getHexPathRadius } from '../helpers/hexHelpers';
	import { download } from '../lib/download2';
	import type { Icon, Iconset } from '../types/icon';
	import ColorInputPixi from './ColorInputPixi.svelte';
	import * as PIXI_Assets from '@pixi/assets';
	import * as PIXI from 'pixi.js';
	import { tick } from 'svelte';
	import { Graphics, Application, Sprite } from 'svelte-pixi';

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

	async function createIcon(base64) {}

	async function loadTexture(texId, result) {
		let newTexture;
		// Check: has the goysloppigus texture already been loaded?
		if (PIXI_Assets.Cache.has(result as string)) {
			newTexture = PIXI_Assets.Cache.get(result as string);
			iconTextureLookupTable[texId] = newTexture.textureCacheIds[1];
		} else {
			PIXI_Assets.Assets.add(texId, result as string);
			loadedTextures[texId] = await PIXI_Assets.Assets.load(texId);
			newTexture = loadedTextures[texId];
			iconTextureLookupTable[texId] = texId;
		}
		return newTexture
	}

	function newIcon() {
		//console.log(newIconFiles)

		Array.from(newIconFiles).forEach((file) => {
			let r = new FileReader();

			r.readAsDataURL(file);
			r.onload = async (eb) => {

				let iconName = file.name.split('.')[0];
				let texId = findID(IDify(iconName));

				let newTexture = loadTexture(texId, r.result);

				let newIcon: Icon = {
					display: iconName,
					texId: findID(IDify(iconName)),
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

	function generatePreview(icon: Icon) {
		//previewGraphics.clear();
		//previewGraphics.beginFill(DEFAULTBLANKHEXCOLOR);
		//previewGraphics.drawPolygon( getHexPathRadius(25, orientation, 0, 0) );
		//previewGraphics.endFill();

		previewSprite.texture = PIXI.Texture.from(icon.base64);
		previewSprite.scale.set(getIconScale(icon, 25).x);
		previewSprite.anchor.set(0.5);
		previewSprite.tint = icon.color;

		let p = app.renderer.extract.base64(previewSprite);

		return p;
	}

	$: {
		//if (selectedIcon) selectedIcon.preview = generatePreview(workingIconset.icons[stIndex])

		orientation = orientation;

		if (selectedIcon) {
			selectedIcon.preview = generatePreview(selectedIcon);
			selectedIcon.id = findID(IDify(selectedIcon.display));
		}
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
		workingIconset.id = IDify(workingIconset.name);

		download(JSON.stringify(workingIconset), workingIconset.name + '.hfis');
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
			<Application {app}>
				<Graphics
					draw={(g) => {
						g.clear();
						g.beginFill(DEFAULTBLANKHEXCOLOR);
						g.drawPolygon(getHexPathRadius(150, orientation, 150, 150));
						g.endFill();
					}}
				/>

				<Sprite
					texture={loadedTextures[iconTextureLookupTable[selectedIcon.texId]]}
					x={150}
					y={150}
					anchor={{ x: 0.5, y: 0.5 }}
					tint={selectedIcon.color}
					scale={getIconScale(selectedIcon)}
				/>
				</Application>

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
					<img src="/assets/img/tools/duplicate.png" alt="Hex Duplicate" />
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
			<div class="color" style="margin-bottom: 10px">
				<ColorInputPixi bind:value={selectedIcon.color} w={50} h={50} />

				<div>
					<p>Tint</p>
					<p class="color-string">{PIXI.utils.hex2string(selectedIcon.color)}</p>
				</div>
			</div>

			<div id="symbol-scale">
				Icon Scale
				<input type="range" min="5" max="100" bind:value={selectedIcon.pHex} />
				<input type="number" bind:value={selectedIcon.pHex} />%
			</div>
		</div>
	{:else}
		<div id="editor-placeholder">
			<p style="color: #f2f2f2; margin-bottom: 10px;">Select a icon or make a new one!</p>

			<p style="font-size: 10pt">For best results, use white 100px by 100px images.</p>
			<p style="font-size: 10pt">Hint: You can upload multiple images at once!</p>
		</div>
	{/if}
</main>

<style>
	#icon-controls {
		margin-top: 5px;
		display: flex;
		gap: 5px;
	}

	#icon-controls button {
		width: 40px;
		height: 40px;
		padding: 0px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#icon-controls button img {
		height: 80%;
	}

	#set-controls {
		padding: 10px;
		background-color: #555555;
		box-sizing: border-box;
	}

	#set-controls #grid {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto;
		gap: 5px;
	}

	#grid input {
		width: 100%;
		box-sizing: border-box;
	}

	.file-input-button {
		position: relative;
	}

	.file-input-button input {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0px;
		left: 0px;
		opacity: 0;
	}

	main {
		display: grid;
		grid-template-columns: 310px 1fr 1fr;
		grid-template-rows: 1fr;
		margin: 0;
		height: 100%;
		color: #f2f2f2;
	}

	#editor-placeholder {
		grid-column: 2/4;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	#editor-placeholder p {
		color: #aaaaaa;
		margin: 0;
	}

	#icon-preview {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	#icon-style {
		display: flex;
		justify-content: center;
		flex-direction: column;
		width: 50%;
	}

	nav {
		height: 100%;
		background-color: #222222;
	}

	#icon-buttons {
		padding: 10px;
		display: grid;
		gap: 10px;
		grid-template-columns: repeat(5, 50px);
		grid-template-rows: 50px;
		grid-auto-rows: 50px;
	}

	.icon-button {
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-button img {
		width: 100%;
	}

	.color {
		display: grid;
		grid-template-columns: 60px 1fr;
		grid-template-rows: 60px;
		column-gap: 10px;
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
		color: #bbbbbb;
	}
</style>
