<script lang="ts">
	import Checkbox from '/src/components/Checkbox.svelte';
	import ColorInputPixi from '/src/components/ColorInputPixi.svelte';
	import SelectGrid from '/src/components/SelectGrid.svelte';
	import type { coordinates_data, terrain_data, trace_data } from '/src/types/data';
	import { map_type } from '/src/types/settings';
	import type { TerrainHexField } from '/src/types/terrain';
	import type { saveData } from '/src/lib/defaultSaveData';
	import { coord_system } from '/src/types/cordinates';
	import type { Iconset } from '/src/types/icon';
	import type { Tileset } from '/src/types/tilesets';
	import type TextLayer from 'src/layers/TextLayer.svelte';
	import type PathLayer from 'src/layers/PathLayer.svelte';
	import type IconLayer from 'src/layers/IconLayer.svelte';
	import type CoordsLayer from 'src/layers/CoordsLayer.svelte';
	import type * as PIXI from 'pixi.js'

	export let loadedSave: saveData;
	export let showSettings: boolean;
	export let appState;
	export let showTerrainGenerator: boolean;

	export let exportMap: Function;

	export let tfield: TerrainHexField;
	export let comp_terrainField: TerrainHexField;
	export let renderAllHexes: Function;
	export let renderGrid: Function;
	export let redrawEntireMap: Function;

	// For Coordinates
	export let comp_coordsLayer: CoordsLayer;
	export let data_coordinates: coordinates_data;

	//export let data_terrain: terrain_data
	export let loadedTilesets: Tileset[];
	export let addTilesetTextures: Function;
	export let loadedIconsets: Iconset[];
	export let addIconsetTextures: Function;

	export let L: PIXI.Loader

	export let comp_iconLayer: IconLayer;
	export let comp_pathLayer: PathLayer;
	export let comp_textLayer: TextLayer;

	export let load: Function;

	let exportType: 'Export As...' | 'image/png' | 'application/json' = 'Export As...';

	function changeOrientation() {
		let t = tfield.hexWidth;
		tfield.hexWidth = tfield.hexHeight;
		tfield.hexHeight = t;
		//tfield.hexWidth, tfield.hexHeight = tfield.hexHeight, tfield.hexWidth

		comp_terrainField.changeOrientation();

		//redrawEntireMap()
	}

	let addOrRemoveMapDimensions: 'add' | 'remove' = 'add';

	let tilesetFiles: FileList;

	function importTileset() {
		let importFile = tilesetFiles[0];

		if (!importFile) return;

		let r = new FileReader();
		r.readAsText(importFile);
		r.onload = (eb) => {
			/* Read the file */
			let setToImport = JSON.parse(eb.target.result);

			/* Check that set hasn't already been imported */
			if (loadedTilesets.find((ts: Tileset) => ts.id == setToImport.id) != null) {
				alert("You've already imported this tileset :)");
				return;
			}

			loadedTilesets.push(setToImport);
			loadedTilesets = loadedTilesets;

			/* We also have to load all of these textures */
			addTilesetTextures(setToImport, L);
		};
	}

	function removeTileset(setId: string) {
		//comp_terrainField.removeAllTilesOfSet(setId)

		// This line will need to change if the default tileset ever gets removeable
		//data_terrain.tile = {...loadedTilesets[0].tiles[0]}

		loadedTilesets = loadedTilesets.filter((ts: Tileset) => ts.id != setId);
	}

	let iconsetFiles: FileList;

	function importIconset() {
		let importFile = iconsetFiles[0];

		if (!importFile) return;

		let r = new FileReader();
		r.readAsText(importFile);
		r.onload = (eb) => {
			/* Read the file */
			let setToImport = JSON.parse(eb.target.result);

			/* Check that set hasn't already been imported */
			if (loadedTilesets.find((is: Iconset) => is.id == setToImport.id) != null) {
				alert("You've already imported this icon set :)");
				return;
			}

			loadedIconsets.push(setToImport);
			loadedIconsets = loadedIconsets;

			/* We also have to load all of these textures */
			addIconsetTextures(setToImport, L);
		};
	}

	function expandMapDimension(direction, amount) {
		comp_terrainField.square_expandMapDimension(direction, amount);

		let xMod = 0;
		let yMod = 0;

		switch (direction) {
			case 'left': {
				if (tfield.orientation == 'flatTop') {
					//pan.offsetX -= tfield.hexWidth * 0.75 * pan.zoomScale * amountOfHexes

					xMod = tfield.hexWidth * 0.75 * amount;

					if (amount % 2 == 1) {
						yMod = -tfield.hexHeight * 0.5 * (tfield.raised == 'odd' ? -1 : 1);
					}
				} else {
					xMod = tfield.hexWidth * amount;
				}
				break;
			}

			case 'top': {
				if (tfield.orientation == 'flatTop') {
					yMod = tfield.hexHeight * amount;
				} else {
					yMod = tfield.hexHeight * 0.75 * amount;

					if (amount % 2 == 1) {
						xMod = -tfield.hexWidth * 0.5 * (tfield.raised == 'odd' ? -1 : 1);
					}
				}
				break;
			}
		}

		comp_iconLayer.moveAllIcons(xMod, yMod);
		comp_pathLayer.moveAllPaths(xMod, yMod);
		comp_textLayer.moveAllTexts(xMod, yMod);
	}

	function reduceMapDimension(direction, amount) {
		if (direction == 'left' || direction == 'right') {
			if (tfield.columns <= amount) amount = tfield.columns - 1;
			if (amount == 0) return;
		}

		if (direction == 'top' || direction == 'bottom') {
			if (tfield.rows <= amount) amount = tfield.rows - 1;
			if (amount == 0) return;
		}

		comp_terrainField.square_reduceMapDimension(direction, amount);

		let xMod = 0;
		let yMod = 0;

		switch (direction) {
			case 'left': {
				if (tfield.orientation == 'flatTop') {
					//pan.offsetX -= tfield.hexWidth * 0.75 * pan.zoomScale * amountOfHexes

					xMod = -tfield.hexWidth * 0.75 * amount;

					if (amount % 2 == 1) {
						yMod = -tfield.hexHeight * 0.5 * (tfield.raised == 'odd' ? -1 : 1);
					}
				} else {
					xMod = -tfield.hexWidth * amount;
				}
				break;
			}

			case 'top': {
				if (tfield.orientation == 'flatTop') {
					yMod = -tfield.hexHeight * amount;
				} else {
					yMod = -tfield.hexHeight * 0.75 * amount;

					if (amount % 2 == 1) {
						xMod = -tfield.hexWidth * 0.5 * (tfield.raised == 'odd' ? -1 : 1);
					}
				}
				break;
			}
		}

		comp_iconLayer.moveAllIcons(xMod, yMod);
		comp_pathLayer.moveAllPaths(xMod, yMod);
		comp_textLayer.moveAllTexts(xMod, yMod);
	}

	let mapImportFiles: FileList;
	function importMap() {
		if (!mapImportFiles[0]) return;

		let r = new FileReader();
		r.readAsText(mapImportFiles[0]);
		r.onload = (eb) => {
			let saveData = JSON.parse(eb.target.result);
			//console.log(saveData)
			load(saveData, null);
		};
	}
