<script lang="ts">
	/* COLORS
hexfriend green: #8cc63f
hexfiend red: #FF6666
*/

	/* TODO 
// CORE FUNCTIONS
- tooltips
- keyboard shortcuts

// POLISH / ROADMAP
// not ranked
- terrain generator function validation
- terrain generator
- floating loaders - better feedback
- save data checking (if loading, making new map, quitting)
- export at different sizes
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
	// Layers
	import CoordsLayer from './layers/CoordsLayer.svelte';
	import IconLayer from './layers/IconLayer.svelte';
	import PathLayer from './layers/PathLayer.svelte';
	import TerrainLayer from './layers/TerrainLayer.svelte';
	import TextLayer from './layers/TextLayer.svelte';
	import OverlayLayer from './layers/OverlayLayer.svelte';
	import { db } from './lib/db';
	// Data
	import DEFAULTSAVEDATA from './lib/defaultSaveData';
	// Methods
	//import { collapseWaveGen } from './lib/terrainGenerator'
	import { download } from './lib/download2';
	// Panels
	import IconPanel from './panels/IconPanel.svelte';
	import PathPanel from './panels/PathPanel.svelte';
	import TerrainPanel from './panels/TerrainPanel.svelte';
	import TextPanel from './panels/TextPanel.svelte';
	// GLOBAL STYLES
	import './styles/inputs.css';
	import './styles/panels.css';
	import './styles/scrollbar.css';
	import { coord_system } from './types/coordinates';
	import type { coordinates_data, eraser_data, icon_data, path_data, terrain_data, text_data, trace_data } from './types/data';
	import type { Iconset } from './types/icon';
	import type { save_data } from './types/savedata';
	import type { terrain_field } from './types/terrain';
	import type { Tileset } from './types/tilesets';
	import { tools } from './types/toolData';
	import * as PIXI from 'pixi.js';
	import { tick } from 'svelte';
	import { Container, Pixi } from 'svelte-pixi';
	import type { pan_state } from './types/panning';
	import type { input_state } from './types/inputs';

	import { getKeyboardShortcut } from './lib/keyboardShortcuts'

	import * as store_tfield from './stores/tfield';
	import * as store_panning from './stores/panning';
	import * as store_inputs from './stores/inputs';

	import ShortcutList from './components/ShortcutList.svelte'
import { map_shape } from './types/settings';

	/* STATE */

	let dataToLoad = {
		data: DEFAULTSAVEDATA,
		id: null
	}

	let loadedSave: save_data = null;
	let loadedId: number | null = null;

	enum app_state {
		NORMAL = 'normal',
		TILESETCREATOR = 'tilesetCreator',
		ICONSETCREATOR = 'iconsetCreator',
		LOADINGMAP = "loadingMap"
	}

	let appState: app_state = app_state.LOADINGMAP;

	let showSettings = false;
	let showTerrainGenerator = false;
	let showLoader: boolean = false;
	let showKeyboardShortcuts: boolean = false;
	let showControls: boolean = true;

	let offsetContainer = new PIXI.Container();

	/* STUFF TO BIND TO */
	let comp_terrainLayer: TerrainLayer;
	let comp_iconLayer: IconLayer;
	let comp_pathLayer: PathLayer;
	let comp_textLayer: TextLayer;
	let comp_coordsLayer: CoordsLayer;

	let comp_shortcutList: ShortcutList;

	//offsetContainer.addChild(terrainGraphics);

	/* APPLICATION */
	let app = new PIXI.Application({
		backgroundAlpha: 0,
		width: window.innerWidth,
		height: window.innerHeight,
		resizeTo: window,
	});

	PIXI.settings.RESOLUTION = 4

	let showSavedMaps = false;

	let loading = true;

	let loadedTilesets: Tileset[];
	let loadedIconsets: Iconset[];
	
	let tfield: terrain_field;
	store_tfield.store.subscribe((newTField) => {
		tfield = newTField;
	});

	let pan: pan_state;
	store_panning.store.subscribe(newPan => {
		pan = newPan;
	})

	let controls: input_state;
	store_inputs.store.subscribe((newInputState) => {
		controls = newInputState
	});
	

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
		hoveredPath: null,
		selectedPath: null,
		dontSelectPaths: null,
		snap: false,
		contextPathId: null
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

	let data_eraser: eraser_data = {
		ignoreTerrain: false,
		ignoreIcons: false
	}

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
		
		showLoader = true;

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

		showLoader = false;
	}

	function redrawEntireMap() {
		// Refreshes all hexes and coordinates
		comp_terrainLayer.renderAllHexes();
	}

	/* TOOL METHODS */
	function changeTool(newTool: tools) {
		
		// A list of stuff that needs to happen every tool change
		data_path.contextPathId = null

		selectedTool = newTool
	}

	/* ALL PURPOSE POINTER METHODS */
	function pointerdown(e: PointerEvent) {
		controls.mouseDown[e.button] = true;

		if (controls.mouseDown[2]) store_panning.handlers.startPan(e);

		if (controls.mouseDown[0]) {
			switch (selectedTool) {
				case tools.TERRAIN:
					comp_terrainLayer.pointerdown();
					break;

				case tools.ICON:
					comp_iconLayer.pointerdown();
					break;

				case tools.PATH:
					comp_pathLayer.pointerdown();
					break;

				case tools.TEXT:
					comp_textLayer.pointerdown();
					break;

				case tools.ERASER:
					if (!data_eraser.ignoreTerrain) { comp_terrainLayer.eraseAtMouse(); }
					/* Icons are handled in the IconLayer */
					break;
			}
		}
	}

	function pointerup(e: PointerEvent) {
		controls.mouseDown[e.button] = false;

		if (!controls.mouseDown[2]) store_panning.handlers.endPan();

		switch (selectedTool) {
			case tools.ICON:
				comp_iconLayer.pointerup();
				break;

			case tools.TEXT:
				comp_textLayer.pointerup();
				break;
		}
	}

	function pointermove(e: PointerEvent) {
		store_panning.handlers.handle(e);

		switch (selectedTool) {
			case tools.TERRAIN:
				if (controls.mouseDown[0]) comp_terrainLayer.pointerdown();
				break;

			case tools.ICON:
				comp_iconLayer.pointermove();
				break;

			case tools.TEXT:
				comp_textLayer.pointermove();
				break;

			case tools.ERASER:
				if (controls.mouseDown[0]) {
					if (!data_eraser.ignoreTerrain) comp_terrainLayer.eraseAtMouse();
				}
				/* Icons are handled differently in the icon handler */
				break;
		}
	}

	function pointerOffLayers(e: PointerEvent) {

		switch (selectedTool) {
			case tools.ICON:
				comp_iconLayer.pointerout(e)
				break;
		}

	}

	function handleShortcuts(e: KeyboardEvent) {
		// Generate key code
		let keycode="";

		if (e.ctrlKey) keycode += "control+"
		if (e.shiftKey) keycode += "shift+"
		if (e.altKey) keycode += "alt+"
		keycode += e.key.toLowerCase()

		if (e.key == "Alt") keycode = "alt";
		if (e.key == "Shift") keycode = "shift";
		if (e.key == "Control") keycode = "control";

		let shortcutData = getKeyboardShortcut(keycode, selectedTool);

		//console.log(keycode);
		if (shortcutData) {

				switch (shortcutData.tool) {
					case (null):
						
						switch (shortcutData.function) {
							
						
						case "save":
							saveToDexie();
							break;

						case "toggleViewMaps":
							showSavedMaps = !showSavedMaps;
							break;
						
						case "toggleViewSettings":
							showSettings = !showSettings;
							break;

						case "toggleShortcutList":
							showKeyboardShortcuts = !showKeyboardShortcuts
							break;

						case "toggleControls":
							showControls = !showControls;
							break;

						case "backToMainView":
							showSavedMaps = false;
							showSettings = false;
							showKeyboardShortcuts = false;
							data_path.contextPathId = null;
							break;

						case "changeTool_terrain":
							changeTool(tools.TERRAIN)
							break
						case "changeTool_icon":
							changeTool(tools.ICON)
							break
						case "changeTool_path":
							changeTool(tools.PATH)
							break
						case "changeTool_text":
							changeTool(tools.TEXT)
							break
						case "changeTool_eraser":
							changeTool(tools.ERASER)
							break
						
						


					}

					break;
				
				case (tools.TERRAIN):
					comp_terrainLayer.handleKeyboardShortcut(shortcutData);
					break;

				case (tools.ICON):
					comp_iconLayer.handleKeyboardShortcut(shortcutData);
					break;

				case (tools.PATH):
					comp_pathLayer.handleKeyboardShortcut(shortcutData);
					break;
				
				case (tools.TEXT):
					comp_textLayer.handleKeyboardShortcut(shortcutData);
					break;


			}
		}
	}

	/* KEYBOARD EVENTS */
	function keyDown(e: KeyboardEvent) {

		// Prevent keyboard shortcuts
		if (e.target.type == "number" || e.target.type == "textarea" || e.target.type == "text") {
			return;
		}


		if (comp_shortcutList && e.key != "Escape" && !(e.key == "k" && e.ctrlKey)) {
			e.preventDefault();
			comp_shortcutList.keydown(e);
			return;
		}

		// Conditions under which we don't want to prevent default
		if (data_text.editorRef) {
			
			if (e.ctrlKey) {
				e.preventDefault();
			}

		} else {

			e.preventDefault();
		}

		handleShortcuts(e);


		// Some more active keyboard listeners require these methods to be called
		switch (selectedTool) {
			case (tools.TERRAIN): {

				comp_terrainLayer.keydown(e);
				break;

			}

			case (tools.PATH): {
				comp_pathLayer.keydown(e);
				break;
			}

			case (tools.ERASER): {
				if (e.key == "Shift") data_eraser.ignoreIcons = true;
				if (e.key == "Control") data_eraser.ignoreTerrain = true;
				break;
			}
		}
		
		
	}
	
	function keyUp(e: KeyboardEvent) {
		
		if (comp_shortcutList) {
			comp_shortcutList.keyup(e);
		}

		switch (selectedTool) {
			case (tools.TERRAIN): {
				
				comp_terrainLayer.keyup(e);
				break;
				
			}

			case (tools.PATH): {
				comp_pathLayer.keyup(e);
				break;
			}

			case (tools.ERASER): {
				if (e.key == "Shift") data_eraser.ignoreIcons = false;
				if (e.key == "Control") data_eraser.ignoreTerrain = false;
				break;
			}
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
				saveVersion: loadedSave.saveVersion
			});

			await db.mapStrings.update(loadedId, {
				mapString: c,
			});

			console.log(`Updated saved map with id ${loadedId}`);
		} else {
			const id = await db.mapSaves.add({
				mapTitle: loadedSave.title,
				previewBase64: p,
				saveVersion: loadedSave.saveVersion
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

		dataToLoad = {data: data, id: id}
		appState = app_state.LOADINGMAP


		//loadSave(data, id);
		//await loadSave(data, id)

		data_path.selectedPath = null;
		data_text.selectedText = null;

		// await tick() // The terrain field needs time to hook onto
		//comp_terrainLayer.renderAllHexes()
	}

	function loadSave(data: save_data, id: number | null) {
		loadedTilesets = data.tilesets;
		loadedIconsets = data.iconsets;

		store_tfield.store.set(data.TerrainField)
		//tfield = data.TerrainField;
		
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
			
			
			store_panning.store.update(pan => {
				
				if (tf.mapShape == map_shape.SQUARE) {
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

				} else {

					pan.offsetX = window.innerWidth / 2;
					pan.offsetY = window.innerHeight / 2;

				}
				return pan;
				
			})


			await tick();

			// Final Layer Setup
			//comp_iconLayer.saveOldHexMeasurements(tfield.hexWidth, tfield.hexHeight);

			//comp_coordsLayer.cullUnusedCoordinates();
			//comp_coordsLayer.updateAllCoordPositions();
			//comp_coordsLayer.populateBlankHexes();
			
			//comp_terrainLayer.clearTerrainSprites();
			//comp_terrainLayer.renderAllHexes();

			// Jolt all the layers that respond to the data into place. Without this the text, icons and paths kinda get stuck. It's odd. Warrants further investigation.
			loadedSave = loadedSave;
			appState = app_state.NORMAL;
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

	//createNewMap();
</script>

<svelte:window
	on:keydown={keyDown}
	on:keyup|preventDefault={keyUp}
/>

{#if appState == app_state.NORMAL}
	


	<main
		on:contextmenu|preventDefault={(e) => {}}
		on:wheel={(e) => {
			store_panning.handlers.zoom(e);
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

		on:pointerout={(e) => {
			pointerOffLayers(e);
		}}		

		on:keydown={keyDown}
		on:keyup={keyUp}
	>

		

		<Pixi {app}>
			<Container instance={offsetContainer} x={pan.offsetX} y={pan.offsetY} scale={{ x: pan.zoomScale, y: pan.zoomScale }}>
				

				<TerrainLayer
					bind:this={comp_terrainLayer}
					bind:data_terrain
					{controls}
					{L}
					{comp_coordsLayer}
					{symbolTextureLookupTable}
				/>

				<PathLayer 
					bind:this={comp_pathLayer}
					bind:paths={loadedSave.paths}
					bind:data_path
					{controls}
					{selectedTool} />

				<IconLayer
					bind:this={comp_iconLayer}
					bind:icons={loadedSave.icons}
					bind:data_icon
					{data_eraser}
					{L}
					{selectedTool}
					{controls}
					{iconTextureLookupTable}
				/>

				<!--
          Needs Optimization badly
        -->
				
				<OverlayLayer />

				<CoordsLayer
					bind:this={comp_coordsLayer}
					bind:data_coordinates
				/>

				<TextLayer 
					bind:this={comp_textLayer}
					bind:texts={loadedSave.texts}
					bind:data_text
				/>

				

			</Container>
		</Pixi>
	</main>

	<!-- Terrain Buttons -->
	{#if showTerrainGenerator}
		<TerrainGenerator {loadedTilesets} comp_terrainLayer={comp_terrainLayer} bind:showTerrainGenerator />
	{:else if selectedTool == 'terrain'}
		<TerrainPanel {loadedTilesets} {app} {L} bind:data_terrain {symbolTextureLookupTable} />
	{:else if selectedTool == 'icon'}
		<IconPanel {L} {app} {loadedIconsets} bind:data_icon {iconTextureLookupTable} />
	{:else if selectedTool == 'path'}
		<PathPanel bind:data_path {comp_pathLayer} bind:pathStyles={loadedSave.pathStyles} />
	{:else if selectedTool == 'text'}
		<TextPanel bind:data_text {comp_textLayer} bind:textStyles={loadedSave.textStyles} />
	{/if}


	<div id="tool-buttons">
		<ToolButtons bind:selectedTool bind:hexOrientation={tfield.orientation} changeTool={changeTool} />
	</div>

	<div id="setting-buttons">
		<div id="save-buttons">
			<button on:click={saveToDexie} title={'Save'}> <img src="assets/img/tools/save.png" alt="Save" /> </button>
		</div>
		<button
			on:click={() => {
				showSavedMaps = true;
			}}
			title={'Maps'}>
			<img src="assets/img/tools/maps.png" alt="Maps" />
		</button>
		
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

	{#if showKeyboardShortcuts}
		<ShortcutList bind:this={comp_shortcutList} />
	{/if}

	<MapSettings
		{loadedSave}
		
		bind:showSettings
		bind:appState
		bind:showTerrainGenerator
		bind:data_coordinates

		{addTilesetTextures}
		{addIconsetTextures}
		bind:loadedTilesets
		bind:loadedIconsets

		{comp_terrainLayer}
		{comp_coordsLayer}
		{comp_iconLayer}
		{comp_pathLayer}
		{comp_textLayer}

		{L}

		renderAllHexes={() => {
			comp_terrainLayer.renderAllHexes();
		}}
		renderGrid={() => {
			comp_terrainLayer.renderGrid();
		}}
		redrawEntireMap={() => {
			redrawEntireMap();
		}}
		{exportMap}
		load={loadInit}
	/>

	{#if showControls}
		<Controls {selectedTool} {data_terrain} {data_icon} {data_path} {data_text} {data_eraser} />
	{/if}

{:else if appState == app_state.TILESETCREATOR}
	<TilesetCreator bind:appState />
{:else if appState == app_state.ICONSETCREATOR}
	<IconsetCreator bind:appState />

{:else if appState == app_state.LOADINGMAP}

		<img src="../public/assets/img/site/hexfriend.png" on:load={ () => { console.log("Loading save now"); loadSave( dataToLoad.data, dataToLoad.id ) } }/>



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
