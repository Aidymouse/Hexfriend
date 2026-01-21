<script lang="ts">
  /* DOTO
		// CORE FUNCTIONS //
		- undo / redo
		- tooltips
		- keyboard shortcuts - make sure all are working
		- find more of a fix for why PIXI objects stick around when a new map is loaded - does this still happen ??
		- textured hex backgrounds
		- put all data into stores
		- update to latest version of tileset

		// POLISH / ROADMAP //
		// not ranked
		- floating loaders - better feedback
		- export at different sizes
		- make fonts load better
		- tests?? I dont think I'm a real enough dev
		- text sucks - increase internal resolution ?

		// BUGS //
		- symbol size is weird in preview when hex size is big
		- cant erase icon below text
		- releasing right or left mouse over a panel results in its action getting stuck on
			- add mouseup event to panels to fix
	*/

  // Components
  import CanvasHolder from './components/CanvasHolder.svelte'
  import IconGenerator from './components/IconGenerator.svelte'
  import IconsetCreator from './components/IconsetCreator.svelte'
  import SavedMaps from './components/SavedMaps.svelte'
  import Settings from './components/Settings.svelte'
  import ShortcutList from './components/ShortcutList.svelte'
  import TerrainGenerator from './components/TerrainGenerator.svelte'
  import TilesetCreator from './components/TilesetCreator.svelte'
  import ToolButtons from './components/ToolButtons.svelte'
  import TooltipsPane from './components/TooltipsPane.svelte'

  // Layers
  import CoordsLayer from './layers/CoordsLayer.svelte'
  import IconLayer from './layers/IconLayer.svelte'
  import LargeHexesLayer from './layers/LargeHexesLayer.svelte'
  import OverlayLayer from './layers/OverlayLayer.svelte'
  import PathLayer from './layers/PathLayer.svelte'
  import TerrainLayer from './layers/TerrainLayer.svelte'
  import TextLayer from './layers/TextLayer.svelte'
  import { db } from './lib/db'

  // Data
  import DEFAULTSAVEDATA from './lib/defaultSaveData'

  // Methods
  import { download } from './lib/download2'
  import { getKeyboardShortcut } from './lib/keyboardShortcuts'
  import { convertSaveDataToLatest } from './lib/saveDataConverter'

  // Lib
  import * as texture_loader from './lib/texture_loader'
  import { convert_tileset_to_latest } from './lib/tilesetConverter'
  import { handle_undo_action, handle_redo_action, pop_undo_action, push_undo_action } from './lib/undo_handler'

  // Panels
  import IconPanel from './panels/IconPanel.svelte'
  import OverlayPanel from './panels/OverlayPanel.svelte'
  import PathPanel from './panels/PathPanel.svelte'
  import TerrainPanel from './panels/TerrainPanel.svelte'
  import TextPanel from './panels/TextPanel.svelte'
  import EraserPanel from './panels/EraserPanel.svelte'

  import UndoRecord from './components/UndoRecord.svelte'

  // Stores
  import * as store_panning from './stores/panning'
  import { tfield } from './stores/tfield'
  import { store_inputs } from './stores/inputs'
  import { store_selected_tool } from './stores/tools'
  import { store_has_unsaved_changes } from './stores/flags'
  import {
    data_path,
    data_icon,
    data_overlay,
    data_coordinates,
    data_terrain,
    data_eraser,
    data_text,
  } from './stores/data'
  import { tl } from './stores/translation'

  // GLOBAL STYLES
  import './styles/inputs.css'
  import './styles/panels.css'
  import './styles/scrollbar.css'
  import './styles/variables.css'
  import './styles/shorthand.css'
  import './styles/details.css'

  // TYPES
  import type { eraser_data, terrain_data, text_data } from './types/data'
  import { LATEST_ICONSET_FORMAT_VERSION, type Iconset } from './types/icon'
  import type { pan_state } from './types/panning'
  import type { save_data } from './types/savedata'
  // Constants
  import { map_shape } from './types/settings'
  import type { terrain_field } from './types/terrain'
  import { LATEST_TILESET_FORMAT_VERSION, type Tileset } from './types/tilesets'
  // Enums
  import { tools } from './types/toolData'
  import * as PIXI from 'pixi.js'
  import { afterUpdate, onMount } from 'svelte'
  import { Map_Exports } from './types/export'
  import Scratchpad from './components/scratchpad/Scratchpad.svelte'
  import { convert_iconset_to_latest } from './lib/iconsetConverter'
  import { store_undo } from './stores/undo'

  /* STATE */

  let dataToLoad = {
    data: DEFAULTSAVEDATA,
    id: null,
  }

  let loadedSave: save_data = null
  let loadedId: number | null = null

  enum app_state {
    NORMAL = 'normal',
    TILESETCREATOR = 'tilesetCreator',
    ICONSETCREATOR = 'iconsetCreator',
    LOADINGMAP = 'loadingMap',
    DEV = 'dev',
  }

  let appState: app_state = app_state.TILESETCREATOR

  let showSettings = false
  let showHelp = false
  let showTerrainGenerator = false
  let show_icon_generator = false
  let showLoader: boolean = false
  let showKeyboardShortcuts: boolean = false
  let showControls: boolean = true

  let offsetContainer = new PIXI.Container()

  /* STUFF TO BIND TO */
  let comp_terrainLayer: TerrainLayer
  let comp_iconLayer: IconLayer
  let comp_pathLayer: PathLayer
  let comp_textLayer: TextLayer
  let comp_coordsLayer: CoordsLayer
  let comp_overlayLayer: OverlayLayer
  let comp_shortcutList: ShortcutList
  let comp_settings: Settings

  let comp_terrain_panel: TerrainPanel

  /* MASTER PIXI CONTAINERS */
  let cont_icon = new PIXI.Container()
  let cont_terrain = new PIXI.Container()
  let cont_all_paths = new PIXI.Container()
  let cont_all_text = new PIXI.Container()
  let cont_coordinates = new PIXI.Container()
  let cont_largehexes = new PIXI.Container()
  let cont_overlay = new PIXI.Container()

  /* APPLICATION */
  let app = new PIXI.Application({
    backgroundAlpha: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    resizeTo: window,
  })

  // Enable PixiJS dev tools in development
  if (process.env.NODE_ENV == 'development') {
    // @ts-ignore
    globalThis.__PIXI_APP__ = app
  }

  let showSavedMaps = false

  let saving = false
  let loadAndSaving = false

  let loadedTilesets: Tileset[]
  let loadedIconsets: Iconset[]

  let pan: pan_state
  store_panning.store.subscribe((newPan) => {
    pan = newPan
  })

  // This makes panning update smoothly
  $: {
    pan = pan
  }

  /* DATA */
  /* Data is bound to both layer and panel of a particluar tool. It contains all the shared state they need, and is bound to both */
  /* These should probably be stores huh */

  store_selected_tool.subscribe((n) => {
    $data_text.usingTextTool = n == tools.TEXT
  })

  let ignored_keys: string[] = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']

  //let L = new PIXI.Loader()

  // Never cleared, to stop duplicate textures being added
  // Theoretically a memory leak... but bounded by how many unique tiles can be loaded. Shouldn't be a problem?

  async function exportMap(exportType: Map_Exports) {
    showLoader = true

    switch (exportType) {
      case Map_Exports.PNG:
        download(
          await app.renderer.extract.base64(offsetContainer),
          `${loadedSave.title ? loadedSave.title : 'Untitled Hexfriend'}`,
          'image/png',
        )
        break

      case Map_Exports.SCALED_PNG:
        const scale_by = prompt($tl.settings.exports.scale_request_dialog)
        const scale = parseInt(scale_by) / 100

        const scaled_renderer = new PIXI.Renderer({
          resolution: scale,
          antialias: true,
        })
        download(
          await scaled_renderer.extract.base64(offsetContainer),
          `${loadedSave.title ? loadedSave.title : 'Untitled Hexfriend'}`,
          'image/png',
        )
        scaled_renderer.destroy()
        break

      case Map_Exports.JSON:
        download(
          JSON.stringify(loadedSave),
          `${loadedSave.title ? loadedSave.title : 'Untitled Hexfriend'}.hexfriend`,
          'application/json',
        )
        break
    }

    showLoader = false
  }

  function redrawEntireMap() {
    // Refreshes all hexes and coordinates
    comp_terrainLayer.renderAllHexes()
  }

  /* TOOL METHODS */
  /** TODO: refactor this into seperate tool store subscribes in respective layers */
  function changeTool(newTool: tools) {
    // A list of stuff that needs to happen every tool change
    data_path.update((n) => {
      n.contextPathId = null
      n.selectedPath = null

      return n
    })

    //$data_path.contextPathId = null;
    $data_text.contextStyleId = null

    //$data_path.selectedPath = null;

    store_selected_tool.update((n) => newTool)
  }

  /* ALL PURPOSE POINTER METHODS */
  function pointerdown(e: PointerEvent) {
    //console.log(`Down: ${e.button} :: ${e.buttons}`)

    store_panning.handlers.handle(e)
    $store_inputs.mouseDown[e.button] = true

    if ($store_inputs.mouseDown[2]) store_panning.handlers.startPan(e)

    if ($store_inputs.mouseDown[0]) {
      switch ($store_selected_tool) {
        case tools.TERRAIN:
          comp_terrainLayer.pointerdown()
          break

        case tools.ICON:
          comp_iconLayer.pointerdown()
          break

        case tools.PATH:
          comp_pathLayer.pointerdown()
          break

        case tools.TEXT:
          comp_textLayer.pointerdown()
          break

        case tools.ERASER:
          if ($data_eraser.eraseTerrain) {
            comp_terrainLayer.eraseAtMouse()
          }
          /* Icons are handled in the IconLayer */
          break
      }
    }
  }

  function pointerup(e: MouseEvent) {
    //console.log(`Up: ${e.button} :: ${e.buttons}`)

    $store_inputs.mouseDown[e.button] = false

    if (!$store_inputs.mouseDown[2]) store_panning.handlers.endPan()

    switch ($store_selected_tool) {
      case tools.TERRAIN:
        comp_terrainLayer.pointerup(e)
        break

      case tools.ICON:
        comp_iconLayer.pointerup()
        break

      case tools.TEXT:
        comp_textLayer.pointerup()
        break

      case tools.OVERLAY:
        comp_overlayLayer.pointerup()
        break
    }
  }

  function pointermove(e: PointerEvent) {
    store_panning.handlers.handle(e)

    switch ($store_selected_tool) {
      case tools.TERRAIN:
        if ($store_inputs.mouseDown[0]) comp_terrainLayer.pointerdown()
        break

      case tools.ICON:
        comp_iconLayer.pointermove()
        break

      case tools.TEXT:
        comp_textLayer.pointermove()
        break

      case tools.ERASER:
        if ($store_inputs.mouseDown[0]) {
          if ($data_eraser.eraseTerrain) comp_terrainLayer.eraseAtMouse()
        }
        /* Icons are handled differently in the icon handler */
        break

      case tools.OVERLAY:
        comp_overlayLayer.pointermove()
        break
    }
  }

  function pointerOffLayers(e: PointerEvent) {
    switch ($store_selected_tool) {
      case tools.ICON:
        comp_iconLayer.pointerout(e)
        break
    }
  }

  function before_unload(e: BeforeUnloadEvent) {
    if ($store_has_unsaved_changes) {
      e.preventDefault()
    }
  }

  /* KEYBOARD EVENTS */
  function handleShortcuts(e: KeyboardEvent) {
    // Generate key code
    let keycode = ''

    if (e.ctrlKey) keycode += 'control+'
    if (e.shiftKey) keycode += 'shift+'
    if (e.altKey) keycode += 'alt+'
    keycode += e.key.toLowerCase()

    if (e.key == 'Alt') keycode = 'alt'
    if (e.key == 'Shift') keycode = 'shift'
    if (e.key == 'Control') keycode = 'control'

    let shortcutData = getKeyboardShortcut(keycode, $store_selected_tool)
    if (!shortcutData) return
    //console.log(keycode);

    switch (shortcutData.tool) {
      case null:
        switch (shortcutData.function) {
          case 'save':
            save_map(loadedSave, loadedId)
            break

          case 'toggleViewMaps':
            showSavedMaps = !showSavedMaps
            break

          case 'toggleViewSettings':
            showSettings = !showSettings
            break

          case 'toggleShortcutList':
            showKeyboardShortcuts = !showKeyboardShortcuts
            break

          case 'toggleControls':
            showControls = !showControls
            break

          case 'backToMainView':
            showSavedMaps = false
            showSettings = false
            showKeyboardShortcuts = false
            $data_path.contextPathId = null
            $data_text.contextStyleId = null
            break

          case 'undo':
            let undo_action = pop_undo_action()
            if (undo_action !== null) {
              handle_undo_action(undo_action, { terrainLayer: comp_terrainLayer, settings: comp_settings })
            }
            break

          case 'redo':
            let redo_action = push_undo_action()
            if (redo_action !== null) {
              handle_redo_action(redo_action, { terrainLayer: comp_terrainLayer, settings: comp_settings })
            }
            break

          case 'changeTool_terrain':
            changeTool(tools.TERRAIN)
            break
          case 'changeTool_icon':
            changeTool(tools.ICON)
            break
          case 'changeTool_path':
            changeTool(tools.PATH)
            break
          case 'changeTool_text':
            changeTool(tools.TEXT)
            break
          case 'changeTool_eraser':
            changeTool(tools.ERASER)
            break
          case 'changeTool_overlay':
            if ($data_overlay.base64 != '') changeTool(tools.OVERLAY)
            break

          case 'toggle_overlay':
            if ($data_overlay.base64 != '') {
              $data_overlay.shown = !$data_overlay.shown
              $store_has_unsaved_changes = true
            }
            break
        }

        break

      case tools.TERRAIN:
        comp_terrainLayer.handleKeyboardShortcut(shortcutData)
        break

      case tools.ICON:
        comp_iconLayer.handleKeyboardShortcut(shortcutData)
        break

      case tools.PATH:
        comp_pathLayer.handleKeyboardShortcut(shortcutData)
        break

      case tools.TEXT:
        comp_textLayer.handleKeyboardShortcut(shortcutData)
        break
    }
  }

  function keyDown(e: KeyboardEvent) {
    if (ignored_keys.includes(e.key)) return
    if (appState != app_state.NORMAL) return

    // Prevent keyboard shortcuts
    if (e.target.type == 'number' || e.target.type == 'textarea' || e.target.type == 'text') {
      return
    }

    // Hardcoded alt code to stop alt tools getting stuck
    if (e.altKey && e.key == 'tab') {
    }

    if (comp_shortcutList && e.key != 'Escape' && !(e.key == 'k' && e.ctrlKey)) {
      e.preventDefault()
      comp_shortcutList.keydown(e)
      return
    }

    // Conditions under which we don't want to prevent default
    if ($data_text.editorRef) {
      if (e.ctrlKey) {
        e.preventDefault()
      }
    } else {
      e.preventDefault()
    }

    handleShortcuts(e)

    // Some more active keyboard listeners require these methods to be called
    switch ($store_selected_tool) {
      case tools.TERRAIN: {
        comp_terrainLayer.keydown(e)
        break
      }

      case tools.ICON: {
        comp_iconLayer.keydown(e)
        break
      }

      case tools.PATH: {
        comp_pathLayer.keydown(e)
        break
      }

      case tools.ERASER: {
        if (e.key == 'Shift') $data_eraser.eraseTerrain = false
        if (e.key == 'Control') $data_eraser.eraseIcons = false
        break
      }
    }
  }

  function keyUp(e: KeyboardEvent) {
    if (appState != app_state.NORMAL) return

    if (comp_shortcutList) {
      comp_shortcutList.keyup(e)
    }

    switch ($store_selected_tool) {
      case tools.TERRAIN: {
        comp_terrainLayer.keyup(e)
        break
      }

      case tools.ICON: {
        comp_iconLayer.keyup(e)
        break
      }

      case tools.PATH: {
        comp_pathLayer.keyup(e)
        break
      }

      case tools.ERASER: {
        if (e.key == 'Shift') $data_eraser.eraseTerrain = true
        if (e.key == 'Control') $data_eraser.eraseIcons = true
        break
      }
    }
  }

  function blur() {
    $data_terrain.usingEyedropper = false
    $data_icon.usingEyedropper = false
  }

  function redo() {}

  /* DATA LOAD */
  function createNewMap() {
    load_map(JSON.parse(JSON.stringify(DEFAULTSAVEDATA)), null)

    // setTimeout(() => {
    //   do_load(dataToLoad.data, dataToLoad.id)
    // }, 150)
  }

  // Null if map is new. Can be set to null to force save a new map
  async function save_map(data_to_save: save_data, save_id: number | null, preview_override: string | null = null) {
    // = asyncExtract(app, offsetContainer)
    if (data_to_save.title === '') {
      let t = prompt('Map Title:')
      if (t != null) {
        data_to_save.title = t
      } else {
        saving = false
        return
      }
    }
    saving = true

    let p = await asyncExtract(app, offsetContainer)

    return saveToDexie(data_to_save, save_id, preview_override ?? p)
  }

  async function asyncExtract(app, container): Promise<string> {
    await null // Why did I do this
    return new Promise((r) => r(app.renderer.extract.base64(container)))
  }

  /** Saves the map to dexie + updates the currently loaded ID */
  async function saveToDexie(data: save_data, id: number | null, preview_base64: string): Promise<number> {
    let c = JSON.stringify(data)

    let curSave = undefined
    if (id) {
      curSave = await db.mapSaves.get(id)
    }

    if (id !== null && curSave !== undefined) {
      db.mapSaves.update(id, {
        mapTitle: data.title,
        previewBase64: preview_base64,
        saveVersion: data.saveVersion,
      })

      db.mapStrings.update(id, {
        mapString: c,
      })

      console.log(`Updated saved map with id ${id}`)
    } else {
      const id = await db.mapSaves.add({
        mapTitle: data.title,
        previewBase64: preview_base64,
        saveVersion: data.saveVersion,
      })

      await db.mapStrings.add({
        mapString: c,
      })

      console.log(`Added map with id ${id}`)
      loadedId = Number(id)
    }

    $store_has_unsaved_changes = false

    saving = false

    // Update saving text
    document.getElementById('saving-text').style.display = 'block'
    document.getElementById('saving-text').style.opacity = '1'
    document.getElementById('saving-text').style.marginBottom = '0em'

    setTimeout(() => {
      document.getElementById('saving-text').style.marginBottom = '-1em'
      document.getElementById('saving-text').style.opacity = '0'
    }, 1000)

    return loadedId
  }

  async function do_load(data: save_data, id: number | null) {
    console.log('Initiate load', id)
    loadedTilesets = data.tilesets
    loadedIconsets = data.iconsets

    // Load Textures
    for (const tileset of loadedTilesets) {
      if (!tileset.format_version || tileset.format_version < LATEST_TILESET_FORMAT_VERSION) {
        let updated_tileset = await convert_tileset_to_latest(tileset)

        loadedTilesets = loadedTilesets.filter((ts) => ts.id != tileset.id)
        loadedTilesets.push(updated_tileset)

        console.log(`Loading textures for ${tileset.name}`)
        await texture_loader.load_tileset_textures(updated_tileset)
      } else {
        console.log(`Loading textures for ${tileset.name}`)
        await texture_loader.load_tileset_textures(tileset)
      }
    }

    // Load Icons
    for (const iconset of loadedIconsets) {
      if (!iconset.format_version || iconset.format_version < LATEST_ICONSET_FORMAT_VERSION) {
        const updated_iconset = await convert_iconset_to_latest(iconset)
        loadedIconsets = loadedIconsets.filter((is) => is.id != iconset.id)
        loadedIconsets.push(updated_iconset)
        console.log(`Loading icon textures for ${iconset.name}`)
        await texture_loader.load_iconset_textures(updated_iconset)
      } else {
        console.log(`Loading icon textures for ${iconset.name}`)
        await texture_loader.load_iconset_textures(iconset)
      }
    }

    $tfield = data.TerrainField

    $data_coordinates = data.coords

    $data_overlay = data.overlay
    if ($store_selected_tool == tools.OVERLAY && $data_overlay.base64 == '') $store_selected_tool = tools.TERRAIN

    loadedSave = data
    loadedId = id

    console.log('Loaded Sets', loadedTilesets)
    let firstTile = loadedTilesets[0].tiles[0]
    $data_terrain.tile = {
      ...firstTile,
      symbol: firstTile.symbol ? { ...firstTile.symbol } : null,
    }

    $data_icon.icon = { ...loadedIconsets[0].icons[0] }

    // Center the map
    let tf = loadedSave.TerrainField

    //pan.zoomScale = 1

    store_panning.store.update((pan) => {
      if (tf.mapShape == map_shape.SQUARE) {
        if (tf.orientation == 'flatTop') {
          let mapWidth = tf.columns * tf.hexWidth * 0.75 + tf.hexWidth * 0.25
          let mapHeight = (tf.rows - 1) * tf.hexHeight - tf.hexHeight * 0.5

          pan.offsetX = window.innerWidth / 2 - (mapWidth / 2) * pan.zoomScale
          pan.offsetY = window.innerHeight / 2 - (mapHeight / 2) * pan.zoomScale
        } else {
          let mapHeight = tf.rows * tf.hexHeight * 0.75 + tf.hexHeight * 0.25
          let mapWidth = (tf.columns - 1) * tf.hexWidth - tf.hexWidth * 0.5

          pan.offsetX = window.innerWidth / 2 - (mapWidth / 2) * pan.zoomScale
          pan.offsetY = window.innerHeight / 2 - (mapHeight / 2) * pan.zoomScale
        }
      } else {
        pan.offsetX = window.innerWidth / 2
        pan.offsetY = window.innerHeight / 2
      }
      return pan
    })

    appState = app_state.NORMAL

    // Final Layer Setup
    //comp_iconLayer.saveOldHexMeasurements(tfield.hexWidth, tfield.hexHeight, tfield.grid.gap);

    //comp_coordsLayer.cullUnusedCoordinates();
    //comp_coordsLayer.updateAllCoordPositions();
    //comp_coordsLayer.populateBlankHexes();

    //comp_terrainLayer.clearTerrainSprites();
    //comp_terrainLayer.renderAllHexes();

    // Jolt all the layers that respond to the data into place. Without this the text, icons and paths kinda get stuck. It's odd. Warrants further investigation.
    loadedSave = loadedSave

    console.log('Loaded, ready')
  }

  function load_map(data: save_data, id: number | null) {
    // Clean up
    if (id) {
      console.log(`Loading ${id}`)
    } else if (data.title) {
      console.log(`Loading ${data.title}`)
    } else {
      console.log('Loading default save data')
    }

    // Deal with outdated save data
    data = convertSaveDataToLatest(data)

    dataToLoad = { data: data, id: id }
    appState = app_state.LOADINGMAP

    //loadSave(data, id);
    //await loadSave(data, id)

    $data_path.selectedPath = null
    $data_text.selectedText = null

    // await tick() // The terrain field needs time to hook onto
    //comp_terrainLayer.renderAllHexes()

    appState = app_state.LOADINGMAP

    // I get suspicious when it loads too fast
    setTimeout(() => {
      do_load(data, id)
    }, 150)
  }

  //$: appState, andSave()

  // function loadAndSave(data: save_data, id: number | null) {
  //   do_load(data, id)
  //   loadAndSaving = true
  //   // also triggers andSave()
  // }
  //
  // function andSave() {
  //   // when app_state becomes NORMAL again, then trigger save
  //   if (loadAndSaving) {
  //     if (appState == app_state.NORMAL) {
  //       saveInit()
  //       loadAndSaving = false
  //     }
  //   }
  // }

  /* Order matters */
  /* TODO: Put this somewhere better, add other layers */

  offsetContainer.addChild(cont_terrain)
  offsetContainer.addChild(cont_all_paths)
  offsetContainer.addChild(cont_icon)
  offsetContainer.addChild(cont_coordinates)
  offsetContainer.addChild(cont_largehexes)
  offsetContainer.addChild(cont_all_text)
  offsetContainer.addChild(cont_overlay)

  app.stage.addChild(offsetContainer)

  afterUpdate(() => {
    // Update offset container X, Y, scale

    offsetContainer.x = pan.offsetX
    offsetContainer.y = pan.offsetY
    offsetContainer.scale.x = pan.zoomScale
    offsetContainer.scale.y = pan.zoomScale
  })

  onMount(() => {
    console.log('App Mounted')
    createNewMap()
    //load_map(dataToLoad.data, dataToLoad.id)
  })
