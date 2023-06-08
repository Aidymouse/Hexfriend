<script lang="ts">
	import ColorInputPixi from '../components/ColorInputPixi.svelte';
	import { getHexPath } from '../helpers/hexHelpers';
	import { get_symbol_texture } from '../lib/texture_loader';
	import * as store_tfield from '../stores/tfield';
	import type { terrain_data } from '../types/data';
	import type { terrain_field } from '../types/terrain';
	import type { Tile, TileSymbol, Tileset } from '../types/tilesets';
	import * as PIXI from 'pixi.js';
	import { afterUpdate, onMount } from 'svelte';
	import { LATESTDEFAULTTILESVERSION } from '../types/savedata';

	export let loadedTilesets: Tileset[];
	export let data_terrain: terrain_data;

	let tfield: terrain_field;
	store_tfield.store.subscribe((newTField) => {
		tfield = newTField;
	});

	export let app: PIXI.Application;

	// Used for previews
	let g = new PIXI.Graphics();
	let s = new PIXI.Sprite();
	let c = new PIXI.Container();
	c.addChild(g, s);

	let tilePreview: string; //generateTilePreview(data_terrain);

	async function changeTile(t: Tile) {
		data_terrain.tile = { ...t, symbol: t.symbol ? { ...t.symbol } : null };
		tilePreview = await generateTilePreview(data_terrain); // Not entirely sure why we have to await here when we already await in the function, but fuck it, it works
		data_terrain.usingPaintbucket = false;
		data_terrain.usingEraser = false;
	}

	function findSymbolScale(symbol: TileSymbol, hexWidth: number, hexHeight: number) {
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

	async function generateTilePreview(data_terrain: terrain_data) {
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
			s.texture = get_symbol_texture(data_terrain.tile.id);
			s.tint = data_terrain.tile.symbol.color;
			s.scale = findSymbolScale(data_terrain.tile.symbol, hexWidth, hexHeight);
			s.anchor.set(0.5);
		} else {
			s.texture = null;
		}

		let b64 = await app.renderer.extract.base64(c); //PIXI.autoDetectRenderer().plugins.extract.base64(c)

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
			if (get_symbol_texture(tile1.id) != get_symbol_texture(tile2.id)) return false;
		}

		return true;
	}

	afterUpdate(async () => {
		loadedTilesets = loadedTilesets;
		tfield.orientation = tfield.orientation;

		tilePreview = await generateTilePreview(data_terrain);
	});

	onMount(async () => {
		tilePreview = await generateTilePreview(data_terrain);
	});
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

		<span class="terrain-preview-control-row">
			<ColorInputPixi bind:value={data_terrain.tile.bgColor} id={'terrainColor'} label={'Terrain Color'} />
			<label for="terrainColor">Terrain Color</label>
		</span>

		{#if data_terrain.tile.symbol}
			<span class="terrain-preview-control-row">
				<ColorInputPixi bind:value={data_terrain.tile.symbol.color} id={'symbolColor'} label={'Symbol Color'} />
				<label for="symbolColor">Symbol Color</label>
			</span>
		{/if}
	</div>

	<div id="buttons" class="scroll-container">
		{#each loadedTilesets as tileset (tileset.id)}
			{#if loadedTilesets.length > 1 || tileset.collapsed}
				<h2 class="tileset-heading">
					{tileset.name}
					<button
						on:click={() => {
							tileset.collapsed = !tileset.collapsed;
						}}><img alt="Toggle Tileset Visibility" src={'/assets/img/ui/arrow.png'} class:rotated={tileset.collapsed} /></button
					>
				</h2>
			{/if}
			<div class="button-grid" class:hidden={tileset.collapsed}>
				{#each tileset.tiles as tile (tile.id)}
					<button
						class="tile-button"
						title={tile.display}
						on:click={async () => {
							await changeTile(tile);
						}}
						class:selected={styleMatchesData(tile)}><img src={tile.preview} alt={tile.display} /></button
					>
				{/each}
			</div>
		{/each}
	</div>

	<!-- This keeps the selector around. Hacky but... works! -->
	<div class="hidden" />
</div>

<style>
	.terrain-preview-control-row {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.hidden {
		display: none !important;
	}

	.tileset-heading {
		display: flex;
		position: relative;
	}

	.tileset-heading button {
		position: absolute;
		margin: 0.25em;
		margin-bottom: calc(0.25em + 5px);
		box-sizing: border-box;
		right: 0;
		display: flex;
		height: 80%;
		top: 0;
		width: 3em;
		justify-content: center;
		align-items: center;
	}

	.tileset-heading button img {
		height: 100%;
		transition-duration: 0.2s;
	}

	.tileset-heading button img.rotated {
		rotate: -180deg;
	}

	.panel {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr;
	}

	.scroll-container {
		min-height: 30%;
		max-height: 100%;
		height: auto;
		overflow-y: scroll;
	}

	#terrain-preview {
		display: grid;
		grid-template-columns: 4em 1fr;
		grid-template-rows: 2em 2em;
		gap: 0.5em;
		background-color: var(--primary-background);
		padding: 1em;
	}

	#preview-image-centerer {
		grid-row: 1/3;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#terrain-preview img.flatTop {
		width: 100%;
	}

	#terrain-preview img.pointyTop {
		height: 100%;
	}

	.button-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-template-rows: auto;
		grid-auto-rows: auto;
		gap: 0.25em;
	}

	#buttons h2 {
		border-color: var(--primary-background);
		margin-bottom: 0.3125em;
		margin-top: 0.625em;
	}

	#buttons {
		background-color: var(--light-background);
		padding: 0.625em;
	}

	#buttons .tile-button {
		aspect-ratio: 1/1;
		box-sizing: border-box;
		padding: 0.3125em;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#buttons .tile-button img {
		width: 90%;
	}
</style>
