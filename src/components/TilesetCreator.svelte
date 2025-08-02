<script lang="ts">
  import { LATEST_TILESET_FORMAT_VERSION, type Tile, type Tileset } from '../types/tilesets'
  import { DEFAULT_BLANK_HEX_COLOR } from '../types/defaults'
  import { get_icon_scale_for_hex } from '../helpers/imageSizing'
  import { generate_icon_preview, type PreviewHexInfo } from '../helpers/iconFns'

  let preview_hex_info: PreviewHexInfo = {
    hexWidth: 50 * 6,
    hexHeight: 43.3 * 6,
    orientation: HexOrientation.FLATTOP,
    color: new PIXI.Color(DEFAULT_BLANK_HEX_COLOR).toHex(),
  }

  import { HexOrientation } from '../types/terrain'

  import ColorInputPixi from './ColorInputPixi.svelte'
  import CanvasHolder from './CanvasHolder.svelte'

  import { getHexPathRadius } from '../helpers/hexHelpers'

  import { tl } from '../stores/translation'

  import { download } from '../lib/download2'
  import * as PIXI from 'pixi.js'
  import { afterUpdate, tick } from 'svelte'
  import { update_tileset_format } from '../lib/tileset_updater'
  import { ScaleMode } from '../helpers/imageSizing'

  import { convert_tileset_to_latest } from '../lib/tilesetConverter'
  let app = new PIXI.Application({
    height: 300,
    width: 300,
    backgroundAlpha: 0,
  })

  export let appState

  let texture_register = {} // texture_id: texture

  let workingTileset: Tileset = {
    name: 'New Tileset',
    id: 'new-tileset',
    author: '',
    version: 1,
    tiles: [],
    format_version: LATEST_TILESET_FORMAT_VERSION,
    supported_orientations: 'both',
    collapsed: false,
  }

  let grph_hex = new PIXI.Graphics()
  let spr_hex_symbol = new PIXI.Sprite()
  spr_hex_symbol.anchor.set(0.5);
  
  app.stage.addChild(grph_hex, spr_hex_symbol)

  let selectedTile: Tile | null = null

  /** Keep local color copies so you can edit the text boxes */
  let local_tile_color: string = new PIXI.Color(DEFAULT_BLANK_HEX_COLOR).toHex();
  $: {
    if (selectedTile) {
      try {
	let c = new PIXI.Color(local_tile_color).toNumber();
	selectedTile.bgColor = c;
      } catch {}
    }
  }

  let local_symbol_color: string = "#ffffff";
  $: {
    if (selectedTile?.symbol) {
      try {
	let c = new PIXI.Color(local_symbol_color).toNumber();
	selectedTile.symbol.color = c;
      } catch {}
    }
  }

  let previewSprite = new PIXI.Sprite()
  previewSprite.anchor.set(0.5);
  let previewGraphics = new PIXI.Graphics()
  let previewContainer = new PIXI.Container()
  previewContainer.addChild(previewGraphics, previewSprite)

  function findID(baseId: string): string {
    baseId = IDify(baseId)

    let counter = 0
    let proposedId = `${baseId}${counter === 0 ? '' : counter}`

    while (workingTileset.tiles.find((tile: Tile) => tile.id === proposedId)) {
      counter++
      proposedId = `${baseId}${counter === 0 ? '' : counter}`
    }

    return proposedId
  }

  async function newTile() {
    let newTile: Tile = selectedTile ? structuredClone(selectedTile) : {
      tileset_id: '', // Will be filled in on export
      display: 'New Hex',
      id: findID('New Hex'),
      symbol: null,
      bgColor: DEFAULT_BLANK_HEX_COLOR,
      preview_flatTop: '',
      preview_pointyTop: '',
    }

    newTile.id = findID(newTile.id)

    newTile.preview_flatTop = await generate_tile_preview(newTile)

    workingTileset.tiles = [...workingTileset.tiles, newTile]

    selectedTile = workingTileset.tiles[workingTileset.tiles.length - 1]
  }

  function duplicateTile(tile: Tile) {
    let newTile = structuredClone(tile)

    newTile.display = 'Copy of ' + tile.display
    newTile.id = findID(newTile.display)

    workingTileset.tiles = [...workingTileset.tiles, newTile]
    selectedTile = workingTileset.tiles[workingTileset.tiles.length - 1]
  }

  function removeTile(tile: Tile) {
    workingTileset.tiles = workingTileset.tiles.filter((t: Tile) => t.id != tile.id)
  }

  async function generate_tile_preview(tile: Tile) {
    previewGraphics.clear()
    previewGraphics.beginFill(tile.bgColor)
    previewGraphics.drawPolygon(getHexPathRadius(preview_hex_info.hexWidth/2, preview_hex_info.orientation, 0, 0))
    previewGraphics.endFill()

    previewSprite.texture = null
    if (tile.symbol) {
      previewSprite.texture = await PIXI.Assets.load(tile.symbol.base64)

      const symbol_scale = get_icon_scale_for_hex(tile.symbol, preview_hex_info)

      const mtrx = new PIXI.Matrix().rotate(PIXI.DEG_TO_RAD * tile.symbol.rotation).scale(symbol_scale.x, symbol_scale.y)
      previewSprite.transform.setFromMatrix(mtrx);

      previewSprite.tint = tile.symbol.color
    }

    return await app.renderer.extract.base64(previewContainer)
  }

  $: {
    if (selectedTile) {
      generate_tile_preview(selectedTile).then(p => {
	if (preview_hex_info.orientation === HexOrientation.FLATTOP) {
	  selectedTile.preview_flatTop = p;
	} else {
	  selectedTile.preview_pointyTop = p;
	}
      })
    }
  }

  function IDify(name: string): string {
    return name.toLowerCase().replaceAll(' ', '-')
  }

  let symbolFiles: FileList

  async function updateSymbolFile() {
    let r = new FileReader()
    r.readAsDataURL(symbolFiles[0])
    r.onload = async (eb) => {
      let new_texture = await PIXI.Assets.load(r.result as string)

      selectedTile.symbol = {
        color: selectedTile.symbol ? selectedTile.symbol.color : 0xffffff,
	id: "",
        texWidth: new_texture.width,
        texHeight: new_texture.height,
        base64: r.result as string,
        rotation: 0,
        preview: '',
	display: 'tilesymbol',
	texId: '', // Will be set equal to tiles id
	scaleMode: ScaleMode.RELATIVE,
        pHex: 80,
      }
    }
  }

  function exportTileset() {
    let export_tileset: Tileset = workingTileset as Tileset

    // Transformations into real tile and tileset data structures
    export_tileset.id = IDify(workingTileset.name)

    // Reset IDs, which will be found immediately after
    export_tileset.tiles.forEach((t) => {
      t.id = ''
    })

    export_tileset.tiles.forEach((tile) => {
      tile.id = findID(tile.display)
      tile.tileset_id = export_tileset.id
    })

    console.log(export_tileset)
    download(JSON.stringify(export_tileset), `${export_tileset.id}.hfts`, 'application/json')
  }

  let importFiles: FileList

  async function importTileset() {
    let importFile = importFiles[0]

    if (!importFile) return

    let r = new FileReader()
    r.readAsText(importFile)
    r.onload = async (eb) => {
      /* Read the file */
      let setToImport = JSON.parse(eb.target.result as string)

      setToImport = convert_tileset_to_latest(setToImport)

      //console.log(setToImport)

      /* Load textures */

      workingTileset = { ...setToImport }
      update_tileset_format(workingTileset as Tileset)
      selectedTile = null

      await tick()
      //workingTileset.tiles = workingTileset.tiles;
    }
  }

  // Dragging Code
  // Has a problem where the tile is deselected after dropping. What???
  let phantomTileButtonId

  function dragButton(e: DragEvent, tile: Tile) {
    //console.log(icon);

    phantomTileButtonId = tile.id

    e.dataTransfer.setData('text/json', JSON.stringify(tile))
  }

  function dropButton(e: DragEvent) {
  	phantomTileButtonId = null
  }

  function draggedOverButton(e: DragEvent, tile: Tile) {
    if (tile.id == phantomTileButtonId) return

    let draggedOverIndex = workingTileset.tiles.indexOf(tile)
    workingTileset.tiles = workingTileset.tiles.filter((i) => i.id != phantomTileButtonId)

    // If phantom is on the left, switch them. Otherwise, proceed as normal
    if (draggedOverIndex != 0 && workingTileset.tiles[draggedOverIndex - 1].id == phantomTileButtonId) {
      workingTileset.tiles.splice(draggedOverIndex + 1, 0, JSON.parse(e.dataTransfer.getData('text/json')))
    } else {
      workingTileset.tiles.splice(draggedOverIndex, 0, JSON.parse(e.dataTransfer.getData('text/json')))
    }

    workingTileset = workingTileset
  }

  const update_symbol_scalemode = (new_mode: string) => {
    delete selectedTile.symbol.pHex
    delete selectedTile.symbol.pWidth
    delete selectedTile.symbol.pHeight

    if (new_mode === ScaleMode.RELATIVE) {
      selectedTile.symbol.scaleMode = new_mode;
      selectedTile.symbol.pHex = 80;
    } else {
      selectedTile.symbol.scaleMode = new_mode as ScaleMode;
      selectedTile.symbol.pWidth = 100;
      selectedTile.symbol.pHeight = 100;
    }
  }

  afterUpdate(async () => {
    if (selectedTile) {
      let new_preview = await generate_tile_preview(selectedTile)

      selectedTile[`preview_${preview_hex_info.orientation}`] = new_preview

      grph_hex.clear()
      grph_hex.beginFill(selectedTile.bgColor)
      grph_hex.drawPolygon(getHexPathRadius(150, preview_hex_info.orientation, 150, 150))
      grph_hex.endFill()

      let spr_symbol = spr_hex_symbol
      spr_symbol.visible = false

      if (selectedTile.symbol) {
        spr_symbol.visible = true
        let symbol_texture = await PIXI.Assets.load(selectedTile.symbol.base64)

        spr_symbol.texture = symbol_texture
	const symbol_scale = get_icon_scale_for_hex(selectedTile.symbol, preview_hex_info);
	const mtrx = new PIXI.Matrix().rotate(PIXI.DEG_TO_RAD * selectedTile.symbol.rotation).scale(symbol_scale.x, symbol_scale.y)
	spr_symbol.transform.setFromMatrix(mtrx);
        spr_symbol.x = 150
        spr_symbol.y = 150
        spr_symbol.tint = selectedTile.symbol.color
      }
    }
  })
