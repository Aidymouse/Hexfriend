<script lang="ts">
	/* COLORS //
hexfriend green: #8cc63f
hexfiend red: #FF6666
*/

	/* TODO //
// CORE FUNCTIONS
- overlay layer
- tooltips
- keyboard shortcuts - make sure all are working
- undo / redo
- find more of a fix for why PIXI objects stick around when a new map is loaded
// POLISH / ROADMAP
// not ranked
- terrain generator
- terrain generator function validation
- floating loaders - better feedback
- save data checking (if loading, making new map, quitting)
- export at different sizes
- dashed line
- more fonts
- tests?? I dont think I'm a real enough dev
- abolish technical debt
*/

	/* BUGS //
- symbol size is weird in preview when hex size is big
- coordinates show under some stuff for some reason
*/
	// Components
	import CanvasHolder from './components/CanvasHolder.svelte';
	import IconGenerator from './components/IconGenerator.svelte';
	import IconsetCreator from './components/IconsetCreator.svelte';
	import SavedMaps from './components/SavedMaps.svelte';
	import MapSettings from './components/Settings.svelte';
	import ShortcutList from './components/ShortcutList.svelte';
	import TerrainGenerator from './components/TerrainGenerator.svelte';
	import TilesetCreator from './components/TilesetCreator.svelte';
	import ToolButtons from './components/ToolButtons.svelte';
	import ControlTooltips from './components/TooltipsPane.svelte';
	// Layers
	import CoordsLayer from './layers/CoordsLayer.svelte';
	import IconLayer from './layers/IconLayer.svelte';
	import LargeHexesLayer from './layers/LargeHexesLayer.svelte';
	import OverlayLayer from './layers/OverlayLayer.svelte';
	import PathLayer from './layers/PathLayer.svelte';
	import TerrainLayer from './layers/TerrainLayer.svelte';
	import TextLayer from './layers/TextLayer.svelte';
	import { db } from './lib/db';
	// Data
	import DEFAULTSAVEDATA from './lib/defaultSaveData';
	// Methods
	//import { collapseWaveGen } from './lib/terrainGenerator'
	import { download } from './lib/download2';
	import { getKeyboardShortcut } from './lib/keyboardShortcuts';
	import { convertSaveDataToLatest } from './lib/saveDataConverter';
	// Lib
	import * as texture_loader from './lib/texture_loader';
	// Panels
	import IconPanel from './panels/IconPanel.svelte';
	import OverlayPanel from './panels/OverlayPanel.svelte';
	import PathPanel from './panels/PathPanel.svelte';
	import TerrainPanel from './panels/TerrainPanel.svelte';
	import TextPanel from './panels/TextPanel.svelte';
	import * as store_inputs from './stores/inputs';
	import * as store_panning from './stores/panning';
	import * as store_tfield from './stores/tfield';
	import { store_selected_tool } from './stores/tools';
	import './styles/inputs.css';
	import './styles/panels.css';
	import './styles/scrollbar.css';
	// GLOBAL STYLES
	import './styles/variables.css';
	import { coord_system } from './types/coordinates';
	// TYPES
	import type { coordinates_data, eraser_data, icon_data, overlay_data, path_data, terrain_data, text_data, trace_data } from './types/data';
	import type { Iconset } from './types/icon';
	import type { input_state } from './types/inputs';
	import type { pan_state } from './types/panning';
	import type { save_data } from './types/savedata';
	// Constants
	import { LATESTSAVEDATAVERSION, LATESTDEFAULTTILESVERSION, LATESTDEFAULTICONSVERSION } from './types/savedata';
	import { map_shape } from './types/settings';
	import type { terrain_field } from './types/terrain';
	import type { Tileset } from './types/tilesets';
	// Enums
	import { tools } from './types/toolData';
	import * as PIXI from 'pixi.js';
	import { afterUpdate, onMount } from 'svelte';

	/* STATE */

	let dataToLoad = {
		data: DEFAULTSAVEDATA,
		id: null,
	};

	let loadedSave: save_data = null;
	let loadedId: number | null = null;

	enum app_state {
		NORMAL = 'normal',
		TILESETCREATOR = 'tilesetCreator',
		ICONSETCREATOR = 'iconsetCreator',
		LOADINGMAP = 'loadingMap',
	}

	let appState: app_state = app_state.NORMAL;

	let showSettings = false;
	let showTerrainGenerator = false;
	let show_icon_generator = false;
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
	let comp_overlayLayer: OverlayLayer;

	let comp_shortcutList: ShortcutList;

	//offsetContainer.addChild(terrainGraphics);

	/* PIXI CONTAINERS */
	let cont_icon = new PIXI.Container();
	let cont_terrain = new PIXI.Container();
	let cont_all_paths = new PIXI.Container();
	let cont_all_text = new PIXI.Container();
	let cont_coordinates = new PIXI.Container();
	let cont_largehexes = new PIXI.Container();
	let cont_overlay = new PIXI.Container();

	/* APPLICATION */
	let app = new PIXI.Application({
		backgroundAlpha: 0,
		width: window.innerWidth,
		height: window.innerHeight,
		resizeTo: window,
	});

	let showSavedMaps = false;

	let saving = false;

	let loadedTilesets: Tileset[];
	let loadedIconsets: Iconset[];

	let tfield: terrain_field;
	store_tfield.store.subscribe((newTField) => {
		tfield = newTField;
	});

	let pan: pan_state;
	store_panning.store.subscribe((newPan) => {
		pan = newPan;
	});

	// This makes panning update smoothly
	$: {
		pan = pan;
	}

	let controls: input_state;
	store_inputs.store.subscribe((newInputState) => {
		controls = newInputState;
	});

	let selectedTool;
	store_selected_tool.subscribe((t) => {
		selectedTool = t;
	});

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
		dragMode: false,
	};

	let data_path: path_data = {
		style: { color: 0, width: 3, cap: PIXI.LINE_CAP.ROUND, join: PIXI.LINE_JOIN.ROUND },
		hoveredPath: null,
		selectedPath: null,
		dontSelectPaths: null,
		snap: false,
		contextPathId: null,
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
		alpha: 1,
		selectedText: null,
		editorRef: null,
		usingTextTool: false,
		contextStyleId: null,
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
		ignoreIcons: false,
	};

	let data_overlay: overlay_data = {
		shown: true,
		base64: '',
		x: 0,
		y: 0,
		scale: { x: 1, y: 1 },
		opacity: 0.5,
	};

	//let L = new PIXI.Loader()

	// Never cleared, to stop duplicate textures being added
	// Theoretically a memory leak... but bounded by how many unique tiles can be loaded. Shouldn't be a problem?

	async function exportMap(exportType) {
		showLoader = true;

		switch (exportType) {
			case 'image/png':
				download(
					await app.renderer.extract.base64(offsetContainer),
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
		data_path.contextPathId = null;
		data_text.contextStyleId = null;

		data_path.selectedPath = null;

		store_selected_tool.update((n) => newTool);
	}

	/* ALL PURPOSE POINTER METHODS */
	function pointerdown(e: PointerEvent) {
		store_panning.handlers.handle(e);
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
					if (!data_eraser.ignoreTerrain) {
						comp_terrainLayer.eraseAtMouse();
					}
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

			case tools.OVERLAY:
				comp_overlayLayer.pointerup();
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

			case tools.OVERLAY:
				comp_overlayLayer.pointermove();
				break;
		}
	}

	function pointerOffLayers(e: PointerEvent) {
		switch (selectedTool) {
			case tools.ICON:
				comp_iconLayer.pointerout(e);
				break;
		}
	}

	/* KEYBOARD EVENTS */
	function handleShortcuts(e: KeyboardEvent) {
		// Generate key code
		let keycode = '';

		if (e.ctrlKey) keycode += 'control+';
		if (e.shiftKey) keycode += 'shift+';
		if (e.altKey) keycode += 'alt+';
		keycode += e.key.toLowerCase();

		if (e.key == 'Alt') keycode = 'alt';
		if (e.key == 'Shift') keycode = 'shift';
		if (e.key == 'Control') keycode = 'control';

		let shortcutData = getKeyboardShortcut(keycode, selectedTool);
		if (!shortcutData) return;
		//console.log(keycode);

		switch (shortcutData.tool) {
			case null:
				switch (shortcutData.function) {
					case 'save':
						saveInit();
						break;

					case 'toggleViewMaps':
						showSavedMaps = !showSavedMaps;
						break;

					case 'toggleViewSettings':
						showSettings = !showSettings;
						break;

					case 'toggleShortcutList':
						showKeyboardShortcuts = !showKeyboardShortcuts;
						break;

					case 'toggleControls':
						showControls = !showControls;
						break;

					case 'backToMainView':
						showSavedMaps = false;
						showSettings = false;
						showKeyboardShortcuts = false;
						data_path.contextPathId = null;
						data_text.contextStyleId = null;
						break;

					case 'changeTool_terrain':
						changeTool(tools.TERRAIN);
						break;
					case 'changeTool_icon':
						changeTool(tools.ICON);
						break;
					case 'changeTool_path':
						changeTool(tools.PATH);
						break;
					case 'changeTool_text':
						changeTool(tools.TEXT);
						break;
					case 'changeTool_eraser':
						changeTool(tools.ERASER);
						break;
					case 'changeTool_overlay':
						if (data_overlay.base64 != '') changeTool(tools.OVERLAY);
						break;

					case 'toggle_overlay':
						if (data_overlay.base64 != '') data_overlay.shown = !data_overlay.shown;
						break;
				}

				break;

			case tools.TERRAIN:
				comp_terrainLayer.handleKeyboardShortcut(shortcutData);
				break;

			case tools.ICON:
				comp_iconLayer.handleKeyboardShortcut(shortcutData);
				break;

			case tools.PATH:
				comp_pathLayer.handleKeyboardShortcut(shortcutData);
				break;

			case tools.TEXT:
				comp_textLayer.handleKeyboardShortcut(shortcutData);
				break;
		}
	}

	function keyDown(e: KeyboardEvent) {
		if (appState != app_state.NORMAL) return;

		// Prevent keyboard shortcuts
		if (e.target.type == 'number' || e.target.type == 'textarea' || e.target.type == 'text') {
			return;
		}

		// Hardcoded alt code to stop alt tools getting stuck
		if (e.altKey && e.key == "tab") {
			
		}

		if (comp_shortcutList && e.key != 'Escape' && !(e.key == 'k' && e.ctrlKey)) {
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
			case tools.TERRAIN: {
				comp_terrainLayer.keydown(e);
				break;
			}

			case tools.ICON: {
				comp_iconLayer.keydown(e);
				break;
			}

			case tools.PATH: {
				comp_pathLayer.keydown(e);
				break;
			}

			case tools.ERASER: {
				if (e.key == 'Shift') data_eraser.ignoreIcons = true;
				if (e.key == 'Control') data_eraser.ignoreTerrain = true;
				break;
			}
		}
	}

	function keyUp(e: KeyboardEvent) {
		if (appState != app_state.NORMAL) return;

		if (comp_shortcutList) {
			comp_shortcutList.keyup(e);
		}

		switch (selectedTool) {
			case tools.TERRAIN: {
				comp_terrainLayer.keyup(e);
				break;
			}

			case tools.ICON: {
				comp_iconLayer.keyup(e);
				break;
			}

			case tools.PATH: {
				comp_pathLayer.keyup(e);
				break;
			}

			case tools.ERASER: {
				if (e.key == 'Shift') data_eraser.ignoreIcons = false;
				if (e.key == 'Control') data_eraser.ignoreTerrain = false;
				break;
			}
		}
	}

	function blur() {
		data_terrain.usingEyedropper = false;
	}

	function createNewMap() {
		/* TODO: Save Data Checking */

		loadInit(JSON.parse(JSON.stringify(DEFAULTSAVEDATA)), null);
	}

	async function saveInit() {
		// = asyncExtract(app, offsetContainer)
		if (loadedSave.title == '') {
			let t = prompt('Map Title:');
			if (t != null) {
				loadedSave.title = t;
			} else {
				saving = false;
				return;
			}
		}
		//console.log("What")
		saving = true;
	}

	async function asyncExtract(app, container): Promise<string> {
		await null;
		return new Promise((r) => r(app.renderer.extract.base64(container)));
	}

	async function saveToDexie() {
		console.log(loadedSave);

		let c = JSON.stringify(loadedSave);

		let p;

		let p1 = asyncExtract(app, offsetContainer)
			.catch((error) => {
				console.log('Oh no');

				p = '';
			})
			.then((r) => (p = r));

		await p1;

		if (loadedId) {
			db.mapSaves.update(loadedId, {
				mapTitle: loadedSave.title,
				previewBase64: p,
				saveVersion: loadedSave.saveVersion,
			});

			db.mapStrings.update(loadedId, {
				mapString: c,
			});

			console.log(`Updated saved map with id ${loadedId}`);
		} else {
			const id = await db.mapSaves.add({
				mapTitle: loadedSave.title,
				previewBase64: p,
				saveVersion: loadedSave.saveVersion,
			});

			await db.mapStrings.add({
				mapString: c,
			});

			console.log(`Added map with id ${id}`);
			loadedId = Number(id);
		}

		saving = false;
	}

	function loadInit(data: save_data, id: number | null) {
		// Clean up
		console.log(`Loaded ${id}`);

		// Deal with outdated save data
		if (data.saveVersion < LATESTSAVEDATAVERSION) data = convertSaveDataToLatest(data);

		dataToLoad = { data: data, id: id };
		appState = app_state.LOADINGMAP;

		//loadSave(data, id);
		//await loadSave(data, id)

		data_path.selectedPath = null;
		data_text.selectedText = null;

		// await tick() // The terrain field needs time to hook onto
		//comp_terrainLayer.renderAllHexes()
	}

	async function loadSave(data: save_data, id: number | null) {
		loadedTilesets = data.tilesets;
		loadedIconsets = data.iconsets;

		// Check if default tile or iconset need updating
		let loaded_default = data.tilesets.find(ts => ts.id.split(":")[0] == "default")
		if (loaded_default.version != LATESTDEFAULTTILESVERSION) {
			//data.tilesets.pop(loaded_default)
		}

		let loaded_iconset = data.iconsets.find(ts => ts.id.split(":")[0] == "default")

		// Load Textures
		for (const tileset of loadedTilesets) {
			console.log(`Loading textures for ${tileset.name}`);
			await texture_loader.load_tileset_textures(tileset);
		}

		// Load Icons
		for (const iconset of loadedIconsets) {
			console.log(`Loading icon textures for ${iconset.name}`);
			await texture_loader.load_iconset_textures(iconset);
		}

		store_tfield.store.set(data.TerrainField);
		//tfield = data.TerrainField;

		data_coordinates = data.coords;

		data_overlay = data.overlay;
		if (selectedTool == tools.OVERLAY && data_overlay.base64 == '') store_selected_tool.update((n) => tools.TERRAIN);

		//console.log(PIXI_Assets.Assets)

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

		store_panning.store.update((pan) => {
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
		});

		appState = app_state.NORMAL;

		// Final Layer Setup
		//comp_iconLayer.saveOldHexMeasurements(tfield.hexWidth, tfield.hexHeight);

		//comp_coordsLayer.cullUnusedCoordinates();
		//comp_coordsLayer.updateAllCoordPositions();
		//comp_coordsLayer.populateBlankHexes();

		//comp_terrainLayer.clearTerrainSprites();
		//comp_terrainLayer.renderAllHexes();

		// Jolt all the layers that respond to the data into place. Without this the text, icons and paths kinda get stuck. It's odd. Warrants further investigation.
		loadedSave = loadedSave;

		/* Set up tools - would be nice to remember tool settings but this works regardless of loaded tileset */

		//loadedSave = data
		//loadedId = id
	}

	createNewMap();

	/* Order matters */
	/* TODO: Put this somewhere better, add other layers */

	offsetContainer.addChild(cont_terrain);
	offsetContainer.addChild(cont_all_paths);
	offsetContainer.addChild(cont_icon);
	offsetContainer.addChild(cont_coordinates);
	offsetContainer.addChild(cont_largehexes);
	offsetContainer.addChild(cont_all_text);
	offsetContainer.addChild(cont_overlay);

	app.stage.addChild(offsetContainer);

	afterUpdate(() => {
		// Update offset container X, Y, scale

		offsetContainer.x = pan.offsetX;
		offsetContainer.y = pan.offsetY;
		offsetContainer.scale.x = pan.zoomScale;
		offsetContainer.scale.y = pan.zoomScale;
	});

	onMount(() => {});
</script>

<svelte:window on:keydown={keyDown} on:keyup|preventDefault={keyUp} on:blur={blur}/>

{#if appState == app_state.NORMAL}
	<main id="content-arranger">
		{#if saving}
			<div id="save-indicator">
				<img
					src="../assets/img/site/hexfriend.png"
					on:load={() => {
						setTimeout(() => {
							saveToDexie();
						}, 30);
					}}
					alt={'Saving...'}
				/>
				<p>Saving...</p>
			</div>
		{/if}

		<section
			id="main-app"
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
			<CanvasHolder {app} />

			<TerrainLayer bind:cont_terrain bind:this={comp_terrainLayer} {changeTool} bind:data_terrain {controls} {comp_coordsLayer} />
			<PathLayer bind:this={comp_pathLayer} bind:cont_all_paths bind:paths={loadedSave.paths} bind:data_path {controls} />
			<IconLayer bind:this={comp_iconLayer} bind:icons={loadedSave.icons} bind:data_icon bind:cont_icon {data_eraser} {controls} />
			<CoordsLayer bind:cont_coordinates bind:this={comp_coordsLayer} bind:data_coordinates />
			<LargeHexesLayer bind:cont_largehexes />
			<TextLayer bind:cont_all_text bind:this={comp_textLayer} bind:texts={loadedSave.texts} bind:data_text />
			<OverlayLayer bind:this={comp_overlayLayer} bind:cont_overlay bind:data_overlay {app} />
		</section>

		<!-- Panels -->
		{#if showTerrainGenerator}
			<TerrainGenerator {loadedTilesets} {comp_terrainLayer} bind:showTerrainGenerator />
		{:else if show_icon_generator}
			<IconGenerator {loadedIconsets} {comp_iconLayer} bind:show_icon_generator />
		{:else if selectedTool == 'terrain'}
			<TerrainPanel {loadedTilesets} {app} bind:data_terrain />
		{:else if selectedTool == 'icon'}
			<IconPanel {app} {loadedIconsets} bind:data_icon />
		{:else if selectedTool == 'path'}
			<PathPanel bind:data_path {comp_pathLayer} bind:pathStyles={loadedSave.pathStyles} />
		{:else if selectedTool == 'text'}
			<TextPanel bind:data_text {comp_textLayer} bind:textStyles={loadedSave.textStyles} />
		{:else if selectedTool == tools.OVERLAY}
			<OverlayPanel bind:data_overlay />
		{/if}

		<div id="tool-buttons">
			<ToolButtons
				bind:selectedTool
				bind:hexOrientation={tfield.orientation}
				{changeTool}
				bind:data_terrain
				bind:data_icon
				bind:data_path
				bind:data_overlay
			/>
		</div>

		<div id="setting-buttons">
			<button
				on:click={() => {
					showSettings = true;
				}}
				title={'Map Settings'}><img src="assets/img/tools/settings.png" alt="Map Settings" /></button
			>
			<button
				on:click={() => {
					var theme = document.documentElement.getAttribute('data-theme');
					if (theme == 'dark') {
						theme = 'light';
					} else {
						theme = 'dark';
					}
					document.documentElement.setAttribute('data-theme', theme);
					document.querySelector('meta[name="color-scheme"]').setAttribute("content", theme);
				}}
				title={'Toggle theme'}><img src="assets/img/tools/moon-sun.svg" alt="Theme" /></button
			>
			<button
				on:click={() => {
					showSavedMaps = true;
				}}
				title={'Maps'}
			>
				<img src="assets/img/tools/maps.png" alt="Maps" />
			</button>
			<div>
				<button on:click={saveInit} title={'Save'}> <img src="assets/img/tools/save.png" alt="Save" /> </button>
			</div>
		</div>

		{#if showKeyboardShortcuts}
			<ShortcutList bind:this={comp_shortcutList} />
		{/if}

		<SavedMaps bind:showSavedMaps {createNewMap} load={loadInit} />

		<MapSettings
			{loadedSave}
			bind:showSettings
			bind:appState
			bind:showTerrainGenerator
			bind:show_icon_generator
			bind:data_coordinates
			bind:data_overlay
			bind:loadedTilesets
			bind:loadedIconsets
			{comp_terrainLayer}
			{comp_coordsLayer}
			{comp_iconLayer}
			{comp_pathLayer}
			{comp_textLayer}
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
			<ControlTooltips {data_terrain} {data_icon} {data_path} {data_text} {data_eraser} {data_overlay} />
		{/if}
	</main>
{:else if appState == app_state.TILESETCREATOR}
	<TilesetCreator bind:appState />
{:else if appState == app_state.ICONSETCREATOR}
	<IconsetCreator bind:appState />
{:else if appState == app_state.LOADINGMAP}
	<div id="loading-screen">
		<img
			src="../assets/img/site/hexfriend.png"
			alt={'Loading'}
			on:load={() => {
				setTimeout(() => {
					loadSave(dataToLoad.data, dataToLoad.id);
				}, 100);
			}}
		/>
	</div>
{/if}

<style>
	:root {
		font-family: var(--font);

		background-color: var(--primary-background);
		color: var(--text);
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	:global(h2) {
		font-weight: normal;
		border-bottom: solid 0.125em var(--light-background);
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

	#content-arranger {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#loading-screen {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#loading-screen img {
		width: 50px;
		height: 50px;
		animation-name: spin;
		animation-duration: 2s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

	#save-indicator {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.5);
		position: fixed;
		top: 0;
		left: 0;
		flex-direction: column;
	}

	@keyframes spin {
		0% {
			rotate: 0deg;
		}
		100% {
			rotate: 360deg;
		}
	}

	#save-indicator img {
		width: 50px;
		height: 50px;
		animation-name: spin;
		animation-duration: 2s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

	#save-indicator p {
		color: var(--hexfriend-green);
		font-size: 20pt;
		margin: 0;
	}

	section#main-app {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
		background-color: var(--world-background);
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		padding: 0;
	}

	/* Tools */

	#tool-buttons {
		position: absolute;
		align-self: flex-end;
		margin-bottom: 1em;
	}

	/* SETTING BUTTONS */
	#setting-buttons {
		position: fixed;
		top: 0em;
		left: 0em;
		display: flex;
		padding: 0.5em;
		flex-direction: row;
		background-color: var(--world-background);
		border-bottom-right-radius: 0.5em;
		opacity: 0.5;
		gap: 0.25em;

		transition-duration: 0.2s;
	}

	#setting-buttons:hover {
		opacity: 1;
		transition-duration: 0.2s;
	}

	#setting-buttons button {
		width: 3em;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;

		background-color: transparent;

		padding: 0.25em;
	}

	#setting-buttons button:hover {
		background-color: var(--light-background);
	}

	#setting-buttons button img {
		width: 100%;
	}
</style>