</script>

<button
	id="close-tab"
	class:shown={showSettings}
	on:click={() => {
		showSettings = false;
	}}
	title={'Close Settings'}
>
	<img src="/assets/img/tools/back.png" alt={'Back'} />
</button>

<div id="settings" class:shown={showSettings}>
	<input
		style="font-size: 20pt; font-family: Segoe UI; border-radius: 3px; width: 100%; box-sizing: border-box;"
		type="text"
		placeholder="Map Title"
		bind:value={loadedSave.title}
	/>

	<!-- EXPORT / IMPORT -->
	<span style="display: grid; grid-template-columns: 1fr 1fr; margin-top: 5px; column-gap: 5px;">
		<select
			id="export-map-select"
			bind:value={exportType}
			title="Export"
			on:change={() => {
				exportMap(exportType);
				exportType = 'Export As...';
			}}
		>
			<option value={'Export As...'} style="display: none">Export As...</option>
			<option value={'image/png'}>PNG</option>
			<option value={'application/json'}>Hexfriend</option>
		</select>

		<button class="file-input-button" on:click={() => {}} title="Import">
			Import
			<input
				type="file"
				accept=".hexfriend"
				bind:files={mapImportFiles}
				on:change={() => {
					importMap();
				}}
			/>
		</button>
	</span>

	<h2>Grid</h2>
	<div class="settings-grid">
		<label for="showGrid">Show Grid</label>
		<Checkbox bind:checked={tfield.grid.shown} name={'showGrid'} />
		{#if tfield.grid.shown}
			<label for="gridThickness">Grid Thickness</label>
			<input
				id="gridThickness"
				type="number"
				bind:value={tfield.grid.thickness}
				on:change={() => {
					renderGrid();
				}}
			/>
			<label for="gridColor">Grid Color</label>
			<ColorInputPixi
				bind:value={tfield.grid.stroke}
				on:change={() => {
					renderGrid();
				}}
				name={'gridColor'}
			/>
		{/if}
	</div>

	<h2>Hexes</h2>
	<div class="settings-grid">
		<label for="blankHexColor">Blank Hex Color</label>
		<ColorInputPixi
			bind:value={tfield.blankHexColor}
			on:change={() => {
				renderAllHexes();
			}}
			name={'blankHexColor'}
		/>

		<button
			style={'margin-right: 10px'}
			on:click={() => {
				tfield.blankHexColor = 0xf2f2f2;
			}}>Reset to default color</button
		>
		<p />

		<p>Hex Orientation</p>
		<div style={'height: 100%; display: flex; align-items: center;'}>
			<SelectGrid
				values={['flatTop', 'pointyTop']}
				bind:value={tfield.orientation}
				on:change={() => {
					changeOrientation();
				}}
			/>
		</div>
		<label for="hexWidth">Hex Width</label>
		<input
			id="hexWidth"
			type="number"
			bind:value={tfield.hexWidth}
			on:change={() => {
				redrawEntireMap();
				comp_coordsLayer.updateAllCoordPositions();
			}}
		/>

		<label for="hexHeight">Hex Height</label>
		<input
			id="hexHeight"
			type="number"
			bind:value={tfield.hexHeight}
			on:change={() => {
				redrawEntireMap();
				comp_coordsLayer.updateAllCoordPositions();
			}}
		/>

		<!--
        <label for="mapType">Map Type</label>
        <select id="mapType" bind:value={tfield.mapType}>
            <option value={map_type.SQUARE}>Square</option>
            <option value={map_type.RADIAL}>Radial</option>
        </select>
        -->

		{#if tfield.mapType == map_type.SQUARE}
			{#if tfield.orientation == 'flatTop'}
				<p>Raised Column</p>
				<div style={'height: 100%; display: flex; align-items: center;'}>
					<SelectGrid
						values={['even', 'odd']}
						filenamePrefix={'raisedcolumn'}
						bind:value={tfield.raised}
						on:change={() => {
							comp_terrainField.square_updateRaisedColumn();
						}}
					/>
				</div>
			{:else if tfield.orientation == 'pointyTop'}
				<p>Indented Row</p>
				<div style={'height: 100%; display: flex; align-items: center;'}>
					<SelectGrid
						values={['even', 'odd']}
						filenamePrefix={'indentedrow'}
						bind:value={tfield.raised}
						on:change={() => {
							comp_terrainField.square_changeIndentedRow();
						}}
					/>
				</div>
			{/if}
		{/if}
	</div>

	<h2>Map Dimensions</h2>
	<section id="map-dimensions-container">
		<div id="map-dimensions">
			{#if addOrRemoveMapDimensions == 'add'}
				<button
					style="grid-area: left;"
					on:click={() => {
						expandMapDimension('left', 1);
					}}>Add<br />Left</button
				>
				<button
					style="grid-area: top;"
					on:click={() => {
						expandMapDimension('top', 1);
					}}>Add<br />Top</button
				>
				<button
					style="grid-area: bottom;"
					on:click={() => {
						expandMapDimension('bottom', 1);
					}}>Add<br />Bottom</button
				>
				<button
					style="grid-area: right;"
					on:click={() => {
						expandMapDimension('right', 1);
					}}>Add<br />Right</button
				>
				<button
					style="grid-area: center;"
					on:click={() => {
						addOrRemoveMapDimensions = 'remove';
					}}
				>
					<img src={`/assets/img/tools/addHex_${tfield.orientation == 'flatTop' ? 'ft' : 'pt'}.png`} alt={'Add Hex'} title={'Add Hex'} />
				</button>
			{:else}
				<button
					style="grid-area: left;"
					on:click={() => {
						reduceMapDimension('left', 1);
					}}>Remove<br />Left</button
				>
				<button
					style="grid-area: top;"
					on:click={() => {
						reduceMapDimension('top', 1);
					}}>Remove<br />Top</button
				>
				<button
					style="grid-area: bottom;"
					on:click={() => {
						reduceMapDimension('bottom', 1);
					}}>Remove<br />Bottom</button
				>
				<button
					style="grid-area: right;"
					on:click={() => {
						reduceMapDimension('right', 1);
					}}>Remove<br />Right</button
				>
				<button
					style="grid-area: center;"
					on:click={() => {
						addOrRemoveMapDimensions = 'add';
					}}
				>
					<img
						src={`/assets/img/tools/removeHex_${tfield.orientation == 'flatTop' ? 'ft' : 'pt'}.png`}
						alt={'Remove Hex'}
						title={'Remove Hex'}
					/>
				</button>
			{/if}
		</div>
	</section>

	<h2 style="margin-bottom: 0px;">Coordinates</h2>
	<p class="helperText">Coordinates can slow down map changes such as adding hexes or changing orientation.</p>
	<div class="settings-grid">
		<label for="showCoords">Show Coordinates</label>
		<Checkbox bind:checked={data_coordinates.shown} name={'showCoords'} />

		{#if data_coordinates.shown}
			<label for="coordsSystem"
				>Coordinate System<sup
					><a href="https://www.redblobgames.com/grids/hexagons/#coordinates" target="_blank" title="Hex Coordinate Systems Explanation"
						>?</a
					></sup
				></label
			>
			<select id="coordsSystem" bind:value={data_coordinates.system} on:change={comp_coordsLayer.updateAllCoordsText()}>
				<option value={coord_system.ROWCOL}>Column, Row</option>
				<option value={coord_system.AXIAL}>Axial</option>
				<option value={coord_system.CUBE}>Cube</option>
			</select>

			<label for="coordsFill">Color</label>
			<ColorInputPixi bind:value={data_coordinates.style.fill} name={'coordsFill'} />

			<label for="coordFontSize">Font Size</label>
			<input id="coordFontSize" type="number" bind:value={data_coordinates.style.fontSize} />

			<label for="coordsOutline">Outline Color</label>
			<ColorInputPixi bind:value={data_coordinates.style.stroke} name={'coordsOutline'} />

			<label for="coordsStrokeThickness">Outline Thickness</label>
			<input id="coordsStrokeThickness" type="number" bind:value={data_coordinates.style.strokeThickness} />

			<label for="coordSeperator">Seperator</label>
			<input
				id="coordSeperator"
				type="text"
				bind:value={data_coordinates.seperator}
				on:change={() => {
					comp_coordsLayer.updateAllCoordsText();
				}}
			/>

			<label for="coordGap">Gap</label>
			<input
				id="coordGap"
				type="number"
				bind:value={data_coordinates.gap}
				on:change={() => {
					comp_coordsLayer.updateAllCoordPositions();
				}}
			/>
		{/if}
	</div>

	<h2>Tilesets</h2>
	<div id="tilesets">
		{#each loadedTilesets as tileset (tileset.id)}
			<div class="loaded-tileset">
				{tileset.name}

				{#if tileset.id != 'default'}
					<button
						on:click={() => {
							removeTileset(tileset.id);
						}}
					>
						<img src="/assets/img/tools/trash.png" alt={'Trash'} title={'Remove Tileset'} />
					</button>
				{/if}
			</div>
		{/each}

		<span>
			<button class="file-input-button"
				>Import Tileset <input
					type="file"
					bind:files={tilesetFiles}
					on:change={() => {
						importTileset();
					}}
				/></button
			>
			<button
				on:click={() => {
					appState = 'tilesetCreator';
				}}>Tileset Builder</button
			>
		</span>
	</div>

	<h2>Icon Sets</h2>
	<div id="iconsets">
		{#each loadedIconsets as iconset (iconset.id)}
			<div class="loaded-tileset">
				{iconset.name}

				{#if iconset.id != 'default'}
					<button> <img src="/assets/img/tools/trash.png" alt={'Trash'} title={'Remove Iconset'} /> </button>
				{/if}
			</div>
		{/each}

		<span>
			<button class="file-input-button"
				>Import Iconset <input
					type="file"
					accept=".hfis"
					bind:files={iconsetFiles}
					on:change={() => {
						importIconset();
					}}
				/></button
			>
			<button
				on:click={() => {
					appState = 'iconsetCreator';
				}}>Iconset Builder</button
			>
		</span>
	</div>

	<h2>Experimental</h2>
	<p class="helperText">Not polished and maybe broken.</p>

	<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
		<button
			on:click={() => {
				showTerrainGenerator = true;
				showSettings = false;
			}}
			title={'Coming soon!'}
		>
			Generate Terrain
		</button>
	</div>

	<h2>About</h2>
	<p class="helperText">
		Hexfriend version 1.1 – "Em Vee Pee"
		<br />
		By Aidymouse and all the wonderful contributors
	</p>

	<p class="helperText">
		Hexfriend is built with Svelte, Pixi JS and Typescript. Check out the <a href="https://www.github.com/Aidymouse/Hexfriend">Github</a>
	</p>

	<p class="helperText" style="text-align: center; font-size: 20pt;">☺</p>
</div>

<style>
	a {
		color: #8cc63f;
	}

	a:visited {
		color: #8cc63f;
	}

	#export-map-select {
		border: solid 1px #777777;
		border-radius: 3px;
		background-color: #333333;
		color: white;
		padding: 5px;
		transition-duration: 0.2s;

		text-align: center;
	}

	#export-map-select:hover {
		background-color: #555555;
	}

	#iconsets {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 30px;
		grid-auto-rows: 30px;
		row-gap: 5px;
	}

	#tilesets {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 30px;
		grid-auto-rows: 30px;
		row-gap: 5px;
	}

	#tilesets span,
	#iconsets span {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 5px;
	}

	.loaded-tileset {
		background-color: #555555;
		padding: 5px;
		border-radius: 4px;
		position: relative;
	}

	.loaded-tileset:hover button {
		opacity: 1;
	}

	.loaded-tileset button {
		opacity: 0;
		position: absolute;
		height: 100%;
		top: 0px;
		right: 0px;
		width: 30px;
		padding: 0;
		border: none;
		border-top-left-radius: 0px;
		border-bottom-left-radius: 0px;
		border: solid 1px #555555;
	}

	.loaded-tileset button img {
		width: 80%;
		height: auto;
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

	#map-dimensions-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#map-dimensions {
		display: grid;

		grid-template-columns: 60px 60px 60px;
		grid-template-rows: 60px 60px 60px;
		gap: 5px;

		grid-template-areas:
			'top-left top top-right'
			'left center right'
			'bottom-left bottom bottom-right';
	}

	#map-dimensions button {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#map-dimensions button img {
		width: 90%;
		height: auto;
	}

	h2 {
		margin-bottom: 10px;
	}

	button.shown {
		left: 275px !important;
	}

	#settings.shown {
		left: 0px !important;
	}

	.helperText {
		font-size: 12px;
		color: #999999;
		line-height: 1.2;
		margin: 0;
		margin-bottom: 5px;
		margin-top: 5px;
		font-style: oblique;
	}

	.settings-grid {
		display: grid;
		grid-template-columns: 3fr 2fr;
		grid-template-rows: auto;
		row-gap: 5px;
	}

	.settings-grid input {
		width: 50px;
	}

	p {
		margin: 0;
	}

	#settings {
		position: absolute;
		top: 0;
		left: -325px;
		width: 300px;
		height: 100%;
		background: #333333;

		padding: 10px;
		box-sizing: border-box;

		overflow-y: scroll;
		overflow-x: hidden;
		transition-duration: 0.2s;
	}

	#close-tab {
		position: absolute;
		left: -50px;

		top: calc(50% - 25px);

		width: 50px;
		height: 50px;
		border-radius: 50%;
		border: none;
		background: #333333;
	}

	#close-tab:hover {
		background: #555555;
	}

	#close-tab img {
		margin: 0;
		width: 50%;
		margin-left: 50%;
	}
</style>
