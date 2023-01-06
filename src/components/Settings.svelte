<script lang="ts">
	// Components
	import Checkbox from './Checkbox.svelte';
	import ColorInputPixi from './ColorInputPixi.svelte';
	import SelectGrid from './SelectGrid.svelte';
	
	// Lib
	import type * as PIXI from 'pixi.js';
	import * as texture_loader from '../lib/texture_loader';
	
	// Stores
	import * as store_tfield from '../stores/tfield';
	
	// Types
	import type CoordsLayer from '../layers/CoordsLayer.svelte';
	import type IconLayer from '../layers/IconLayer.svelte';
	import type PathLayer from '../layers/PathLayer.svelte';
	import type TerrainLayer from '../layers/TerrainLayer.svelte';
	import type TextLayer from '../layers/TextLayer.svelte';
	import type { coordinates_data, overlay_data, terrain_data, trace_data } from '../types/data';
	import type { Iconset } from '../types/icon';
	import type { save_data } from '../types/savedata';
	import type { Tileset } from '../types/tilesets';
	
	// Enums
	import { coord_system } from '../types/coordinates';
	import { map_shape } from '../types/settings';
	import { hex_orientation, terrain_field } from '../types/terrain';
	import { hex_raised } from '../types/terrain';
	import { store_selected_tool } from '../stores/tools';
	import { tools } from '../types/toolData';
	
	export let loadedSave: save_data;
	export let showSettings: boolean;
	export let appState;
	export let showTerrainGenerator: boolean;

	export let exportMap: Function;

	let hidden_settings = {
		grid: true,
		hexes: true,
		dimensions: true,
		coordinates: true,
		overlay: true,
		tilesets: true,
		iconsets: true,
		experimental: true,

	}

	let tfield: terrain_field;
	store_tfield.store.subscribe((newTField) => {
		tfield = newTField;
	});

	$: store_tfield.store.update(() => {
		return tfield;
	});

	export let renderAllHexes: Function;
	export let renderGrid: Function;
	export let redrawEntireMap: Function;
	
	// For Coordinates
	export let comp_coordsLayer: CoordsLayer;
	export let data_coordinates: coordinates_data;
	export let data_overlay: overlay_data;
	
	//export let data_terrain: terrain_data
	export let loadedTilesets: Tileset[];
	export let loadedIconsets: Iconset[];
	
	export let comp_terrainLayer: TerrainLayer;
	export let comp_iconLayer: IconLayer;
	export let comp_pathLayer: PathLayer;
	export let comp_textLayer: TextLayer;

	export let load: Function;

	let retainIconPosition: boolean = true;

	let exportType: 'Export As...' | 'image/png' | 'application/json' = 'Export As...';

	let iconset_text = "Icon Set";

	function changeOrientation() {
		let t = tfield.hexWidth;
		tfield.hexWidth = tfield.hexHeight;
		tfield.hexHeight = t;
		//tfield.hexWidth, tfield.hexHeight = tfield.hexHeight, tfield.hexWidth

		comp_terrainLayer.changeOrientation();

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
			//addTilesetTextures(setToImport, L);
			texture_loader.load_tileset_textures(setToImport)
		};
	}

	function removeTileset(setId: string) {
		//comp_terrainLayer.removeAllTilesOfSet(setId)

		// This line will need to change if the default tileset ever gets removeable
		//data_terrain.tile = {...loadedTilesets[0].tiles[0]}

		loadedTilesets = loadedTilesets.filter((ts: Tileset) => ts.id != setId);
		loadedSave.tilesets = loadedTilesets
	}

	function removeIconset(setId: string) {
		loadedIconsets = loadedIconsets.filter((is: Iconset) => is.id != setId);
		loadedSave.iconsets = loadedIconsets
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
			if (loadedIconsets.find((is: Iconset) => is.id == setToImport.id) != null) {
				alert("You've already imported this icon set :)");
				return;
			}

			loadedIconsets.push(setToImport);
			loadedIconsets = loadedIconsets;

			/* We also have to load all of these textures */
			//addIconsetTextures(setToImport, L);
			texture_loader.load_iconset_textures(setToImport);
		};
	}

	/* Map Dimensions and Map Shape */
	function square_expandMapDimension(direction, amount) {
		comp_terrainLayer.square_expandMapDimension(direction, amount);

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

	function square_reduceMapDimension(direction, amount) {
		if (direction == 'left' || direction == 'right') {
			if (tfield.columns <= amount) amount = tfield.columns - 1;
			if (amount == 0) return;
		}

		if (direction == 'top' || direction == 'bottom') {
			if (tfield.rows <= amount) amount = tfield.rows - 1;
			if (amount == 0) return;
		}

		comp_terrainLayer.square_reduceMapDimension(direction, amount);

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

	function flower_expandHexesOut(amount) {
		comp_terrainLayer.flower_expandHexesOut(amount);
	}

	function flower_reduceHexesOut(amount) {
		comp_terrainLayer.flower_reduceHexesOut(amount);
	}

	function changeMapShape() {
		// TODO: Update zoom when map shape is changed

		if (comp_terrainLayer.areAllHexesBlank()) {
			comp_terrainLayer.changeMapShape(tfield.mapShape);
		} else {
			let changeConfirm = confirm('Are you sure? Changing shape will erase all hexes.');

			if (changeConfirm) {
				comp_terrainLayer.changeMapShape(tfield.mapShape);
			}
		}
	}

	// Imports
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


	let overlay_files: FileList;
	function import_overlay_image() {
		if (!overlay_files[0]) return;

		let r = new FileReader();
		r.readAsDataURL(overlay_files[0]);
		r.onload = (eb) => {
			let b64 = r.result as string;

			data_overlay.base64 = b64;
			showSettings = false;
			store_selected_tool.update(n => tools.OVERLAY)
		};
	}

	$: {
		tfield = tfield;
		store_tfield.store.update((newTfield) => {
			return tfield;
		});
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
	<img src="/assets/img/ui/back.png" alt={'Back'} />
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



	<!-- GRID -->
	<h2 class="setting-heading">
		Grid
		<button on:click={() => {hidden_settings.grid = !hidden_settings.grid}}>
			<img alt={"Toggle Grid Settings"} class:rotated={hidden_settings.grid} src={"/assets/img/ui/arrow.png"}>
		</button>
	</h2>
	<div class="settings-grid" class:hidden={hidden_settings.grid}>
		<label for="showGrid">Show Grid</label>
		<!-- Weird bug where the grid wont render if you turn it off then resize the hex flower map ?? -->
		<Checkbox bind:checked={tfield.grid.shown} id={'showGrid'} on:change={comp_terrainLayer.renderGrid} />
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
				id={'gridColor'}
			/>
		{/if}

		<!-- PLACEHOLDER to give distance between the overlay and grid options -->
		<div style="height: 10px;" />
		<div />

		<!-- OVERLAY -->
		<label for="showOverlay">Large Hexes</label>
		<Checkbox bind:checked={tfield.largehexes.shown} id="showOverlay" />

		{#if tfield.largehexes.shown}
			<label for="overlayDiameter">Size</label>
			<input type="number" id="overlayDiameter" min={2} bind:value={tfield.largehexes.diameterInHexes} />

			<label for="overlayColor">Color</label>
			<ColorInputPixi id={'overlayColor'} bind:value={tfield.largehexes.style.color} />

			<label for="overlayThickness">Outline Thickness</label>
			<input type="number" id={'overlayThickness'} bind:value={tfield.largehexes.style.width} />

			<label for="overlayOffsetX" title="Measured in Hex Widths">Horizontal Offset</label>
			<input type="number" bind:value={tfield.largehexes.offset.x} min={0} step={0.25} />

			<label for="overlayOffsetY" title="Measured in Hex Heights">Vertical Offset</label>
			<input type="number" bind:value={tfield.largehexes.offset.y} min={0} step={0.25} />

			<label for="overlayEncompass">Encompass Map Edges</label>
			<Checkbox bind:checked={tfield.largehexes.encompassEdges} id="overlayEncompass" />

			<p>{tfield.orientation == hex_orientation.FLATTOP ? 'Overlay Raised Column' : 'Overlay Indented Row'}</p>
			<div style={'height: 100%; display: flex; align-items: center;'}>
				<SelectGrid
					values={['even', 'odd']}
					filenamePrefix={tfield.orientation == hex_orientation.FLATTOP ? 'overlayraisedcolumn' : 'overlayindentedrow'}
					bind:value={tfield.largehexes.raised}
				/>
			</div>
		{/if}
	</div>




	<!-- HEXES -->
	<h2 class="setting-heading">
		Hexes
		<button on:click={() => {hidden_settings.hexes = !hidden_settings.hexes}}>
			<img alt={"Toggle Hex Settings"} class:rotated={hidden_settings.hexes} src={"/assets/img/ui/arrow.png"}>
		</button>
	</h2>
	<div class="settings-grid" class:hidden={hidden_settings.hexes}>
		<label for="blankHexColor">Blank Hex Color</label>
		<ColorInputPixi
			bind:value={tfield.blankHexColor}
			on:change={() => {
				renderAllHexes();
			}}
			id={'blankHexColor'}
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

					if (retainIconPosition) comp_iconLayer.retainIconPositionOnOrientationChange(tfield.orientation);

					comp_coordsLayer.cullUnusedCoordinates();
					comp_coordsLayer.updateAllCoordPositions();
					comp_coordsLayer.updateAllCoordsText();
					comp_coordsLayer.populateBlankHexes();
				}}
			/>
		</div>

		<label for="hexWidth">Hex Width</label>
		<input
			id="hexWidth"
			type="number"
			bind:value={tfield.hexWidth}
			on:focus={() => {
				comp_iconLayer.saveOldHexMeasurements(tfield.hexWidth, tfield.hexHeight);
			}}
			on:change={() => {
				redrawEntireMap();
				comp_coordsLayer.updateAllCoordPositions();
				if (retainIconPosition) comp_iconLayer.retainIconPositionOnHexResize(tfield.hexWidth, tfield.hexHeight);
				comp_iconLayer.saveOldHexMeasurements(tfield.hexWidth, tfield.hexHeight);
			}}
		/>

		<label for="hexHeight">Hex Height</label>
		<input
			id="hexHeight"
			type="number"
			bind:value={tfield.hexHeight}
			on:focus={() => {
				comp_iconLayer.saveOldHexMeasurements(tfield.hexWidth, tfield.hexHeight);
			}}
			on:change={() => {
				redrawEntireMap();
				comp_coordsLayer.updateAllCoordPositions();
				if (retainIconPosition) comp_iconLayer.retainIconPositionOnHexResize(tfield.hexWidth, tfield.hexHeight);
				comp_iconLayer.saveOldHexMeasurements(tfield.hexWidth, tfield.hexHeight);
			}}
		/>

		<!--
        <label for="mapShape">Map Type</label>
        <select id="mapShape" bind:value={tfield.mapShape}>
            <option value={map_shape.SQUARE}>Square</option>
            <option value={map_shape.RADIAL}>Radial</option>
        </select>
        -->

		{#if tfield.mapShape == map_shape.SQUARE}
			{#if tfield.orientation == 'flatTop'}
				<p>Raised Column</p>
				<div style={'height: 100%; display: flex; align-items: center;'}>
					<SelectGrid
						values={['even', 'odd']}
						filenamePrefix={'raisedcolumn'}
						bind:value={tfield.raised}
						on:change={() => {
							comp_terrainLayer.square_updateRaisedColumn();
							comp_coordsLayer.cullUnusedCoordinates();
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
							comp_terrainLayer.square_changeIndentedRow();
							comp_coordsLayer.cullUnusedCoordinates();
						}}
					/>
				</div>
			{/if}
		{/if}

		<label for="retainIcon" title="Icons will atempt to remain in their hex when transformations occur">Retain Icon Position</label>
		<Checkbox bind:checked={retainIconPosition} id="retainIcon" />
	</div>



	<!-- DIMENSIONS AND SHAPE -->
	<h2 class="setting-heading">
		Map Dimensions
		<button on:click={() => {hidden_settings.dimensions = !hidden_settings.dimensions}}>
			<img alt={"Toggle Map Dimension Settings"} class:rotated={hidden_settings.dimensions} src={"/assets/img/ui/arrow.png"}>
		</button>
	</h2>

	<div class="settings-grid" style="margin-bottom: 5px;" class:hidden={hidden_settings.dimensions}>
		<label for="mapShape">Map Shape</label>

		<select
			bind:value={tfield.mapShape}
			on:change={() => {
				changeMapShape();
			}}
		>
			<option value={map_shape.SQUARE}>Square</option>
			<option value={map_shape.FLOWER}>Hex Flower</option>
		</select>
	</div>

	{#if tfield.mapShape == map_shape.SQUARE}
		<section id="map-dimensions-container" class:hidden={hidden_settings.dimensions}>
			<div id="map-dimensions">
				{#if addOrRemoveMapDimensions == 'add'}
					<button
						style="grid-area: left;"
						on:click={() => {
							square_expandMapDimension('left', 1);
						}}>Add<br />Left</button
					>
					<button
						style="grid-area: top;"
						on:click={() => {
							square_expandMapDimension('top', 1);
						}}>Add<br />Top</button
					>
					<button
						style="grid-area: bottom;"
						on:click={() => {
							square_expandMapDimension('bottom', 1);
						}}>Add<br />Bottom</button
					>
					<button
						style="grid-area: right;"
						on:click={() => {
							square_expandMapDimension('right', 1);
						}}>Add<br />Right</button
					>
					<button
						style="grid-area: center;"
						on:click={() => {
							addOrRemoveMapDimensions = 'remove';
						}}
					>
						<img
							src={`/assets/img/tools/addHex_${tfield.orientation == 'flatTop' ? 'ft' : 'pt'}.png`}
							alt={'Add Hex'}
							title={'Add Hex'}
						/>
					</button>
				{:else}
					<button
						style="grid-area: left;"
						on:click={() => {
							square_reduceMapDimension('left', 1);
						}}>Remove<br />Left</button
					>
					<button
						style="grid-area: top;"
						on:click={() => {
							square_reduceMapDimension('top', 1);
						}}>Remove<br />Top</button
					>
					<button
						style="grid-area: bottom;"
						on:click={() => {
							square_reduceMapDimension('bottom', 1);
						}}>Remove<br />Bottom</button
					>
					<button
						style="grid-area: right;"
						on:click={() => {
							square_reduceMapDimension('right', 1);
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
	{:else if tfield.mapShape == map_shape.FLOWER}
		<section id="flower-dimensions-container" class:hidden={hidden_settings.dimensions}>
			<p>Hexes out from center</p>
			<div id="flower-dimensions-controls-grid">
				<button
					on:click={() => {
						flower_reduceHexesOut(1);
					}}>-</button
				>
				<div id="counter-container">{tfield.hexesOut}</div>
				<button
					on:click={() => {
						flower_expandHexesOut(1);
					}}>+</button
				>
			</div>
		</section>
	{/if}



	<!-- COORDINATES -->
	<h2 class="setting-heading" style="margin-bottom: 0px;">
		Coordinates
		<button on:click={() => {hidden_settings.coordinates = !hidden_settings.coordinates}}>
			<img alt={"Toggle Coordinate Settings"} class:rotated={hidden_settings.coordinates} src={"/assets/img/ui/arrow.png"}>
		</button>
	</h2>
	<p class="helperText">Coordinates can slow down map changes such as adding hexes or changing orientation.</p>
	<div class="settings-grid" class:hidden={hidden_settings.coordinates}>
		<label for="showCoords">Show Coordinates</label>
		<Checkbox bind:checked={data_coordinates.shown} id={'showCoords'} />

		{#if data_coordinates.shown}
			<label for="coordsSystem"
				>Coordinate System<sup
					><a href="https://www.redblobgames.com/grids/hexagons/#coordinates" target="_blank" title="Hex Coordinate Systems Explanation"
						>?</a
					></sup
				></label
			>
			<select id="coordsSystem" bind:value={data_coordinates.system} on:change={comp_coordsLayer.updateAllCoordsText}>
				<option value={coord_system.ROWCOL}>Column, Row</option>
				<option value={coord_system.AXIAL}>Axial</option>
				<option value={coord_system.CUBE}>Cube</option>
			</select>

			<label for="coordsFill">Color</label>
			<ColorInputPixi bind:value={data_coordinates.style.fill} id={'coordsFill'} />

			<label for="coordFontSize">Font Size</label>
			<input id="coordFontSize" type="number" bind:value={data_coordinates.style.fontSize} />

			<label for="coordsOutline">Outline Color</label>
			<ColorInputPixi bind:value={data_coordinates.style.stroke} id={'coordsOutline'} />

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



	<!-- OVERLAY -->
	<h2 class="setting-heading">
		Overlay
		<button on:click={() => {hidden_settings.overlay = !hidden_settings.overlay}}>
			<img  alt={"Toggle Experimental Settings"} class:rotated={hidden_settings.overlay} src={"/assets/img/ui/arrow.png"}>
		</button>	
	</h2>

	<div class="settings-grid">

		<button class="file-input-button">
			Load Overlay Image
			<input type="file" accept="image/*" bind:files={overlay_files} on:change={() => { import_overlay_image(); }} />
		</button>


	</div>





	<!-- TILE SETS -->
	<h2 class="setting-heading">
		Tilesets
		<button on:click={() => {hidden_settings.tilesets = !hidden_settings.tilesets}}>
			<img  alt={"Toggle Experimental Settings"} class:rotated={hidden_settings.tilesets} src={"/assets/img/ui/arrow.png"}>
		</button>	
	</h2>
	<div id="tilesets" class:hidden={hidden_settings.tilesets}>
		{#each loadedTilesets as tileset (tileset.id)}
			<div
				class="loaded-tileset"
				on:click={() => {
					console.log(tileset);
				}}
			>
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



	<!-- ICON SETS -->
	<h2 class="setting-heading">
		<span on:click={e => {iconset_text = (iconset_text == "Icon Set" ? "Iconset" : "Icon Set")}}>{iconset_text}s</span>
		<button on:click={() => {hidden_settings.iconsets = !hidden_settings.iconsets}}>
			<img alt={"Toggle Icon Set Settings"} src={"/assets/img/ui/arrow.png"} class:rotated={hidden_settings.iconsets}>
		</button>
	</h2>
	<div id="iconsets" class:hidden={hidden_settings.iconsets}>
		{#each loadedIconsets as iconset (iconset.id)}
			<div
				class="loaded-tileset"
				on:click={() => {
					console.log(iconset);
				}}
			>
				{iconset.name}

				{#if iconset.id != 'default'}
					<button on:click={() => {
							removeIconset(iconset.id);
						}}> <img src="/assets/img/tools/trash.png" alt={'Trash'} title={'Remove Iconset'} /> </button>
				{/if}
			</div>
		{/each}

		<span>
			<button class="file-input-button"
				>Import {iconset_text} <input
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
				}}>{iconset_text} Builder</button
			>
		</span>
	</div>

	<h2 class="setting-heading">
		Experimental
		<button on:click={() => {hidden_settings.experimental = !hidden_settings.experimental}}>
			<img alt={"Toggle Experimental Settings"} class:rotated={hidden_settings.experimental} src={"/assets/img/ui/arrow.png"}>
		</button>
	</h2>
	<p class="helperText">Not polished and maybe broken.</p>

	<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;" class:hidden={hidden_settings.experimental}>
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
		Hexfriend version 1.4.1 – "Looking cozy, Hexfriend"
		<br />
		By Aidymouse and all the wonderful <a href="https://github.com/Aidymouse/Hexfriend/graphs/contributors">contributors</a>
	</p>

	<p class="helperText">
		Hexfriend is built with Svelte, Pixi JS and Typescript. Check out the <a href="https://www.github.com/Aidymouse/Hexfriend">Github</a>
	</p>

	<p class="helperText" style="text-align: center; font-size: 20pt; font-style: normal">☺</p>
</div>

<style>

	.setting-heading {
		display: flex;
		position: relative;
	}

	.setting-heading button {
		width: 3em;
		height: 2em;
		position: absolute;
		right: 0px;
	}

	.setting-heading button img {
		height: 100%;
		transition-duration: 0.2s;
		
	}
	
	.setting-heading button img.rotated {
		rotate: 180deg;
		transition-duration: 0.2s;

	}

	.hidden {
		display: none !important;
	}

	a {
		color: var(--hexfriend-green);
	}

	a:visited {
		color: var(--hexfriend-green);
	}

	#flower-dimensions-controls-grid {
		display: grid;
		grid-template-columns: 60px 1fr 60px;
		width: 100%;
	}

	#flower-dimensions-container p {
		margin-bottom: 10px;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	#flower-dimensions-controls-grid button {
		height: 60px;
	}

	#flower-dimensions-controls-grid #counter-container {
		width: 100%;
		height: 60px;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 20px;
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
		width: 100% !important;
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
