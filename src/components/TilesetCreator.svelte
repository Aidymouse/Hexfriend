<script lang="ts">
	
	// TYPES
	import type { Tile, TileSymbol, Tileset } from '../types/tilesets';
	
	interface working_tile {
		display: string;
		bgColor: number;
		id: string; 
		symbol: TileSymbol | null;
	}

	interface working_tileset {
		name: string;
		id: string;
		author: string;
		version: number;
		tiles: working_tile[];
	}

	// ENUMS
	import { hex_orientation } from '../types/terrain';
	
	// COMPONENTS
	import ColorInputPixi from './ColorInputPixi.svelte';
	import CanvasHolder from './CanvasHolder.svelte';

	// HELPER
	import { getHexPathRadius } from '../helpers/hexHelpers';
	
	import { tl } from '../stores/translation';
	
	// LIB
	import { download } from '../lib/download2';
	import * as PIXI from 'pixi.js';
	import { afterUpdate, tick } from 'svelte';
	

	let app = new PIXI.Application({
		height: 300,
		width: 300,
		backgroundAlpha: 0,
	});

	export let appState;

	let texture_register = {} // texture_id: texture

	let orientation: hex_orientation = hex_orientation.FLATTOP;

	let workingTileset: working_tileset = {
		name: 'New Tileset',
		id: 'new-tileset',
		author: '',
		version: 1,
		tiles: [],
	};

	

	let selectedTile: working_tile | null = null;

	let previewSprite = new PIXI.Sprite();
	let previewGraphics = new PIXI.Graphics();
	let previewContainer = new PIXI.Container();
	previewContainer.addChild(previewGraphics, previewSprite);

	function findID(baseId: string): tile_id {
		baseId = IDify(baseId)
		
		let counter = 0;
		let counter_suffix = counter == 0 ? '' : counter
		let proposedId = `${baseId}${counter_suffix}`;
		
		while (workingTileset.tiles.find((tile: working_tile) => tile.id == proposedId) != null) {
			counter++;
			counter_suffix = counter == 0 ? '' : counter
			proposedId = `${baseId}${counter_suffix}`;
		}

		return proposedId;
	}

	async function newTile() {
		let newTile: working_tile = {
			display: 'New Hex',
			id: findID('New Hex'),
			symbol: null,
			bgColor: DEFAULTBLANKHEXCOLOR,
		};

		newTile.preview = await generatePreview(newTile);

		workingTileset.tiles = [...workingTileset.tiles, newTile];

		selectedTile = workingTileset.tiles[workingTileset.tiles.length - 1];
	}

	function duplicateTile(tile: working_tile) {
		let newTile = { ...tile, symbol: tile.symbol ? { ...tile.symbol } : null };

		newTile.display = 'Copy of ' + tile.display;
		newTile.id = findID(newTile.display);

		workingTileset.tiles = [...workingTileset.tiles, newTile];
		selectedTile = workingTileset.tiles[workingTileset.tiles.length - 1];
	}

	function removeTile(tile: working_tile) {
		workingTileset.tiles = workingTileset.tiles.filter((t: Tile) => t.id != tile.id);
	}

	async function generatePreview(tile: working_tile) {
		previewGraphics.clear();
		previewGraphics.beginFill(tile.bgColor);
		previewGraphics.drawPolygon(getHexPathRadius(25, orientation, 0, 0));
		previewGraphics.endFill();

		previewSprite.texture = null;
		if (tile.symbol) {
			previewSprite.texture = await PIXI.Assets.load(tile.symbol.base64);
			previewSprite.scale.set(getSymbolScale(tile.symbol, 25).x);
			previewSprite.anchor.set(0.5);
			previewSprite.tint = tile.symbol.color;
		}

		return await app.renderer.extract.base64(previewContainer);
	}

	function IDify(name: string): string {
		return name.toLowerCase().replaceAll(' ', '-');
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

				let new_texture = await PIXI.Assets.load(r.result as string);

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
		let export_tileset: Tileset = workingTileset as Tileset

		// Transformations into real tile and tileset data structures
		export_tileset.id = IDify(workingTileset.name);
		
		export_tileset.tiles.forEach(tile => {
			tile.id = findID(tile.display)
			tile.tileset_id = export_tileset.id
		})

		console.log(export_tileset)
		download(JSON.stringify(export_tileset),  `${export_tileset.id}.hfts`, 'application/json');
	}

	let importFiles = [];

	async function importTileset() {
		let importFile = importFiles[0];

		if (!importFile) return;

		let r = new FileReader();
		r.readAsText(importFile);
		r.onload = async (eb) => {
			/* Read the file */
			let setToImport = JSON.parse(eb.target.result as string);

			//console.log(setToImport)

			/* Load textures */

			workingTileset = { ...setToImport };
			selectedTile = null;

			await tick();
			//workingTileset.tiles = workingTileset.tiles;
		};
	}


	// Dragging Code
	// Has a problem where the tile is deselected after dropping. What???
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
				let symbol_texture = await PIXI.Assets.load(selectedTile.symbol.base64) 
				
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
				<button	on:click={() => {appState = 'normal';}}	style="grid-column: 1/3;">
					{$tl.builders.tileset_builder.exit}
				</button>

				<label for="setName">{$tl.builders.tileset_builder.name}</label>
				<input id="setName" type="text" bind:value={workingTileset.name} placeholder="Tileset Name" />

				<label for="setAuthor">{$tl.builders.author}</label>
				<input id="setAuthor" type="text" bind:value={workingTileset.author} placeholder="You!" />

				<label for="setVersion">{$tl.builders.version}</label>
				<input id="setVersion" type="number" bind:value={workingTileset.version} />

				<button on:click={() => importTileset()} class="file-input-button">
					{$tl.builders.import}
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

				<button on:click={() => exportTileset()}>{$tl.builders.export}</button>
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
					class="outline-button"
					on:click={() => {
						orientation = orientation == hex_orientation.FLATTOP ? hex_orientation.POINTYTOP : hex_orientation.FLATTOP;
						generatePreview(selectedTile);
					}}
					title={$tl.builders.change_orientation}
				>
					<img src="/assets/img/tools/changeOrientation.png" alt="Change Orientation" />
				</button>
				<button
					class="outline-button"
					on:click={() => {
						duplicateTile(selectedTile);
					}}
					title={$tl.builders.duplicate}
				>
					<img src="/assets/img/tools/duplicate.png" alt="Hex Duplicate" />
				</button>
				<button
					class="outline-button"
					on:click={() => {
						removeTile(selectedTile);
						selectedTile = null;
					}}
					title={$tl.builders.tileset_builder.delete}
				>
					<img src="/assets/img/tools/trash.png" alt="Trash" />
				</button>
			</div>

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

			<!-- File Upload Button -->
			<button class="file-input-button outline-button">
				{$tl.builders.tileset_builder.upload_symbol}
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

			<!-- Symbol Input Controls -->
			{#if selectedTile.symbol}
				<div class="color" style="margin-top: 10px">
					<ColorInputPixi bind:value={selectedTile.symbol.color} w={50} h={50} />

					<div>
						<p>{$tl.builders.tileset_builder.symbol}</p>
						<p class="color-string">{PIXI.utils.hex2string(selectedTile.symbol.color)}</p>
					</div>
				</div>

				<div id="symbol-scale">
					{$tl.builders.tileset_builder.symbol_scale}
					<input type="range" min="5" max="100" bind:value={selectedTile.symbol.pHex} />
					<input type="number" bind:value={selectedTile.symbol.pHex} />
				</div>
			{/if}
		</div>
	
	
	
	{:else}

		<div id="editor-placeholder">
			<p style="color: #f2f2f2; margin-bottom: 10px;">{$tl.builders.tileset_builder.helptext}</p>

			<p style="font-size: 10pt">{$tl.builders.tileset_builder.helpsubtitle}</p>
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
