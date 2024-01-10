<script lang="ts">
	// Types
	import type CoordsLayer from '../layers/CoordsLayer.svelte';
	import type IconLayer from '../layers/IconLayer.svelte';
	import type PathLayer from '../layers/PathLayer.svelte';
	import type TerrainLayer from '../layers/TerrainLayer.svelte';
	import type TextLayer from '../layers/TextLayer.svelte';
	import type TerrainPanel from '../panels/TerrainPanel.svelte';
	import type { Iconset } from '../types/icon';
	import type { save_data } from '../types/savedata';
	import type { Tileset } from '../types/tilesets';
	
	// Styles
	import "../styles/settings.css";

	// Stores
	import { tfield } from '../stores/tfield';
	import { resize_parameters } from '../stores/resize_parameters';
	
	// Components
	import GridSettings from './settings/GridSettings.svelte';
	import SettingHeading from './settings/SettingHeading.svelte';
	import HexesSettings from './settings/HexesSettings.svelte';
	import DimensionSettings from './settings/DimensionSettings.svelte';
	import CoordinateSettings from './settings/CoordinateSettings.svelte';
	import OverlaySettings from './settings/OverlaySettings.svelte';
	import TilesetSettings from './settings/TilesetSettings.svelte';
	import IconsetSettings from './settings/IconsetSettings.svelte';
	import GeneratorSettings from './settings/GeneratorSettings.svelte';

	// Lib
	import { onMount } from 'svelte';

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
			let saveData = JSON.parse(eb.target.result as string);
			//console.log(saveData)
			load(saveData, null);
		};
	}

	onMount(() => {
		save_old_resize_parameters()

		hexfriend_blink();
	})


	let hexfriend_affection = 0;
	let petting_hexfriend = false;
	let hexfriend_hearts = false;
	
	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
	}


	function hexfriend_blink() {
		// console.log(petting_hexfriend)
		if (!(petting_hexfriend || hexfriend_hearts)) {
			// console.log("HUH!?")
			document.getElementById("little-hexfriend").innerHTML = "⟨ -‿- ⟩"
			setTimeout(() => {
				if (!(petting_hexfriend || hexfriend_hearts)) {
					document.getElementById("little-hexfriend").innerHTML = "⟨ •‿• ⟩"
				}
			}, 400)
			
		}
		setTimeout(hexfriend_blink, getRandomInt(60, 120)*1000)
	}

	function hexfriend_pet() {
		if (!petting_hexfriend) return;
		hexfriend_affection += 1;
		
		document.getElementById("floating-hexfriend").style.opacity = hexfriend_affection/100;
		
		if (hexfriend_affection > 100) {
			// Some hearts

			

			document.getElementById("floating-hexfriend").style.opacity = 0;
			
			document.getElementById("little-hexfriend").innerHTML = "⟨ ꈍ‿ꈍ ⟩"
			document.getElementById("floating-hexfriend").innerHTML = "⟨ ꈍ‿ꈍ ⟩"
			document.getElementById("floating-hexfriend").style.transitionDuration = "2s";
			document.getElementById("floating-hexfriend").style.opacity = 0;

			hexfriend_hearts = true;
			setTimeout(() => {
				document.getElementById("floating-hexfriend").innerHTML = "⟨ >‿• ⟩"
				document.getElementById("floating-hexfriend").style.transitionDuration = "0s";
				hexfriend_hearts = false;
				hexfriend_stop_petting()
			}, 2000);
			
		} 
	}
	
	function hexfriend_stop_petting() {
		if (hexfriend_hearts) return;
		document.getElementById("floating-hexfriend").style.opacity = 0;
		document.getElementById("little-hexfriend").innerHTML = "⟨ •‿• ⟩"
		document.getElementById("little-hexfriend").style.cursor = "grab";
		petting_hexfriend = false;
		hexfriend_affection = 0;
	}

	function hexfriend_start_petting(e: MouseEvent) {
		if (hexfriend_hearts) return;
		document.getElementById("little-hexfriend").innerHTML = "⟨ >‿• ⟩"
		document.getElementById("little-hexfriend").style.cursor = "grabbing";
		petting_hexfriend = true;

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
			<div class="hider">
				<GridSettings 
					bind:comp_terrainLayer
					bind:comp_coordsLayer				

					renderGrid={renderGrid}
					redrawEntireMap={redrawEntireMap}
					retain_positions={retain_positions}
				/>
			</div>
		</div>
	</div>

	<!-- HEXES -->
	<div class="setting-container">
		<SettingHeading text="Hexes" bind:toggle={hidden_settings.hexes} />
		<div class="settings-hider" class:hidden={hidden_settings.hexes}>
			<div class="hider">
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
	</div>

	<!-- DIMENSIONS AND SHAPE -->
	<div class="setting-container">
		<SettingHeading text="Shape and Size" bind:toggle={hidden_settings.dimensions} />
		<div class="settings-hider" class:hidden={hidden_settings.dimensions}>
			<div class="hider">
				<DimensionSettings 
					bind:comp_terrainLayer
					bind:comp_iconLayer
					bind:comp_textLayer
					bind:comp_pathLayer
				/>
			</div>
		</div>
	</div>

	<!-- COORDINATES -->
	<div class="setting-container">
		<SettingHeading text="Coordinates" bind:toggle={hidden_settings.coordinates} />
		<div class="settings-hider" class:hidden={hidden_settings.coordinates}>
			<div class="hider">
				<CoordinateSettings
					bind:comp_coordsLayer
				/>
			</div>
		</div>
	</div>

	<!-- OVERLAY -->
	<div class="setting-container">
		<SettingHeading text="Overlay" bind:toggle={hidden_settings.overlay} />
		<div class="settings-hider" class:hidden={hidden_settings.overlay}>
			<div class="hider">
				<OverlaySettings bind:showSettings />
			</div>
		</div>

	</div>

	<!-- TILE SETS -->
	<div class="setting-container">
		<SettingHeading text="Tilesets" bind:toggle={hidden_settings.tilesets} />
		<div class="settings-hider" class:hidden={hidden_settings.tilesets}>
			<div class="hider">
				<TilesetSettings 
					bind:loadedSave
					bind:loadedTilesets

					bind:comp_terrainLayer
					bind:comp_terrain_panel

					bind:appState
				/>
			</div>
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
			<div class="hider">
				<IconsetSettings 
					bind:loadedSave
					bind:loadedIconsets
					bind:iconset_text
					bind:appState
				/>
			</div>
		</div>
	</div>

	<!-- GENERATORS -->
	<div class="setting-container">
		<SettingHeading text="Generators" bind:toggle={hidden_settings.experimental} />
		<div class="settings-hider" class:hidden={hidden_settings.experimental}>
			<div class="hider">
				<GeneratorSettings 
					bind:show_icon_generator
					bind:showTerrainGenerator
					bind:showSettings
				/>
			</div>
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
			Hexfriend version 1.9.10 - "Sorting out your internals, Hexfriend"
		</p>
		
		<p class="helper-text" style="margin-top: var(--small-radius)">
			By Aidymouse and all the wonderful <a href="https://github.com/Aidymouse/Hexfriend/graphs/contributors">contributors</a>
		</p>

		<p class="helper-text" style="margin-top: var(--small-radius)">
			Hexfriend is built with Svelte, Pixi JS and Typescript. Check out the <a href="https://www.github.com/Aidymouse/Hexfriend">Github</a>
		</p>
	
		<p class="helper-text" style="margin-top: var(--small-radius)">
			Found a bug? Got ideas? Come say Hi on the <a href="https://discord.gg/Jvws27VmWR">Hexfriend Discord</a>
		</p>

		<p class="helper-text" style="margin-top: var(--small-radius)">
			You can give away your hard earned money on <br><a href="https://ko-fi.com/aidymouse">Ko-fi</a>.
		</p>
	</div>

	<div id="hexfriends-house">
		<p id="little-hexfriend" 
			on:mousedown={hexfriend_start_petting}
			on:mousemove={hexfriend_pet}
			on:mouseup={hexfriend_stop_petting}
			on:mouseleave={hexfriend_stop_petting}
			on:blur={hexfriend_stop_petting}
		>
			⟨ •‿• ⟩
		</p>
		<p id="floating-hexfriend" class="hexfriend-ungreen">
			⟨ >‿• ⟩
		</p>
	</div>
</div>

<style>

	.hexfriend-ungreen {
		color: var(--hexfriend-green) !important;
	}

	#hexfriends-house {
		display: flex;
		justify-content: center;
	}
	
	#floating-hexfriend,
	#little-hexfriend {
		text-align: center;
		font-size: 20pt;
		font-style: normal;
		color: var(--lightest-background);
		cursor: grab;
		max-width: auto;
	}

	#little-hexfriend {
		transition-duration: 2s;
	}

	#floating-hexfriend {
		position:absolute;
		pointer-events: none;
		color: var(--hexfriend-green);
		opacity: 0;
	}

	#little-hexfriend:active {
		cursor: grabbing;
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

	.settings-hider {
		display: grid;
		grid-template-rows: 1fr;
		transition: grid-template-rows 0.2s ease-in-out;
	}

	.hider {
		/* allows for smooth hiding transition */
        overflow-y: hidden;
	}

	.hidden {
		grid-template-rows: 0fr;
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