</script>

<main>
  <nav>
    <div id="set-controls">
      <div id="tileset-attr-grid">
        <button
          on:click={() => {
            appState = 'normal'
          }}
          style="grid-column: 1/3;"
        >
          {$tl.builders.tileset_builder.exit}
        </button>

        <label for="setName">{$tl.builders.tileset_builder.name}</label>
        <input id="setName" type="text" bind:value={workingTileset.name} placeholder="Tileset Name" />

        <label for="setAuthor">{$tl.builders.author}</label>
        <input id="setAuthor" type="text" bind:value={workingTileset.author} placeholder="You!" />

        <label for="tileset-supports">{$tl.builders.supported_orientations}</label>
	<select id="tileset-supports" bind:value={workingTileset.supported_orientations}>
	  <option value={HexOrientation.FLATTOP}>{$tl.builders.supported_orientations_options[HexOrientation.FLATTOP]}</option>
	  <option value={HexOrientation.POINTYTOP}>{$tl.builders.supported_orientations_options[HexOrientation.POINTYTOP]}</option>
	  <option value={'both'}>{$tl.builders.supported_orientations_options['both']}</option>
	</select>

        <label for="setVersion">{$tl.builders.version}</label>
        <input id="setVersion" type="number" bind:value={workingTileset.version} />

        <button on:click={() => importTileset()} class="file-input-button">
          {$tl.builders.tileset_builder.import_tileset}
          <input
            type="file"
            bind:files={importFiles}
            accept={'.hfts'}
            on:change={(e) => {
              importTileset()
              e.currentTarget.value = ''
            }}
          />
        </button>

        <button on:click={() => exportTileset()}>{$tl.builders.tileset_builder.export_tileset}</button>
      </div>
    </div>

    <div
      id="tile-buttons"
      on:dragover={(e) => {
        e.preventDefault()
      }}
      on:dragenter={(e) => {
        e.preventDefault()
      }}
      on:drop={dropButton}
    >
      {#each workingTileset.tiles as tile (tile.id)}
        <button
          class="tile-button"
          class:selected={selectedTile == tile}
          style={tile.id == phantomTileButtonId ? 'opacity: 0' : ''}
          on:click={() => { 
	    selectedTile = tile
	    local_tile_color = new PIXI.Color(tile.bgColor).toHex()
	    if (tile.symbol) local_symbol_color = new PIXI.Color(tile.symbol.color).toHex()
	  }}
          draggable={true}
          on:dragstart={(e) => {
            dragButton(e, tile)
          }}
          on:dragenter={(e) => {
            draggedOverButton(e, tile)
          }}
          title={tile.display}
        >
          <img src={tile[`preview_${preview_hex_info.orientation}`]} alt="{tile.display}" />
        </button>
      {/each}

      <button
        class="tile-button"
        on:click={() => {
          newTile()
        }}>+</button
      >
    </div>
  </nav>

  {#if selectedTile}
    <section id="tile-preview">
      <div id="pixi-container" style="height: 300px; width: 300px;">
        <CanvasHolder {app} />
      </div>

      <input
        type="text"
        bind:value={selectedTile.display}
        on:change={() => {
          workingTileset.tiles = workingTileset.tiles
        }}
      />

      <div id="tile-preview-controls">
        <button
          class="outline-button"
          on:click={() => {
            preview_hex_info.orientation = preview_hex_info.orientation == HexOrientation.FLATTOP ? HexOrientation.POINTYTOP : HexOrientation.FLATTOP
            generate_tile_preview(selectedTile)
          }}
          title={$tl.builders.change_orientation}
        >
          <img src="/assets/img/tools/changeOrientation.png" alt="Change Orientation" />
        </button>
        <button
          class="outline-button"
          on:click={() => {
            duplicateTile(selectedTile)
          }}
          title={$tl.builders.duplicate}
        >
          <img src="/assets/img/tools/duplicate.png" alt="Hex Duplicate" />
        </button>
        <button
          class="outline-button"
          on:click={() => {
            removeTile(selectedTile)
            selectedTile = null
          }}
          title={$tl.builders.tileset_builder.delete}
        >
          <img src="/assets/img/tools/trash.png" alt="Trash" />
        </button>
      </div>
    </section>


    <aside id="tile-style">

	  <!-- Background Color -->
	  <div class="color" style="margin-bottom: 0.5em">
	    <ColorInputPixi bind:value={selectedTile.bgColor} on:input={(e) => {local_tile_color = e.detail.string}} w={'50'} h={'50'} />

	    <div>
	      <label for="bg-input">Background</label>
	      <input style="border-radius: var(--small-radius)" type="string" class="color-string" bind:value={local_tile_color} />
	    </div>
	  </div>

	  <!-- Upload Symbol Button -->
	  <button class="file-input-button outline-button" style="margin-bottom: 0.25em">
	    {selectedTile.symbol ? $tl.builders.tileset_builder.replace_symbol : $tl.builders.tileset_builder.upload_symbol}
	    <input
	      type="file"
	      accept="image/*"
	      bind:files={symbolFiles}
	      on:change={(e) => {
		updateSymbolFile()
		e.currentTarget.value = '' /*Hacky, but necessary*/
	      }}
	    />
	  </button>

	  <!-- Remove Symbol Button -->
	  {#if selectedTile.symbol}
	    <button class="outline-button">
	      Remove Symbol
	    </button>
	  {/if}

	  <!-- Symbol Input Controls -->
	  {#if selectedTile.symbol}
	      <!-- Symbol Color -->
	      <div class="color" style="margin-top: 10px">
		<ColorInputPixi bind:value={selectedTile.symbol.color} on:input={(e) => local_symbol_color = e.detail.string} w={'50'} h={'50'} />

		<div>
		  <label for="symbol-color">{$tl.builders.tileset_builder.symbol}</label>
		  <input id="symbol-color" bind:value={local_symbol_color} /> 
		</div>
	      </div>


	      <!-- Symbol Rotation -->
	      <div class="builder-control-row">
		<label for="tile-scale-relative">{$tl.builders.rotation}</label>
		<input id="tile-scale-relative" type="number" bind:value={selectedTile.symbol.rotation} />
		deg
	      </div>
	      <div class="builder-control-row" style="margin-bottom: 0.5em;">
		<button style="height: 2em;" class="img-button" on:click={() => selectedTile.symbol.rotation = (360 + selectedTile.symbol.rotation - 60)%360}>
		  <img src={`/assets/img/ui/rotate60_left_${preview_hex_info.orientation}.png`} alt={$tl.icon_panel.rotate60_left}>
		</button>
		<input type="range" min="0" max="359" bind:value={selectedTile.symbol.rotation} />
		<button style="height: 2em;" class="img-button" on:click={() => selectedTile.symbol.rotation = (selectedTile.symbol.rotation+60)%360}>
		  <img src={`/assets/img/ui/rotate60_right_${preview_hex_info.orientation}.png`} alt={$tl.icon_panel.rotate60_right}>
		</button>
	      </div>

	      <!-- Symbol Scale -->
	      <div class="builder-control-row">
		<label for="tile-scalemode">{$tl.builders.tileset_builder.scale}</label>
		<select id="tile-scalemode" value={selectedTile.symbol.scaleMode} on:input={(e) => update_symbol_scalemode(e.currentTarget.value)}>
		  <option value={ScaleMode.RELATIVE}>{$tl.icons.scale_mode_options[ScaleMode.RELATIVE]}</option>
		  <option value={ScaleMode.BYDIMENSION}>{$tl.icons.scale_mode_options[ScaleMode.BYDIMENSION]}</option>
		</select>
	      </div>
	    {#if selectedTile.symbol.scaleMode === ScaleMode.RELATIVE}

	      <div class="builder-control-row">
		<label for="tile-scale-relative">{$tl.icons.scale_relative}</label>
		<input id="tile-scale-relative" type="number" bind:value={selectedTile.symbol.pHex} />
		%
	      </div>
	      <div class="builder-control-row">
		<input type="range" min="5" max="100" bind:value={selectedTile.symbol.pHex} />
	      </div>
	    {:else if selectedTile.symbol.scaleMode === ScaleMode.BYDIMENSION}
	      <div class="builder-control-row">
		<label for="tile-scale-relative">{$tl.icons.scale_bydimension.width}</label>
		<input id="tile-scale-relative" type="number" bind:value={selectedTile.symbol.pWidth} />
		%
	      </div>
	      <div class="builder-control-row">
		<input type="range" min="5" max="100" bind:value={selectedTile.symbol.pWidth} />
	      </div>

	      <div class="builder-control-row">
		<label for="tile-scale-relative">{$tl.icons.scale_bydimension.height}</label>
		<input id="tile-scale-relative" type="number" bind:value={selectedTile.symbol.pHeight} />
		%
	      </div>
	      <div class="builder-control-row">
		<input type="range" min="5" max="100" bind:value={selectedTile.symbol.pHeight} />
	      </div>
	    {/if}
	  {/if}
    </aside>
  {:else}
    <aside id="editor-placeholder">
      <p style="color: #f2f2f2; margin-bottom: 10px;">
        {$tl.builders.tileset_builder.helptext}
      </p>

      <p style="font-size: 10pt">
        {$tl.builders.tileset_builder.helpsubtitle}
      </p>
    </aside>
  {/if}
</main>

<style>

  #tile-preview-controls {
    margin-top: 5px;
    display: flex;
    gap: 5px;
  }

  #tile-preview-controls button {
    width: 40px;
    height: 40px;
    padding: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #tile-preview-controls button img {
    height: 80%;
  }

  #set-controls {
    padding: 10px;
    background-color: #555555;
    box-sizing: border-box;
  }

  #set-controls #tileset-attr-grid {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    gap: 5px;
  }

  #tileset-attr-grid input {
    width: 100%;
    box-sizing: border-box;
    height: 2em;
  }

  #tileset-attr-grid label {
    height: 100%;
    display: flex;
    align-items: center;
  }

  #editor-placeholder {
    grid-column: 2/4;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  #editor-placeholder p {
    color: #aaaaaa;
    margin: 0;
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

  main {
    display: grid;
    grid-template-columns: 310px 1fr 1fr;
    grid-template-rows: 1fr;
    margin: 0;
    height: 100%;
    color: #f2f2f2;
  }

  #editor-placeholder {
    grid-column: 2/4;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #tile-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  #tile-style {
    display: flex;
    justify-content: center;
    flex-direction: column;
    min-width: 350px;
    width: 50%;
  }

  nav {
    height: 100%;
    background-color: #222222;
  }

  #tile-buttons {
    padding: 10px;
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(5, 50px);
    grid-template-rows: 50px;
    grid-auto-rows: 50px;
  }

  .tile-button {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tile-button img {
    max-width: 100%;
    max-height: 100%;
  }

  .color {
    display: grid;
    grid-template-columns: 60px 1fr;
    grid-template-rows: 60px;
    column-gap: 10px;
  }

  .color div {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .color p {
    margin: 0;
  }

  .color .color-string {
    font-size: 10pt;
    color: #bbbbbb;
  }

  .builder-control-row {
    display: flex;
    gap: 0.25em;
    height: 2em;
    align-items: center;
  }
  .builder-control-row :first-child {
    flex-grow: 1;
  }

  .builder-control-row input[type="number"] {
    width: 4em;
    height: 2em;
  }


</style>
