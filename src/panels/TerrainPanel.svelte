<script lang="ts">
	import ColorInputPixi from '../components/ColorInputPixi.svelte';
	import { getHexPath } from '../helpers/hexHelpers';
	import * as PIXI from 'pixi.js';
	import type { terrain_data } from '../types/data';
	import type { terrain_field } from '../types/terrain';
	import type { Tile, Tileset } from '../types/tilesets';

	export let loadedTilesets: Tileset[];
	export let data_terrain: terrain_data;

	export let tfield: terrain_field;
	export let app: PIXI.Application;
	export let L: PIXI.Loader;

	export let symbolTextureLookupTable: {[key: string]: string};

	$: {
		tilePreview = generateTilePreview(data_terrain);
		loadedTilesets = loadedTilesets;

		tfield.orientation = tfield.orientation;
	}

	// Used for previews
	let g = new PIXI.Graphics();
	let s = new PIXI.Sprite();
	let c = new PIXI.Container();
	c.addChild(g).addChild(s);

	let tilePreview: string = generateTilePreview(data_terrain);

	function changeTile(t: Tile) {
		data_terrain.tile = { ...t, symbol: t.symbol ? { ...t.symbol } : null };
		tilePreview = generateTilePreview(data_terrain);
		data_terrain.usingPaintbucket = false;
		data_terrain.usingEraser = false;
	}

	function getSymbolTextureId(tileId: string) {
		// If tileId appears in the lookup table, use the lookup table version instead
		if (Object.keys(symbolTextureLookupTable).find((k) => k == tileId)) {
			return symbolTextureLookupTable[tileId];
		}

		return tileId;
	}

	function findSymbolScale(symbol, hexWidth: number, hexHeight: number) {
		if (hexWidth < hexHeight) {
			let s = (hexWidth * symbol.pHex) / 100 / symbol.texWidth;
			return {
				x: s,
				y: s,
			};
		} else {
			let s = (hexHeight * symbol.pHex) / 100 / symbol.texHeight;
			return {
				x: s,
				y: s,
			};
		}
	}

	function generateTilePreview(data_terrain: terrain_data) {
		g.clear();
		g.beginFill(data_terrain.tile ? data_terrain.tile.bgColor : tfield.blankHexColor);

		let hexWidth = 50;
		let hexHeight = 45;

		if (tfield.orientation == 'pointyTop') {
			hexWidth = 45;
			hexHeight = 50;
		}

		g.drawPolygon(getHexPath(hexWidth, hexHeight, tfield.orientation, 0, 0));
		g.endFill();

		if (data_terrain.tile && data_terrain.tile.symbol) {
			s.texture = L.resources[getSymbolTextureId(data_terrain.tile.id)].texture;
			s.tint = data_terrain.tile.symbol.color;
			s.scale = findSymbolScale(data_terrain.tile.symbol, hexWidth, hexHeight);
			s.anchor.set(0.5);
		} else {
			s.texture = null;
		}

		let b64 = app.renderer.plugins.extract.base64(c); //PIXI.autoDetectRenderer().plugins.extract.base64(c)

		return b64;
	}

	function styleMatchesData(tile: Tile): boolean {
		return tilesMatch(tile, data_terrain.tile);
	}

	function tilesMatch(tile1: Tile, tile2: Tile): boolean {
		if (tile1 == null && tile2 != null) return false;
		if (tile1 != null && tile2 == null) return false;

		if (tile1 == null && tile2 == null) return true; // Both are blank

		// Return false if one has a symbol and one does not
		if (tile1.symbol != null && tile2.symbol == null) return false;
		if (tile1.symbol == null && tile2.symbol != null) return false;

		if (tile1.bgColor != tile2.bgColor) return false;

		if (tile1.symbol && tile2.symbol) {
			if (tile1.symbol.color != tile2.symbol.color) return false;
			if (getSymbolTextureId(tile1.id) != getSymbolTextureId(tile2.id)) return false;
		}

		return true;
	}
</script>

<div class="panel">
	<div id="terrain-preview">
		<div id="preview-image-centerer">
			<img
				src={tilePreview}
				alt={'Current Tile Preview'}
				class:flatTop={tfield.orientation == 'flatTop'}
				class:pointyTop={tfield.orientation == 'pointyTop'}
			/>
		</div>

		<ColorInputPixi bind:value={data_terrain.tile.bgColor} id={'terrainColor'} label={'Terrain Color'} />

		{#if data_terrain.tile.symbol}
			<ColorInputPixi bind:value={data_terrain.tile.symbol.color} id={'symbolColor'} label={'Symbol Color'} />
		{/if}

		<button
			id="eyedropper"
			class="small-panel-button"
			title={'Hex Eyedropper'}
			on:click={() => {
				data_terrain.usingEyedropper = !data_terrain.usingEyedropper;
			}}
			class:selected={data_terrain.usingEyedropper}
		>
			<img src="/assets/img/tools/eyedropper.png" alt={'Eyedropper'} />
		</button>
		<button
			id="paintbucket"
			class="small-panel-button"
			title={'Hex Paintbucket'}
			on:click={() => {
				data_terrain.usingPaintbucket = !data_terrain.usingPaintbucket;
			}}
			class:selected={data_terrain.usingPaintbucket}
		>
			<img src="/assets/img/tools/paintbucket.png" alt={'Paint Bucket'} />
		</button>
		<button
			id="eraser"
			class="small-panel-button"
			title={'Hex Eraser'}
			on:click={() => {
				data_terrain.usingEraser = !data_terrain.usingEraser;
			}}
			class:selected={data_terrain.usingEraser}
		>
			<img src="/assets/img/tools/eraser.png" alt={'Eraser'} />
		</button>
	</div>

	<div id="buttons">
		{#each loadedTilesets as tileset (tileset.id)}
			{#if tileset.id != 'default'}
				<h2>{tileset.name}</h2>
			{/if}
			<div class="button-grid">
				{#each tileset.tiles as tile (tile.id)}
					<button title={tile.display} on:click={() => changeTile(tile)} class:selected={styleMatchesData(tile)}
						><img src={tile.preview} alt={tile.display} /></button
					>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
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
		width: 80% !important;
	}

	#eyedropper {
		right: 10px;
	}

	#paintbucket {
		right: 10px;
		top: 45px;
	}

	#eraser {
		right: 45px;
	}

	#terrain-preview {
		display: grid;
		grid-template-columns: 60px 1fr;
		grid-template-rows: 30px 30px;
		column-gap: 5px;
		padding: 10px;
		background-color: #333333;
	}

	.button-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		grid-template-rows: 50px;
		grid-auto-rows: 50px;
		gap: 5px;
	}

	#buttons h2 {
		border-color: #333333;
		margin-bottom: 5px;
		margin-top: 10px;
	}

	#buttons {
		background-color: #555555;
		padding: 10px;
	}

	#buttons button {
		box-sizing: border-box;
		padding: 5px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#buttons button img {
		width: 90%;
	}

	#preview-image-centerer {
		grid-row: 1/3;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#terrain-preview img.flatTop {
		width: 60px;
	}

	#terrain-preview img.pointyTop {
		height: 60px;
	}

	.selected {
		outline-style: solid;
		outline-color: #8cc63f;
		outline-width: 1px;
		border-color: #8cc63f;
	}
</style>
