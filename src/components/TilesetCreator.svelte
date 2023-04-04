<script lang="ts">
	import ColorInputPixi from '../components/ColorInputPixi.svelte';
	import type { hexOrientation } from '../helpers/hexHelpers';
	import { getHexPathRadius } from '../helpers/hexHelpers';
	import { download } from '../lib/download2';
	import type { Tile, TileSymbol, Tileset } from '../types/tilesets';
	import * as PIXI from 'pixi.js';
	import { afterUpdate, tick } from 'svelte';
	import CanvasHolder from './CanvasHolder.svelte';
	

	let app = new PIXI.Application({
		height: 300,
		width: 300,
		backgroundAlpha: 0,
	});

	export let appState;

	let orientation: hexOrientation = 'flatTop';
	let oldOrientation: hexOrientation = 'pointyTop';

	let workingTileset: Tileset = {
		name: 'New Tileset',
		id: 'new-tileset',
		author: '',
		version: 1,
		tiles: [],
	};

	let selectedTile: Tile | null = null;

	let previewSprite = new PIXI.Sprite();
	let previewGraphics = new PIXI.Graphics();
	let previewContainer = new PIXI.Container();
	previewContainer.addChild(previewGraphics, previewSprite);

	function findID(baseId: string): string {
		let counter = 0;
		let proposedId = `${IDify(workingTileset.name)}_${baseId}${counter == 0 ? '' : counter}`;

		while (workingTileset.tiles.find((tile: Tile) => tile.id == proposedId) != null) {
			counter++;
			proposedId = `${IDify(workingTileset.name)}_${baseId}${counter == 0 ? '' : counter}`;
		}

		return proposedId;
	}

	async function newTile() {
		let newTile: Tile = {
			display: 'New Hex',
			id: findID(IDify('new-hex')),
			symbol: null,
			bgColor: DEFAULTBLANKHEXCOLOR,
			preview: '',
		};

		newTile.preview = await generatePreview(newTile);

		workingTileset.tiles = [...workingTileset.tiles, newTile];

		selectedTile = workingTileset.tiles[workingTileset.tiles.length - 1];
	}

	function duplicateTile(tile: Tile) {
		let newTile = { ...tile };

		newTile.display = 'Copy of ' + tile.display;
		newTile.id = findID(IDify(newTile.display));

		workingTileset.tiles = [...workingTileset.tiles, newTile];
		selectedTile = workingTileset.tiles[workingTileset.tiles.length - 1];
	}

	function removeTile(tile: Tile) {
		workingTileset.tiles = workingTileset.tiles.filter((t: Tile) => t.id != tile.id);
	}

	async function generatePreview(tile: Tile) {
		previewGraphics.clear();
		previewGraphics.beginFill(tile.bgColor);
		previewGraphics.drawPolygon(getHexPathRadius(25, orientation, 0, 0));
		previewGraphics.endFill();

		previewSprite.texture = null;
		if (tile.symbol) {
			previewSprite.texture = PIXI.Texture.from(tile.symbol.base64);
			previewSprite.scale.set(getSymbolScale(tile.symbol, 25).x);
			previewSprite.anchor.set(0.5);
			previewSprite.tint = tile.symbol.color;
		}

		return await app.renderer.extract.base64(previewContainer);
	}

	function IDify(name: string): string {
		return name.toLowerCase().replace(' ', '-');
	}

	/*
	$: {
		//if (selectedTile) selectedTile.preview = generatePreview(workingTileset.tiles[stIndex])

		orientation = orientation; // This line ensures the preview gets updated

		if (oldOrientation == orientation) {
			oldOrientation = orientation == 'flatTop' ? 'pointyTop' : 'flatTop';
			workingTileset.tiles.forEach((tile) => (tile.preview = generatePreview(tile)));
		}

	}
	*/

	let symbolFiles = [];

	async function updateSymbolFile() {

		let r = new FileReader();
		r.readAsDataURL(symbolFiles[0]);
		r.onload = async (eb) => {

				let new_texture = await PIXI.Texture.from(r.result as string);

				selectedTile.symbol = {
					color: selectedTile.symbol ? selectedTile.symbol.color : 0xffffff,
					texWidth: new_texture.width,
					texHeight: new_texture.height,
					pHex: 80,
					base64: r.result as string,
				};

		};
	}

	function getSymbolScale(symbol: TileSymbol, radius = 150) {
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

	function exportTileset() {
		workingTileset.id = `${IDify(workingTileset.name)}_v${workingTileset.version}`;

		console.log(workingTileset)
		download(JSON.stringify(workingTileset), workingTileset.name + '.hfts', 'application/json');
	}

	let importFiles = [];

	async function importTileset() {
		let importFile = importFiles[0];

		if (!importFile) return;

		let r = new FileReader();
		r.readAsText(importFile);
		r.onload = async (eb) => {
			/* Read the file */
			let setToImport = JSON.parse(eb.target.result);

			//console.log(setToImport)

			/* Load textures */

			workingTileset = { ...setToImport };
			selectedTile = null;

			await tick();
			//workingTileset.tiles = workingTileset.tiles;
		};
	}


	// Dragging Code
	let phantomTileButtonId;

	function dragButton(e: DragEvent, tile: Tile) {
		//console.log(icon);

		phantomTileButtonId = tile.id;

		e.dataTransfer.setData('text/json', JSON.stringify(tile));
	}

	function dropButton(e: DragEvent) {
		phantomTileButtonId = null;
	}

	function draggedOverButton(e: DragEvent, tile: Tile) {
		if (tile.id == phantomTileButtonId) return;

		let draggedOverIndex = workingTileset.tiles.indexOf(tile);
		workingTileset.tiles = workingTileset.tiles.filter((i) => i.id != phantomTileButtonId);

		// If phantom is on the left, switch them. Otherwise, proceed as normal
		if (draggedOverIndex != 0 && workingTileset.tiles[draggedOverIndex - 1].id == phantomTileButtonId) {
			workingTileset.tiles.splice(draggedOverIndex + 1, 0, JSON.parse(e.dataTransfer.getData('text/json')));
		} else {
			workingTileset.tiles.splice(draggedOverIndex, 0, JSON.parse(e.dataTransfer.getData('text/json')));
		}

		workingTileset = workingTileset;
	}

	let pixi_tiles = {};

	let grph_hex = new PIXI.Graphics();
	let spr_hex_symbol = new PIXI.Sprite();

	app.stage.addChild(grph_hex, spr_hex_symbol)

	afterUpdate(async () => {
		if (selectedTile) {
			let new_preview = await generatePreview(selectedTile)
			if (selectedTile.preview != new_preview) {
				selectedTile.preview = new_preview
				workingTileset = workingTileset
			}

			grph_hex.clear();
			grph_hex.beginFill(selectedTile.bgColor);
			grph_hex.drawPolygon(getHexPathRadius(150, orientation, 150, 150));
			grph_hex.endFill();

			
			let spr_symbol = spr_hex_symbol
			spr_symbol.visible = false
			
			if (selectedTile.symbol) {
				spr_symbol.visible = true
				let symbol_texture = await PIXI.Texture.from(selectedTile.symbol.base64) 
				
				spr_symbol.texture = symbol_texture
				spr_symbol.x = 150
				spr_symbol.y = 150
				spr_symbol.anchor.x = 0.5
				spr_symbol.tint = selectedTile.symbol.color 
				spr_symbol.anchor.y = 0.5
				spr_symbol.scale = getSymbolScale(selectedTile.symbol)
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
					style="grid-column: 1/3;">Exit Tileset Builder</button
				>

				<label for="setName">Tileset Name</label>
				<input id="setName" type="text" bind:value={workingTileset.name} placeholder="Tileset Name" />

				<label for="setAuthor">Author</label>
				<input id="setAuthor" type="text" bind:value={workingTileset.author} placeholder="You!" />

				<label for="setVersion">Version</label>
				<input id="setVersion" type="number" bind:value={workingTileset.version} />

				<button on:click={() => importTileset()} class="file-input-button">
					Import
					<input
						type="file"
						bind:files={importFiles}
						accept={'.hfts'}
						on:change={(e) => {
							importTileset();
							e.target.value = '';
						}}
					/>
				</button>

				<button on:click={() => exportTileset()}>Export</button>
			</div>
		</div>

		<div id="tile-buttons"
			on:dragover={(e) => {
				e.preventDefault();
			}}
			on:dragenter={(e) => {
				e.preventDefault();
			}}
			on:drop={dropButton}
		>
			{#each workingTileset.tiles as tile (tile.id)}
				<button
					class="tile-button"
					class:selected={selectedTile == tile}
					style={tile.id == phantomTileButtonId ? 'opacity: 0' : ''}
					on:click={() => {
						selectedTile = tile;
					}}
					draggable={true}
					on:dragstart={(e) => {
						dragButton(e, tile);
					}}
					on:dragenter={(e) => {
						draggedOverButton(e, tile);
					}}
					title={tile.display}
				>
					<img src={tile.preview} alt="Button for {tile.display}" />
				</button>
			{/each}

			<button
				class="tile-button"
				on:click={() => {
					newTile();
				}}>+</button
			>
		</div>
	</nav>

	{#if selectedTile}
		<div id="tile-preview">
			<div id="pixi-container" style="height: 300px; width: 300px;">

				<CanvasHolder {app} />
				

			</div>

			<input
				type="text"
				bind:value={selectedTile.display}
				on:change={() => {
					workingTileset.tiles = workingTileset.tiles;
				}}
			/>

			<div id="tile-controls">
				<button
					on:click={() => {
						orientation = orientation == 'flatTop' ? 'pointyTop' : 'flatTop';
						generatePreview(selectedTile);
					}}
					title="Change Hex Orientation"
				>
					<img src="/assets/img/tools/changeOrientation.png" alt="Change Orientation" />
				</button>
				<button
					on:click={() => {
						duplicateTile(selectedTile);
					}}
					title="Duplicate this Hex"
				>
					<img src="/assets/img/tools/duplicate.png" alt="Hex Duplicate" />
				</button>
				<button
					on:click={() => {
						removeTile(selectedTile);
						selectedTile = null;
					}}
					title="Delete this Hex"
				>
					<img src="/assets/img/tools/trash.png" alt="Trash" />
				</button>
			</div>
			<!--
      <button on:click={() => {orientation = orientation == "flatTop" ? "pointyTop" : "flatTop"; workingTileset.tiles=workingTileset.tiles}}>Change Orientation</button>
      <button on:click={() => { deleteTile() } }>Delete Hex</button>
      <button on:click={() => { duplicateTile() }}> Duplicate Hex </button>
      -->
		</div>

		<div id="tile-style">
			<!-- Background Color -->
			<div class="color" style="margin-bottom: 10px">
				<ColorInputPixi bind:value={selectedTile.bgColor} w={50} h={50} />

				<div>
					<p>Background</p>
					<p class="color-string">{PIXI.utils.hex2string(selectedTile.bgColor)}</p>
				</div>
			</div>

			<!-- Symbol Filename 
        {#if workingTileset.tiles[stIndex].symbolFile}
        Current Symbol: {workingTileset.tiles[stIndex].symbolFile.name}
        {:else}
        <p>Current Symbol: —</p>
        {/if}
      -->

			<!-- File Upload Button -->
			<button class="file-input-button">
				Upload Symbol
				<input
					type="file"
					accept="image/*"
					bind:files={symbolFiles}
					on:change={(e) => {
						updateSymbolFile();
						e.target.value = ''; /*Hacky, but necessary*/
					}}
				/>
			</button>

			<!-- Symbol Input Controls 
      -->
			{#if selectedTile.symbol}
				<div class="color" style="margin-top: 10px">
					<ColorInputPixi bind:value={selectedTile.symbol.color} w={50} h={50} />

					<div>
						<p>Symbol</p>
						<p class="color-string">{PIXI.utils.hex2string(selectedTile.symbol.color)}</p>
					</div>
				</div>

				<div id="symbol-scale">
					Symbol Scale
					<input type="range" min="5" max="100" bind:value={selectedTile.symbol.pHex} />
					<input type="number" bind:value={selectedTile.symbol.pHex} />
				</div>
			{/if}
		</div>
	{:else}
		<div id="editor-placeholder">
			<p style="color: #f2f2f2; margin-bottom: 10px;">Select a tile or make a new one!</p>

			<p style="font-size: 10pt">For best results, use white 100px by 100px images for symbols.</p>
		</div>
	{/if}
</main>

<style>
	#symbol-scale {
		display: flex;
		flex-direction: column;
		margin-top: 10px;
	}

	#tile-controls {
		margin-top: 5px;
		display: flex;
		gap: 5px;
	}

	#tile-controls button {
		width: 40px;
		height: 40px;
		padding: 0px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#tile-controls button img {
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
	}

	#tile-preview {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	#tile-style {
		display: flex;
		justify-content: center;
		flex-direction: column;
		width: 50%;
	}

	nav {
		height: 100%;
		background-color: #222222;
	}

	#tile-buttons {
		padding: 10px;
		display: grid;
		gap: 10px;
		grid-template-columns: repeat(5, 50px);
		grid-template-rows: 50px;
		grid-auto-rows: 50px;
	}

	.tile-button {
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tile-button img {
		max-width: 100%;
		max-height: 100%;
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
