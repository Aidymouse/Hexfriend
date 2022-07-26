<script lang="ts">
	/* COLORS
   hexfriend green: #8cc63f
  hexfiend red: #FF6666
 */

	/* TODO 

  
   // CORE FUNCTIONS
  - hex coordinates on map - fix pointy top + more coordinate systems
  - tooltips
  - move icons when resizing map
  
  - keyboard shortcuts
  - import iconsets
  
  // POLISH / ROADMAP
  // not ranked
  - terrain generator function validation
  - terrain generator
  - floating loaders - better feedback
  - save data checking (if loading, making new map, quitting)
  - export at different sizes
  - tooltips
  - dashed line
  - more fonts
 */

	/* BUGS 

  - symbol size is weird in preview when hex size is big
  - coordinates show under some stuff for some reason

*/
	import Controls from './components/ControlTooltips.svelte';
	import IconsetCreator from './components/IconsetCreator.svelte';
	import MapSettings from './components/MapSettings.svelte';
	import SavedMaps from './components/SavedMaps.svelte';
	import TerrainGenerator from './components/TerrainGenerator.svelte';
	import TilesetCreator from './components/TilesetCreator.svelte';
	// Like, whatever
	import ToolButtons from './components/ToolButtons.svelte';
	import CoordsLayer from './layers/CoordsLayer.svelte';
	import IconLayer from './layers/IconLayer.svelte';
	import PathLayer from './layers/PathLayer.svelte';
	// Layers
	import TerrainField from './layers/TerrainField.svelte';
	import TextLayer from './layers/TextLayer.svelte';
	import { db } from './lib/db';
	// Data
	import DEFAULTSAVEDATA from './lib/defaultSaveData';
	// Methods
	//import { collapseWaveGen } from './lib/terrainGenerator'
	import { download } from './lib/download2';
	import IconPanel from './panels/IconPanel.svelte';
	import PathPanel from './panels/PathPanel.svelte';
	// Panels
	import TerrainPanel from './panels/TerrainPanel.svelte';
	import TextPanel from './panels/TextPanel.svelte';
	// GLOBAL STYLES
	import './styles/inputs.css';
	import './styles/panels.css';
	import { coord_system } from './types/coordinates';
	import type { coordinates_data, icon_data, path_data, terrain_data, text_data, trace_data } from './types/data';
	import type { Iconset } from './types/icon';
	import type { save_data } from './types/savedata';
	import type { terrain_field } from './types/terrain';
	import type { Tileset } from './types/tilesets';
	import { tools } from './types/toolData';
	import * as PIXI from 'pixi.js';
	import { tick } from 'svelte';
	import { Container, Pixi } from 'svelte-pixi';

	/* STATE */

	let loadedSave: save_data = DEFAULTSAVEDATA;
	let loadedId: number | null = null;

	let appState: 'normal' | 'tilesetCreator' | 'iconsetCreator' = 'normal';

	let showSettings = false;
	let showTerrainGenerator = false;

	let offsetContainer = new PIXI.Container();

	/* STUFF TO BIND TO */
	let comp_terrainField: TerrainField;
	let comp_iconLayer: IconLayer;
	let comp_pathLayer: PathLayer;
	let comp_textLayer: TextLayer;
	let comp_coordsLayer: CoordsLayer;

	//offsetContainer.addChild(terrainGraphics);

	/* APPLICATION */
	let app = new PIXI.Application({
		backgroundAlpha: 0,
		width: window.innerWidth,
		height: window.innerHeight,
		resizeTo: window,
	});

	//PIXI.settings.RESOLUTION = 4

	let showSavedMaps = false;

	let loading = true;

	let loadedTilesets: Tileset[];
	let loadedIconsets: Iconset[];
	let tfield: terrain_field;

	/* PANNING */
	let pan = {
		panning: false,

		oldX: 0,
		oldY: 0,

		offsetX: window.innerWidth / 2,
		offsetY: window.innerHeight / 2,

		screenX: 0,
		screenY: 0,

		zoomScale: 1,

		get worldX() {
			return (pan.screenX - pan.offsetX) / pan.zoomScale;
		},

		get worldY() {
			return (pan.screenY - pan.offsetY) / pan.zoomScale;
		},

		startPan: function (e: PointerEvent) {
			pan.panning = true;
			pan.oldX = e.clientX;
			pan.oldY = e.clientY;
		},

		handle: function (e: PointerEvent) {
			pan.screenX = e.clientX; //e.detail.data.global.x
			pan.screenY = e.clientY; //e.detail.data.global.y

			if (pan.panning) {
				pan.offsetX += e.clientX - pan.oldX; //e.detail.data.global.x - pan.oldX
				pan.offsetY += e.clientY - pan.oldY; //e.detail.data.global.y - pan.oldY

				pan.oldX = e.clientX; //e.detail.data.global.x
				pan.oldY = e.clientY; //e.detail.data.global.y
			}
		},

		endPan: function () {
			pan.panning = false;
		},

		zoom: function (e: WheelEvent) {
			let xBeforeZoom = pan.worldX;
			let yBeforeZoom = pan.worldY;

			let zoomFactor = 1.15;
			if (e.deltaY < 0) {
				pan.zoomScale *= zoomFactor;
			} else {
				pan.zoomScale /= zoomFactor;
			}

			// Move the screen
			let xAfterZoom = pan.worldX;
			let yAfterZoom = pan.worldY;

			let dx = (xAfterZoom - xBeforeZoom) * pan.zoomScale;
			let dy = (yAfterZoom - yBeforeZoom) * pan.zoomScale;

			pan.offsetX += dx;
			pan.offsetY += dy;
		},
	};

	let controls = {
		mouseDown: [false, false, false, false, false],
	};

	let selectedTool: tools = tools.TERRAIN;

	/* DATA */
	/* Data is bound to both layer and panel of a particluar tool. It contains all the shared state they need, and is bound to both */

	let data_terrain: terrain_data = {
		//bgColor: null,
		//symbol: null,

		tile: null,

		usingEyedropper: false,
		usingPaintbucket: false,
		usingEraser: false,
		renderOpacity: 1,
	};

	let data_icon: icon_data = {
		color: null,
		texId: null,
		pHex: 80,
		snapToHex: true,
		usingEraser: false,
	};

	let data_path: path_data = {
		style: { color: 0, width: 3, cap: PIXI.LINE_CAP.ROUND, join: PIXI.LINE_JOIN.ROUND },
		selectedPath: null,
		snap: false,
	};

	let data_text: text_data = {
		style: {
			fontFamily: 'Segoe UI',
			fill: '#000000',
			fontSize: 25,
			miterLimit: 2,
			strokeThickness: 0,
			stroke: '#f2f2f2',
			align: 'left',
			fontStyle: 'normal',
			fontWeight: 'normal',
		},
		selectedText: null,
		editorRef: null,
		usingTextTool: false,
	};
	$: data_text.usingTextTool = selectedTool == tools.TEXT;

	let data_coordinates: coordinates_data = {
		shown: true,
		style: { fill: 0x000000, fontSize: 10 },
		system: coord_system.ROWCOL,
		seperator: '.',
		gap: 4,
	};

	const L: PIXI.Loader = new PIXI.Loader();

	// Never cleared, to stop duplicate textures being added
	// Theoretically a memory leak... but bounded by how many unique tiles can be loaded. Shouldn't be a problem?
	let symbolTextureLookupTable: { [key: string]: string } = {
		// tile id: id of tile who's texture we use
	};

	let iconTextureLookupTable: { [key: string]: string } = {
		// icon texId: id of tile who's texture we use
	};

	function exportMap(exportType) {
		console.log(exportType);
		switch (exportType) {
			case 'image/png':
				download(
					app.renderer.plugins.extract.base64(offsetContainer),
					`${loadedSave.title ? loadedSave.title : 'Untitled Hexfriend'}`,
					exportType
				);
				break;

			case 'application/json':
				download(JSON.stringify(loadedSave), `${loadedSave.title ? loadedSave.title : 'Untitled Hexfriend'}.hexfriend`, exportType);
				break;
		}
	}

	function redrawEntireMap() {
		// Refreshes all hexes and coordinates
		comp_terrainField.renderAllHexes();
	}

	/* TOOL METHODS */

	/* ALL PURPOSE POINTER METHODS */
	function pointerdown(e: PointerEvent) {
		controls.mouseDown[e.button] = true;

		if (controls.mouseDown[2]) pan.startPan(e);

		if (controls.mouseDown[0]) {
			switch (selectedTool) {
				case tools.TERRAIN:
					comp_terrainField.pointerdown();
					break;

				case 'icon':
					comp_iconLayer.pointerdown();
					break;

				case 'path':
					comp_pathLayer.pointerdown();
					break;

				case 'text':
					comp_textLayer.pointerdown();
					break;

				case 'eraser':
					comp_terrainField.eraseAtMouse();
					/* Icons are handled in the IconLayer */
					break;
			}
		}
	}

	function pointerup(e: PointerEvent) {
		controls.mouseDown[e.button] = false;

		if (!controls.mouseDown[2]) pan.endPan();

		switch (selectedTool) {
			case 'text':
				comp_textLayer.pointerup();
				break;
		}
	}

	function pointermove(e: PointerEvent) {
		pan.handle(e);

		switch (selectedTool) {
			case tools.TERRAIN:
				if (controls.mouseDown[0]) comp_terrainField.pointerdown();
				break;

			case tools.TEXT:
				comp_textLayer.pointermove();
				break;

			case tools.ERASER:
				if (controls.mouseDown[0]) comp_terrainField.eraseAtMouse();
				/* Icons are handled differently in the icon handler */
				break;
		}
	}

	function createNewMap() {
		/* TODO: Save Data Checking */

		loadInit(JSON.parse(JSON.stringify(DEFAULTSAVEDATA)), null);
	}

	async function saveToDexie() {
		if (loadedSave.title == '') {
			let t = prompt('Map Title:');
			if (t != null) {
				loadedSave.title = t;
			} else {
				alert('Cancelled save');
				return;
			}
		}

		console.log(loadedSave);

		let c = JSON.stringify(loadedSave);
		let p = app.renderer.plugins.extract.base64(offsetContainer);

		if (loadedId) {
			const id = await db.mapSaves.update(loadedId, {
				mapTitle: loadedSave.title,
				previewBase64: p,
			});

			await db.mapStrings.update(loadedId, {
				mapString: c,
			});

			console.log(`Updated saved map with id ${loadedId}`);
		} else {
			const id = await db.mapSaves.add({
				mapTitle: loadedSave.title,
				previewBase64: p,
			});

			await db.mapStrings.add({
				mapString: c,
			});

			console.log(`Added map with id ${id}`);
			loadedId = Number(id);
		}

		alert('Saved');
	}

	function loadInit(data: save_data, id: number | null) {
		// Clean up
		console.log(`Loaded ${id}`);
		loading = true;

		loadSave(data, id);
		//await loadSave(data, id)

		data_path.selectedPath = null;
		data_text.selectedText = null;

		//await tick()

		// await tick() // The terrain field needs time to hook onto
		//comp_terrainField.renderAllHexes()
	}

	function loadSave(data: save_data, id: number | null) {
		loadedTilesets = data.tilesets;
		loadedIconsets = data.iconsets;

		tfield = data.TerrainField;
		data_coordinates = data.coords;

		// Load Textures
		loadedTilesets.forEach((tileset) => {
			addTilesetTextures(tileset, L);
		});

		// Load Icons
		loadedIconsets.forEach((iconset: Iconset) => {
			addIconsetTextures(iconset, L);
		});

		//L.onComplete.add( );

		L.load(async () => {
			loadedSave = data;
			loadedId = id;

			let firstTile = loadedTilesets[0].tiles[0];
			data_terrain.tile = { ...firstTile, symbol: firstTile.symbol ? { ...firstTile.symbol } : null };

			let firstIcon = loadedIconsets[0].icons[0];
			data_icon.color = firstIcon.color;
			data_icon.texId = firstIcon.texId;

			// Center the map
			let tf = loadedSave.TerrainField;

			//pan.zoomScale = 1
			if (tf.orientation == 'flatTop') {
				let mapWidth = tf.columns * tf.hexWidth * 0.75 + tf.hexWidth * 0.25;
				let mapHeight = (tf.rows - 1) * tf.hexHeight - tf.hexHeight * 0.5;

				pan.offsetX = window.innerWidth / 2 - (mapWidth / 2) * pan.zoomScale;
				pan.offsetY = window.innerHeight / 2 - (mapHeight / 2) * pan.zoomScale;
			} else {
				let mapHeight = tf.rows * tf.hexHeight * 0.75 + tf.hexHeight * 0.25;
				let mapWidth = (tf.columns - 1) * tf.hexWidth - tf.hexWidth * 0.5;

				pan.offsetX = window.innerWidth / 2 - (mapWidth / 2) * pan.zoomScale;
				pan.offsetY = window.innerHeight / 2 - (mapHeight / 2) * pan.zoomScale;
			}

			loading = false;
			await tick();
			comp_terrainField.clearTerrainSprites();
			comp_terrainField.renderAllHexes();
		});

		/* Set up tools - would be nice to remember tool settings but this works regardless of loaded tileset */

		//loadedSave = data
		//loadedId = id
	}

	function addTilesetTextures(tileset: Tileset, loader: PIXI.Loader) {
		tileset.tiles.forEach(async (tile) => {
			//console.log(tile.symbol.texId)

			if (!tile.symbol) return;

			let entry = Object.entries(L.resources).find(([id, r]) => r.url == tile.symbol.base64);
			if (entry) {
				// Texture already exists! Add this tile's ID to the lookup table
				symbolTextureLookupTable[tile.id] = entry[0];
			} else {
				loader.add(tile.id, tile.symbol.base64);
			}
		});
	}

	function addIconsetTextures(iconset: Iconset, loader: PIXI.Loader) {
		iconset.icons.forEach(async (icon) => {
			//console.log(tile.symbol.texId)

			let entry = Object.entries(L.resources).find(([id, r]) => r.url == icon.base64);

			if (entry) {
				// Texture already exists! Add this tile's ID to the lookup table
				iconTextureLookupTable[icon.texId] = entry[0];
			} else {
				loader.add(icon.texId, icon.base64);
			}
		});
	}

	createNewMap();
