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
	
	// Styles
	import "../styles/settings.css";

	// Enums
	
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

	import GridSettings from './settings/GridSettings.svelte';
	import SettingHeading from './settings/SettingHeading.svelte';
	import HexesSettings from './settings/HexesSettings.svelte';
	import DimensionSettings from './settings/DimensionSettings.svelte';
	import CoordinateSettings from './settings/CoordinateSettings.svelte';
	import OverlaySettings from './settings/OverlaySettings.svelte';
	import TilesetSettings from './settings/TilesetSettings.svelte';
	import IconsetSettings from './settings/IconsetSettings.svelte';

	// Lib
	import * as texture_loader from '../lib/texture_loader';
	import { onMount } from 'svelte';
  import GeneratorSettings from './settings/GeneratorSettings.svelte';


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

	//export let data_terrain: terrain_data
	export let loadedTilesets: Tileset[];
	export let loadedIconsets: Iconset[];
	
	export let comp_terrainLayer: TerrainLayer;
	export let comp_iconLayer: IconLayer;
	export let comp_pathLayer: PathLayer;
	export let comp_textLayer: TextLayer;
	export let comp_coordsLayer: CoordsLayer;
	
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
		
		<SettingHeading text="Grid" bind:toggle={hidden_settings.grid} />

		<div class="settings-hider" class:hidden={hidden_settings.grid}>
			<GridSettings 
				bind:comp_terrainLayer
				bind:comp_coordsLayer				

				renderGrid={renderGrid}
				redrawEntireMap={redrawEntireMap}
				retain_positions={retain_positions}
			/>
		</div>

	</div>



	<!-- HEXES -->
	<div class="setting-container">

		<SettingHeading text="Hexes" bind:toggle={hidden_settings.hexes} />

		<div class="settings-hider" class:hidden={hidden_settings.hexes}>
			<HexesSettings

				bind:comp_coordsLayer
				bind:comp_terrainLayer

				bind:retainIconPosition
				bind:retainPathPosition
				bind:retainTextPosition

				retain_positions={retain_positions}
				save_old_resize_parameters={save_old_resize_parameters}
				renderAllHexes={renderAllHexes}
				redrawEntireMap={redrawEntireMap}

			/>
		</div>

	</div>




	<!-- DIMENSIONS AND SHAPE -->
	<div class="setting-container">

		<SettingHeading text="Shape and Size" bind:toggle={hidden_settings.dimensions} />

		<div class="settings-hider" class:hidden={hidden_settings.dimensions}>
			<DimensionSettings 
			
				bind:comp_terrainLayer
				bind:comp_iconLayer
				bind:comp_textLayer
				bind:comp_pathLayer
			
			/>
		</div>
		
	</div>





	<!-- COORDINATES -->
	<div class="setting-container">

		<SettingHeading text="Coordinates" bind:toggle={hidden_settings.coordinates} />

		<div class="settings-hider" class:hidden={hidden_settings.coordinates}>
			<CoordinateSettings
			
				bind:comp_coordsLayer

			/>
		</div>

		
	</div>






	<!-- OVERLAY -->
	<div class="setting-container">
		<SettingHeading text="Overlay" bind:toggle={hidden_settings.overlay} />

		<div class="settings-hider" class:hidden={hidden_settings.overlay}>
			<OverlaySettings bind:showSettings />
		</div>

	</div>






	<!-- TILE SETS -->
	<div class="setting-container">
		<SettingHeading text="Tilesets" bind:toggle={hidden_settings.tilesets} />
		
		<div class="settings-hider" class:hidden={hidden_settings.tilesets}>
			<TilesetSettings 
			
				bind:loadedSave
				bind:loadedTilesets

				bind:comp_terrainLayer
				bind:comp_terrain_panel

				bind:appState

			/>
		</div>

	</div>

	<!-- ICON SETS -->
	<div class="setting-container">
		
		<h2 class="setting-heading">
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

		<div class="settings-hider" class:hidden={hidden_settings.iconsets}>
			<IconsetSettings 
			
				bind:loadedSave
				bind:loadedIconsets
				bind:iconset_text
				bind:appState

			/>
		</div>
	</div>

	<div class="setting-container">
		<SettingHeading text="Generators" bind:toggle={hidden_settings.experimental} />

		<div class="settings-hider" class:hidden={hidden_settings.experimental}>
			<GeneratorSettings 
				bind:show_icon_generator
				bind:showTerrainGenerator
				bind:showSettings
			/>
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
			Hexfriend version 1.9.9 - "Sorting out your internals, Hexfriend"
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

	.setting-hider.hidden {
		display: none !important;
	}

	.setting-container {
		background-color: var(--light-background);
		padding: 0.5em;
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

	h2 {
		margin: 0;
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
