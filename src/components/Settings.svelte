<script lang="ts">
	// Types
	import type CoordsLayer from '../layers/CoordsLayer.svelte';
	import type IconLayer from '../layers/IconLayer.svelte';
	import type PathLayer from '../layers/PathLayer.svelte';
	import type TerrainLayer from '../layers/TerrainLayer.svelte';
	import type TextLayer from '../layers/TextLayer.svelte';
	import type TerrainPanel from '../panels/TerrainPanel.svelte';
	import type { coordinates_data, overlay_data, terrain_data, trace_data } from '../types/data';
	import type { Iconset } from '../types/icon';
	import type { save_data } from '../types/savedata';
	import type { terrain_field } from '../types/terrain';
	import type { Tileset } from '../types/tilesets';
	import { tools } from '../types/toolData';
	import type * as PIXI from 'pixi.js';	
	
	// Enums
	import { coord_system } from '../types/coordinates';
	import { LATESTDEFAULTICONSVERSION } from '../types/savedata';
	import { hex_raised, hex_orientation } from '../types/terrain';
	import { map_shape } from '../types/settings';
	import { LATESTTILESETFORMATVERSION, LATESTDEFAULTTILESETVERSION } from '../types/tilesets';
	import { DEFAULTTILESET } from '../lib/defaultTileset';
	
	// Stores
	import { tfield } from '../stores/tfield';
	import { store_selected_tool } from '../stores/tools';
	import { store_has_unsaved_changes } from '../stores/flags';
	import { resize_parameters } from '../stores/resize_parameters';
	import { data_overlay, data_coordinates } from '../stores/data';
	
	// Components
	import Checkbox from './Checkbox.svelte';
	import ColorInputPixi from './ColorInputPixi.svelte';
	import SelectGrid from './SelectGrid.svelte';
	import ImageCheckbox from './ImageCheckbox.svelte';

	// Lib
	import * as texture_loader from '../lib/texture_loader';
	import { update_map_to_new_default_tileset, update_tileset_format } from '../lib/tileset_updater';
	import { onMount } from 'svelte';

	// Helpers
	
	import { get_tileset_id } from '../helpers/tiles';
  import GridSettings from './settings/GridSettings.svelte';
  import SettingHeading from './settings/SettingHeading.svelte';
  import HexesSettings from './settings/HexesSettings.svelte';
  import DimensionSettings from './settings/DimensionSettings.svelte';

	export let loadedSave: save_data;
	export let showSettings: boolean;
	export let appState;
	export let showTerrainGenerator: boolean;
	export let show_icon_generator: boolean;

	export let exportMap: Function;

	let hidden_settings = {
		grid: true,
		hexes: true,
		dimensions: true,
		coordinates: true,
		overlay: true,
		tilesets: true,
		iconsets: true,
		experimental: true
	};



	export let renderAllHexes: Function;
	export let renderGrid: Function;
	export let redrawEntireMap: Function;

	// For Coordinates
	export let comp_coordsLayer: CoordsLayer;

	//export let data_terrain: terrain_data
	export let loadedTilesets: Tileset[];
	export let loadedIconsets: Iconset[];

	export let comp_terrainLayer: TerrainLayer;
	export let comp_iconLayer: IconLayer;
	export let comp_pathLayer: PathLayer;
	export let comp_textLayer: TextLayer;

	export let comp_terrain_panel: TerrainPanel;

	export let load: Function;

	let retainIconPosition: boolean = true;
	let retainPathPosition: boolean = true;
	let retainTextPosition: boolean = true;

	let exportType: 'Export As...' | 'image/png' | 'application/json' = 'Export As...';

	let iconset_text = 'Icon Set';


	function retain_positions() {
		if (retainIconPosition) comp_iconLayer.retain_icon_position_on_hex_resize($tfield.hexWidth, $tfield.hexHeight, $tfield.grid.gap);
		if (retainPathPosition) comp_pathLayer.retain_path_position_on_hex_resize();
		if (retainTextPosition) comp_textLayer.retain_text_position_on_hex_resize();
	}

	function save_old_resize_parameters() {
		
		$resize_parameters.old_hex_width = $tfield.hexWidth
		$resize_parameters.old_hex_height = $tfield.hexHeight
		$resize_parameters.old_gap = $tfield.grid.gap

	}

	

	let tilesetFiles: FileList;

	function importTileset() {
		let importFile = tilesetFiles[0];

		if (!importFile) return;

		let r = new FileReader();
		r.readAsText(importFile);
		r.onload = (eb) => {
			/* Read the file */
			let setToImport = JSON.parse(eb.target.result as string);

			let set_already_imported = loadedTilesets.find((ts: Tileset) => ts.id == setToImport.id)

			/* Check that set hasn't already been imported */
			if (set_already_imported != null) {

				alert("You've already imported this tileset :)");
				return;
				
			} 

			if (setToImport.format_version < LATESTTILESETFORMATVERSION) {
				setToImport = update_tileset_format(setToImport);
			}

			loadedTilesets.push(setToImport);
			loadedTilesets = loadedTilesets;

			/* We also have to load all of these textures */
			//addTilesetTextures(setToImport, L);
			texture_loader.load_tileset_textures(setToImport);
			$store_has_unsaved_changes = true;
		};
	}

	function removeTileset(setId: string) {
		if (!confirm("This will remove all tiles in use from this set. Continue?")) return;

		comp_terrainLayer.removeAllTilesOfSet(setId)
		comp_terrain_panel.reset_tile();


		// This line will need to change if the default tileset ever gets removeable
		//data_terrain.tile = {...loadedTilesets[0].tiles[0]}

		loadedTilesets = loadedTilesets.filter((ts: Tileset) => ts.id != setId);
		loadedSave.tilesets = loadedTilesets;

		$store_has_unsaved_changes = true;

		// Maybe we should remove tiles here, because otherwise the tiles just... fail to load.
		// Check if these tiles are being used anywere
	}

	function update_default_tileset() {
		let successfully_updated = update_map_to_new_default_tileset($tfield)
		if (!successfully_updated) return;

		// Remove default tileset
		loadedTilesets = loadedTilesets.filter(ts => get_tileset_id(ts) != "default")
		loadedTilesets.push( DEFAULTTILESET );
		loadedSave.tilesets = loadedTilesets;
	}


	function removeIconset(setId: string) {
		loadedIconsets = loadedIconsets.filter((is: Iconset) => is.id != setId);
		loadedSave.iconsets = loadedIconsets;

		$store_has_unsaved_changes = true;
	}

	let iconsetFiles: FileList;

	function importIconset() {
		let importFile = iconsetFiles[0];

		if (!importFile) return;

		let r = new FileReader();
		r.readAsText(importFile);
		r.onload = (eb) => {
			/* Read the file */
			let setToImport = JSON.parse(eb.target.result as string);

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

			$store_has_unsaved_changes = true;
		};
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

			$data_overlay.base64 = b64;
			$data_overlay.scale.x = 1;
			$data_overlay.scale.y = 1;
			showSettings = false;
			store_selected_tool.update((n) => tools.OVERLAY);

			$store_has_unsaved_changes = true;
		};
	}


	onMount(() => {
		save_old_resize_parameters()
	})

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
		style="font-size: 20pt; font-family: Segoe UI; border-radius: var(--small-radius); padding: 0.3em; width: 100%; box-sizing: border-box;"
		type="text"
		placeholder="Map Title"
		bind:value={loadedSave.title}
	/>

	<!-- EXPORT / IMPORT -->
	<span style="display: grid; grid-template-columns: 1fr 1fr; margin-top: 0.25em; column-gap: 0.25em;">
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

		<button class="file-input-button outline-button" on:click={() => {}} title="Import">
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
	<div class="setting-container">
		
		<SettingHeading text="Grid" bind:bound_var={hidden_settings.grid} />

		<GridSettings 
			bind:comp_terrainLayer
			bind:comp_coordsLayer

			bind:shown={hidden_settings.grid}

			

			renderGrid={renderGrid}
			redrawEntireMap={redrawEntireMap}
			retain_positions={retain_positions}
		/>

	</div>



	<!-- HEXES -->
	<div class="setting-container">

		<SettingHeading text="Hexes" bind:bound_var={hidden_settings.hexes} />

		<HexesSettings

			bind:comp_coordsLayer
			bind:comp_terrainLayer

			bind:retainIconPosition
			bind:retainPathPosition
			bind:retainTextPosition

			bind:shown={hidden_settings.hexes}

			retain_positions={retain_positions}
			save_old_resize_parameters={save_old_resize_parameters}
			renderAllHexes={renderAllHexes}
			redrawEntireMap={redrawEntireMap}

		/>

	</div>




	<!-- DIMENSIONS AND SHAPE -->
	<div class="setting-container">

		<SettingHeading text="Shape and Size" bind:bound_var={hidden_settings.dimensions} />

		<DimensionSettings 
		
			bind:comp_terrainLayer
			bind:comp_iconLayer
			bind:comp_textLayer
			bind:comp_pathLayer

			bind:shown={hidden_settings.dimensions}
		
		/>
		
	</div>





	<!-- COORDINATES -->
	<div class="setting-container">
		<h2 class="setting-heading" class:bottom-margin={!hidden_settings.coordinates}>
			Coordinates
			<button
				on:click={() => {
					hidden_settings.coordinates = !hidden_settings.coordinates;
				}}
			>
				<img alt={'Toggle Coordinate Settings'} class:rotated={hidden_settings.coordinates} src={'/assets/img/ui/arrow.png'} />
			</button>
		</h2>
		<div class="settings-grid" class:hidden={hidden_settings.coordinates}>
			<label class="helper-text">Coordinates can slow down map changes such as adding hexes or changing orientation.</label>
			<label for="showCoords">Show Coordinates</label>
			<Checkbox bind:checked={$data_coordinates.shown} id={'showCoords'} />

			{#if $data_coordinates.shown}
				<label for="coordsSystem"
					>Coordinate System<sup
						><a href="https://www.redblobgames.com/grids/hexagons/#coordinates" target="_blank" title="Hex Coordinate Systems Explanation"
							>?</a
						></sup
					></label
				>
				<select id="coordsSystem" bind:value={$data_coordinates.system} on:change={comp_coordsLayer.updateAllCoordsText}>
					<option value={coord_system.ROWCOL}>Column, Row</option>
					<option value={coord_system.AXIAL}>Axial</option>
					<option value={coord_system.CUBE}>Cube</option>
					<option value={coord_system.LETTERNUMBER}>Letter Number</option>
				</select>

				<label for="coordsFill">Color</label>
				<ColorInputPixi bind:value={$data_coordinates.style.fill} id={'coordsFill'} />

				<label for="coordFontSize">Font Size</label>
				<input id="coordFontSize" type="number" bind:value={$data_coordinates.style.fontSize} />

				<label for="coordsOutline">Outline Color</label>
				<ColorInputPixi bind:value={$data_coordinates.style.stroke} id={'coordsOutline'} />

				<label for="coordsStrokeThickness">Outline Thickness</label>
				<input id="coordsStrokeThickness" type="number" bind:value={$data_coordinates.style.strokeThickness} />

				<label for="coordSeperator">Separator</label>
				<input
					id="coordSeperator"
					type="text"
					bind:value={$data_coordinates.seperator}
					on:change={() => {
						comp_coordsLayer.updateAllCoordsText();
					}}
				/>

				<label for="coordGap">Space from bottom</label>
				<input
					id="coordGap"
					type="number"
					bind:value={$data_coordinates.gap}
					on:change={() => {
						comp_coordsLayer.updateAllCoordPositions();
					}}
				/>

				{#if $data_coordinates.system == coord_system.ROWCOL || $data_coordinates.system == coord_system.LETTERNUMBER}
					<label for="coord-offset-rowcol-row">Row Offset</label>
					<input  id="coord-offset-rowcol-row" type="number" bind:value={$data_coordinates.offsets.row_col.row} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
					
					<label for="coord-offset-rowcol-col">Column Offset</label>
					<input  id="coord-offset-rowcol-col" type="number" bind:value={$data_coordinates.offsets.row_col.col} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
				{/if}
				
				{#if $data_coordinates.system == coord_system.AXIAL || $data_coordinates.system == coord_system.CUBE}
					<label for="coord-offset-cube-q">Q Offset</label>
					<input  id="coord-offset-cube-q" type="number" bind:value={$data_coordinates.offsets.cube.q} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
					
					<label for="coord-offset-cube-r">R Offset</label>
					<input  id="coord-offset-cube-r" type="number" bind:value={$data_coordinates.offsets.cube.r} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
				{/if}
				
				{#if $data_coordinates.system == coord_system.CUBE}
					<label for="coord-offset-cube-s">S Offset</label>
					<input  id="coord-offset-cube-s" type="number" bind:value={$data_coordinates.offsets.cube.s} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
				{/if}

			{/if}
		</div>
	</div>






	<!-- OVERLAY -->
	<div class="setting-container">
		<h2 class="setting-heading" class:bottom-margin={!hidden_settings.overlay}>
			Overlay
			<button
				on:click={() => {
					hidden_settings.overlay = !hidden_settings.overlay;
				}}
			>
				<img alt={'Toggle Experimental Settings'} class:rotated={hidden_settings.overlay} src={'/assets/img/ui/arrow.png'} />
			</button>
		</h2>

		<div class="settings-grid" class:hidden={hidden_settings.overlay} style={'justify-items: start;'}>
			<button class="file-input-button">
				{#if $data_overlay.base64 == ''}Load Overlay Image{:else}Replace Overlay Image{/if}
				<input
					type="file"
					accept="image/*"
					bind:files={overlay_files}
					on:change={() => {
						import_overlay_image();
					}}
				/>
			</button>
		</div>
	</div>






	<!-- TILE SETS -->
	<div class="setting-container">
		<h2 class="setting-heading" class:bottom-margin={!hidden_settings.tilesets}>
			Tilesets
			<button
				on:click={() => {
					hidden_settings.tilesets = !hidden_settings.tilesets;
				}}
			>
				<img alt={'Toggle Experimental Settings'} class:rotated={hidden_settings.tilesets} src={'/assets/img/ui/arrow.png'} />
			</button>
		</h2>
		<div id="tilesets" class:hidden={hidden_settings.tilesets}>
			{#each loadedTilesets as tileset (tileset.id)}
				<div
					class="loaded-tileset"
					on:click={() => {
						console.log(tileset);
					}}
					on:keydown={()=>{}}
				>
					<span style="display: flex;">{tileset.name} <span class="helper-text">v{tileset.version}</span></span>

					{#if get_tileset_id(tileset) != 'default'} 
						<button
							class="set-rollover-button"
							on:click={() => {
								removeTileset(tileset.id);
							}}
						>
							<img src="/assets/img/tools/trash.png" alt={'Trash'} title={'Remove Tileset'} />
						</button>
					{/if}

					<!-- Update Default Tileset Button -->
					{#if get_tileset_id(tileset) == "default" && tileset.version < LATESTDEFAULTTILESETVERSION}
						<button
							id="default-tileset-update-button"
							on:click={() => {
								update_default_tileset();
							}}
							title={`Update Tileset to v${LATESTDEFAULTTILESETVERSION}`}
						>
							<img src="/assets/img/ui/arrow.png" alt={''} title={`Update Tileset to v${LATESTDEFAULTTILESETVERSION}`} />
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
	</div>

	<!-- ICON SETS -->
	<div class="setting-container">
		<h2 class="setting-heading" class:bottom-margin={!hidden_settings.iconsets}>
			<span
				on:click={(e) => {
					iconset_text = iconset_text == 'Icon Set' ? 'Iconset' : 'Icon Set';
				}}>{iconset_text}s</span
			>
			<button
				on:click={() => {
					hidden_settings.iconsets = !hidden_settings.iconsets;
				}}
			>
				<img alt={'Toggle Icon Set Settings'} src={'/assets/img/ui/arrow.png'} class:rotated={hidden_settings.iconsets} />
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

					{#if iconset.id.split(":")[0] != 'default' && iconset.version != LATESTDEFAULTICONSVERSION}
						<button
							on:click={() => {
								removeIconset(iconset.id);
							}}
						>
							<img src="/assets/img/tools/trash.png" alt={'Trash'} title={'Remove Iconset'} />
						</button>
					{/if}
				</div>
			{/each}

			<span>
				<button class="file-input-button"
					>Import {iconset_text}
					<input
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
	</div>

	<div class="setting-container">
		<h2 class="setting-heading" class:bottom-margin={!hidden_settings.experimental}>
			Generators
			<button
				on:click={() => {
					hidden_settings.experimental = !hidden_settings.experimental;
				}}
			>
				<img alt={'Toggle Generator Menu'} class:rotated={hidden_settings.experimental} src={'/assets/img/ui/arrow.png'} />
			</button>
		</h2>

		<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;" class:hidden={hidden_settings.experimental}>
			<button
				on:click={() => {
					showTerrainGenerator = true;
					show_icon_generator = false;
					showSettings = false;
				}}
				title={'Terrain Generator'}
				>
				Terrain Generator
			</button>
			
			<button
			on:click={() => {
				show_icon_generator = true;
				showTerrainGenerator = false;
					showSettings = false;
				}}
				title={'Icon Generator'}
			>
				Icon Generator
			</button>
		</div>
	</div>

	<!-- Changelog -->
	<a href="https://github.com/Aidymouse/Hexfriend/blob/master/changelog.md" target={"_blank"} style="color: var(--text);">
		<div class="setting-container">
			<h2 class="setting-heading">
				Changelog 
				<button><img alt={'Go to Changelog'} src={'/assets/img/ui/arrow.png'} style="transform: rotate(90deg);"/></button>
			</h2>
		</div>
	</a>

	<div class="setting-container">
		<h2>About</h2>
		<p class="helper-text">
			Hexfriend version 1.9.8 - "Sorting out your internals, Hexfriend"
		</p>
		
		<p class="helper-text">
			By Aidymouse and all the wonderful <a href="https://github.com/Aidymouse/Hexfriend/graphs/contributors">contributors</a>
		</p>

		<p class="helper-text">
			Hexfriend is built with Svelte, Pixi JS and Typescript. Check out the <a href="https://www.github.com/Aidymouse/Hexfriend">Github</a>
		</p>
	
		<p class="helper-text">
			Found a bug? Got ideas? Come say Hi on the <a href="https://discord.gg/Jvws27VmWR">Hexfriend Discord</a>
		</p>

		<p class="helper-text">
			You can give away your hard earned money on <br><a href="https://ko-fi.com/aidymouse">Ko-fi</a>.
		</p>
	</div>

	<p style="text-align: center; font-size: 20pt; font-style: normal; color: var(--lightest-background)">⟨ •‿• ⟩</p>
</div>

<style>

	#default-tileset-update-button {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.bottom-margin {
		margin-bottom: 0.25em;
	}

	.setting-container {
		background-color: var(--light-background);
		padding: 0.25em;
		padding-left: 0.5em;
		padding-right: 0.5em;
		border-radius: var(--large-radius);
		margin-top: 0.25em;
	}

	.setting-heading {
		display: flex;
		position: relative;
	}

	.setting-heading button {
		width: 3em;
		height: 2em;
		position: absolute;
		height: 100%;
		right: 0px;
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: transparent;
	}
	
	.setting-heading button:hover {
		background-color: var(--lighter-background);
	}

	.setting-heading button img {
		height: 80%;
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

	

	#export-map-select {
		border: solid 1px var(--lighter-background);
		border-radius: var(--small-radius);
		background-color: var(--primary-background);
		padding: 0.3125em;
		transition-duration: 0.2s;

		text-align: center;
	}

	#export-map-select:hover {
		background-color: var(--light-background);
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
		background-color: var(--primary-background);
		padding: 5px;
		border-radius: var(--small-radius);
		position: relative;
	}

	.loaded-tileset:hover button.set-rollover-button {
		opacity: 1;
	}

	.loaded-tileset button.set-rollover-button {
		opacity: 0;
	}
	
	
	.loaded-tileset button {
		position: absolute;
		height: 100%;
		top: 0px;
		right: 0px;
		width: 30px;
		padding: 0;
		border: none;
		border-top-left-radius: 0px;
		border-bottom-left-radius: 0px;
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

	



	h2 {
		margin: 0;
	}

	.helper-text {
		grid-column: span 2;
		font-size: 12px;
		color: var(--text);
		line-height: 1.2;
		margin: 0;
		margin-bottom: 5px;
		margin-top: 5px;
		font-style: oblique;
	}

	.settings-grid {
		display: grid;
		grid-template-columns: 3fr 2fr;
		grid-auto-rows: 2em;
		align-items: center;
		justify-items: center;
		row-gap: 0.3em;
	}

	.settings-grid label {
		justify-self: start;
	}

	.settings-grid input {
		width: 8ch;
		height: 2em;
	}

	p {
		margin: 0;
	}

	#settings {
		position: absolute;
		top: 0;
		left: -19em;
		width: 19em;
		height: 100%;
		background: var(--primary-background);
		box-sizing: border-box;

		padding: 1em;

		overflow-y: scroll;
		transition-duration: 0.2s;
	}

	#settings.shown {
		left: 0px !important;
	}

	#close-tab {
		position: absolute;

		left: -2.5em;
		top: 0;

		width: 2.5em;
		height: 8em;
		border-radius: 0em;
		border-top-right-radius: var(--large-radius);
		border-bottom-right-radius: var(--large-radius);
		border: none;
		background: var(--primary-background);
		transition-duration: 0.2s;
		transition-timing-function: ease;
		padding: 0.5em;
		box-sizing: border-box;
	}

	#close-tab.shown {
		left: 22.75em;
	}

	#close-tab:hover {
		background: var(--light-background);
	}

	#close-tab img {
		margin: 0;
		width: 100%;
	}

	

</style>