</script>

{#if appState == 'normal' && !loading}
	<main
		on:contextmenu|preventDefault={(e) => {}}
		on:wheel={(e) => {
			pan.zoom(e);
		}}
		on:pointerdown={(e) => {
			pointerdown(e);
		}}
		on:pointermove={(e) => {
			pointermove(e);
		}}
		on:pointerup={(e) => {
			pointerup(e);
		}}
	>
		<Pixi {app}>
			<Container instance={offsetContainer} x={pan.offsetX} y={pan.offsetY} scale={{ x: pan.zoomScale, y: pan.zoomScale }}>
				<TerrainField
					bind:this={comp_terrainField}
					bind:data_terrain
					bind:pan
					{controls}
					{L}
					bind:tfield
					{comp_coordsLayer}
					{symbolTextureLookupTable}
				/>

				<PathLayer bind:this={comp_pathLayer} bind:paths={loadedSave.paths} bind:data_path {pan} {controls} {selectedTool} {tfield} />

				<IconLayer
					bind:this={comp_iconLayer}
					bind:icons={loadedSave.icons}
					bind:data_icon
					{L}
					{pan}
					{selectedTool}
					{tfield}
					{controls}
					{iconTextureLookupTable}
				/>

				<!--
          Needs Optimization badly
        -->
				<CoordsLayer bind:this={comp_coordsLayer} bind:data_coordinates tfield={loadedSave.TerrainField} />

				<TextLayer bind:this={comp_textLayer} bind:texts={loadedSave.texts} bind:data_text {pan} />
			</Container>
		</Pixi>
	</main>

	<!-- Terrain Buttons -->
	{#if showTerrainGenerator}
		<TerrainGenerator {loadedTilesets} {tfield} {comp_terrainField} bind:showTerrainGenerator />
	{:else if selectedTool == 'terrain'}
		<TerrainPanel {loadedTilesets} {tfield} {app} {L} bind:data_terrain {symbolTextureLookupTable} />
	{:else if selectedTool == 'icon'}
		<IconPanel {L} {app} {loadedIconsets} bind:data_icon {iconTextureLookupTable} {tfield} />
	{:else if selectedTool == 'path'}
		<PathPanel bind:data_path {comp_pathLayer} bind:pathStyles={loadedSave.pathStyles} />
	{:else if selectedTool == 'text'}
		<TextPanel bind:data_text {comp_textLayer} bind:textStyles={loadedSave.textStyles} />
	{/if}

	<!--
      -->

	<div id="tool-buttons">
		<ToolButtons bind:selectedTool bind:hexOrientation={tfield.orientation} />

		<!--
    
    -->
	</div>

	<div id="setting-buttons">
		<div id="save-buttons">
			<button on:click={saveToDexie} title={'Save'}> <img src="assets/img/tools/save.png" alt="Save" /> </button>
		</div>
		<button
			on:click={() => {
				showSavedMaps = true;
			}}
			title={'Maps'}><img src="assets/img/tools/maps.png" alt="Maps" /></button
		>
		<button
			on:click={() => {
				showSettings = true;
			}}
			title={'Map Settings'}><img src="assets/img/tools/settings.png" alt="Map Settings" /></button
		>
	</div>

	{#if showSavedMaps}
		<SavedMaps bind:showSavedMaps {createNewMap} load={loadInit} />
	{/if}

	<MapSettings
		{loadedSave}
		bind:tfield
		bind:showSettings
		bind:appState
		bind:showTerrainGenerator
		{comp_terrainField}
		{comp_coordsLayer}
		{comp_iconLayer}
		{comp_pathLayer}
		{comp_textLayer}
		bind:data_coordinates
		renderAllHexes={() => {
			comp_terrainField.renderAllHexes();
		}}
		renderGrid={() => {
			comp_terrainField.renderGrid();
		}}
		redrawEntireMap={() => {
			redrawEntireMap();
		}}
		{exportMap}
		load={loadInit}
		{L}
		bind:loadedTilesets
		bind:loadedIconsets
		{addTilesetTextures}
		{addIconsetTextures}
	/>

	<Controls {selectedTool} {data_terrain} {data_icon} {data_path} {data_text} />
{:else if appState == 'tilesetCreator'}
	<TilesetCreator bind:appState />
{:else if appState == 'iconsetCreator'}
	<IconsetCreator bind:appState />
{/if}

<style>
	:root {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

		background-color: #333333;
		color: white;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	:global(h2) {
		font-family: 'Segoe UI';
		font-weight: normal;
		border-bottom: solid 2px #555555;
	}

	:global(html) {
		height: 100%;
		width: 100%;
	}

	:global(body) {
		margin: 0;
		height: 100%;
		width: 100%;
	}

	:global(#app) {
		height: 100%;
		width: 100%;
	}

	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
		background-color: black;
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		padding: 0;
	}


	/* GLOBAL SCROLL BAR */

	/* width */
	:global(::-webkit-scrollbar) {
		width: 8px;
	}

	/* Track */
	:global(::-webkit-scrollbar-track) {
		display: none;
		opacity: 0;
	}

	/* Handle */
	:global(::-webkit-scrollbar-thumb) {
		background: #f2f2f2;
		opacity: 0;
		border-radius: 4px;
		width: 8px;
	}

	/* Handle on hover */
	:global(::-webkit-scrollbar-thumb:hover) {
		opacity: 1;
	}

	/* GLOBAL Checkbox */

	/* Tools */

	#tool-buttons {
		position: fixed;
		top: 10px;
		left: 10px;
	}

	/* SETTING BUTTONS */
	#setting-buttons {
		position: fixed;
		bottom: 10px;
		left: 10px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	#setting-buttons button {
		width: 50px;
		height: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