</script>

<svelte:window on:keydown={keyDown} on:keyup|preventDefault={keyUp} on:blur={blur} on:beforeunload={before_unload} />

{#if appState == app_state.NORMAL}
  <main id="content-arranger">
    {#if saving}
      <div id="save-indicator">
        <img src="../assets/img/site/hexfriend.png" alt={'Saving...'} />
        <p>{$tl.save_indicator}</p>
      </div>
    {/if}

    <section
      id="main-app"
      on:contextmenu|preventDefault={(e) => {}}
      on:wheel={(e) => {
        store_panning.handlers.zoom(e)
      }}
      on:mousedown={(e) => {
        pointerdown(e)
      }}
      on:mousemove={(e) => {
        pointermove(e)
      }}
      on:mouseup={(e) => {
        pointerup(e)
      }}
      on:mouseout={(e) => {
        pointerOffLayers(e)
      }}
      on:blur={() => {
        console.log('Sheeit')
      }}
      on:keydown={keyDown}
      on:keyup={keyUp}
    >
      <CanvasHolder {app} />

      <TerrainLayer bind:cont_terrain bind:this={comp_terrainLayer} {changeTool} {comp_coordsLayer} />
      <PathLayer bind:this={comp_pathLayer} bind:cont_all_paths bind:paths={loadedSave.paths} />
      <IconLayer bind:this={comp_iconLayer} bind:icons={loadedSave.icons} bind:cont_icon />
      <CoordsLayer bind:cont_coordinates bind:this={comp_coordsLayer} />
      <LargeHexesLayer bind:cont_largehexes />
      <TextLayer bind:cont_all_text bind:this={comp_textLayer} bind:texts={loadedSave.texts} />
      <OverlayLayer bind:this={comp_overlayLayer} bind:cont_overlay {app} />
    </section>

    <!-- Panels -->
    <section id="panel-quadrant">
      {#if showTerrainGenerator}
	<TerrainGenerator {loadedTilesets} {comp_terrainLayer} bind:showTerrainGenerator />
      {:else if show_icon_generator}
	<IconGenerator {loadedIconsets} {comp_iconLayer} bind:show_icon_generator />
      {:else if $store_selected_tool == tools.TERRAIN}
	<TerrainPanel bind:this={comp_terrain_panel} {loadedTilesets} {app} />
      {:else if $store_selected_tool == tools.ICON}
	<IconPanel {app} {loadedIconsets} />
      {:else if $store_selected_tool == tools.PATH}
	<PathPanel {comp_pathLayer} bind:loaded_path_styles={loadedSave.path_styles} />
      {:else if $store_selected_tool == tools.TEXT}
	<TextPanel {comp_textLayer} bind:loaded_text_styles={loadedSave.text_styles} />
      {:else if $store_selected_tool == tools.ERASER}
	<EraserPanel bind:loaded_save={loadedSave} />
      {:else if $store_selected_tool == tools.OVERLAY}
	<OverlayPanel />
      {/if}

      <UndoRecord />
    </section>

    <div id="tool-buttons" on:mouseup={pointerup}>
      <ToolButtons {changeTool} />
    </div>

    <div id="top-left-floater">
      <div id="setting-buttons" on:mouseup={pointerup}>
        <button
          on:click={() => {
            showSettings = true
          }}
          title={'Map Settings'}
        >
          <img src="assets/img/tools/settings.png" alt="Map Settings" />
        </button>
        <button
          on:click={() => {
            var theme = document.documentElement.getAttribute('data-theme')
            theme = theme === 'dark' ? 'light' : 'dark'
            document.documentElement.setAttribute('data-theme', theme)
            document.querySelector('meta[name="color-scheme"]').setAttribute('content', theme)
          }}
          title={'Toggle theme'}
        >
          <img src="assets/img/tools/moon-sun.svg" alt="Theme" />
        </button>
        <button
          on:click={() => {
            showSavedMaps = true
          }}
          title={'Maps'}
        >
          <img src="assets/img/tools/maps.png" alt="Maps" />
        </button>
        <button on:click={() => save_map(loadedSave, loadedId)} title={'Save'}>
          <img src="assets/img/tools/save.png" alt="Save" />
        </button>
      </div>
      <div style="height: 100%; display: flex; align-items: center;">
        <p id="saving-text">
          {$tl.general.saved}
        </p>
      </div>
    </div>

    <div id="help-buttons" on:mouseup={pointerup} class:show={showHelp}>
      <button
        on:click={() => {
          showHelp = !showHelp
        }}
        title={'Overlay Help'}
      >
        <img src={`assets/img/ui/help/question_mark.png`} alt="Help" />
      </button>
    </div>

    {#if showKeyboardShortcuts}
      <ShortcutList bind:this={comp_shortcutList} on:mouseup={pointerup} />
    {/if}

    <SavedMaps bind:showSavedMaps {createNewMap} load={load_map} {save_map} on:mouseup={pointerup} />

    <Settings
      {loadedSave}
      bind:this={comp_settings}
      bind:showSettings
      bind:appState
      bind:showTerrainGenerator
      bind:show_icon_generator
      bind:loadedTilesets
      bind:loadedIconsets
      {comp_terrainLayer}
      {comp_coordsLayer}
      {comp_iconLayer}
      {comp_pathLayer}
      {comp_textLayer}
      {comp_terrain_panel}
      renderAllHexes={() => {
        comp_terrainLayer.renderAllHexes()
      }}
      renderGrid={() => {
        comp_terrainLayer.renderGrid()
      }}
      redrawEntireMap={() => {
        redrawEntireMap()
      }}
      {exportMap}
      load={load_map}
      on:mouseup={pointerup}
    />

    {#if showControls}
      <TooltipsPane />
    {/if}

    {#if showHelp}
      <div id="help-overlay">
        <img id="welcome" src={`assets/img/ui/help/${$tl.language}/welcome.png`} alt="Welcome To Hexfriend" />
        <img id="map" src={`assets/img/ui/help/${$tl.language}/map.png`} alt="This Is The Map" />
        <img
          id="settings-saving"
          src={`assets/img/ui/help/${$tl.language}/settings_saving.png`}
          alt="Settings & Saving"
        />
        <img id="tools" src={`assets/img/ui/help/${$tl.language}/tools.png`} alt="Choose Your Tool" />
        <img id="configure" src={`assets/img/ui/help/${$tl.language}/configure.png`} alt="Configure The Tools" />
        <img id="shortcuts" src={`assets/img/ui/help/${$tl.language}/shortcuts.png`} alt="Check Out The Shortcuts" />
      </div>
    {/if}
  </main>
{:else if appState == app_state.TILESETCREATOR}
  <TilesetCreator bind:appState />
{:else if appState == app_state.ICONSETCREATOR}
  <IconsetCreator bind:appState />
{:else if appState == app_state.LOADINGMAP}
  <div id="loading-screen">
    <img src="../assets/img/site/hexfriend.png" alt={'Loading'} />
  </div>
{:else if appState == app_state.DEV}
  <Scratchpad />
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

  #top-left-floater {
    position: fixed;
    top: 0em;
    left: 0em;
    display: flex;
    flex-direction: row;
    gap: 0.5em;
    height: 56px;
  }

  #saving-text {
    background-color: var(--world-background);
    margin: 0;
    margin-bottom: -1em;
    opacity: 0;
    transition-duration: 0.2s;
    padding: 0.5em;
    border-radius: var(--small-radius);
  }

  #setting-buttons {
    display: flex;
    padding: 0.5em;
    flex-direction: row;
    background-color: var(--world-background);
    border-bottom-right-radius: 0.5em;
    opacity: 0.5;
    gap: 0.25em;
    height: 40px;

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

  /* HELP BUTTON */
  #help-buttons {
    position: fixed;
    left: 0;
    bottom: 0;
    background-color: var(--world-background);

    display: flex;
    padding: 0.5em;
    border-top-right-radius: 0.5em;

    opacity: 0.5;
    transition: all 0.2s ease-in-out;

    animation: pulse 3s ease-in-out;
  }

  #help-buttons.show {
    /* keeps it toggle-able and on top even when the help overlay is overlaid */
    z-index: 1;
    opacity: 1;
    background-color: var(--hexfriend-green);
  }

  @keyframes pulse {
    25%,
    75% {
      opacity: 0.85;
      background-color: var(--hexfriend-green);
      padding: 1em;
    }

    50% {
      opacity: 0.5;
      background-color: var(--world-background);
    }
  }

  @keyframes grow {
    25%,
    75% {
      width: 3em;
      height: 3em;
    }
  }

  #help-buttons button {
    width: 3em;
    height: 3em;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;

    background-color: transparent;
    padding: 0.25em;

    animation: grow 3s ease-in-out;
  }

  #help-buttons button img {
    width: 80%;
  }

  #help-buttons:hover {
    opacity: 1;
  }

  #help-buttons button:hover {
    background-color: var(--light-background);
  }

  #help-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    background-color: color-mix(in srgb, var(--world-background), transparent 50%);
  }

  #help-overlay img {
    position: absolute;
    text-align: center;
  }

  #help-overlay #welcome {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  #help-overlay #map {
    top: 30%;
    left: 10%;
  }

  #help-overlay #tools {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  #help-overlay #configure {
    top: 0;
    right: 8%;
  }

  #help-overlay #shortcuts {
    bottom: 0;
    right: 0;
  }
</style>
