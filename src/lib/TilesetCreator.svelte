<script lang="ts">

  import type { hexOrientation } from '../helpers/hexHelpers';
  import type {Tile, Tileset} from '/src/types/tilesets'

  import * as PIXI from 'pixi.js';
  import { Pixi, Graphics, Sprite } from 'svelte-pixi'

  import { getHexPathRadius } from '../helpers/hexHelpers'

  import {download} from './download2'

  import ColorInputPixi from '../components/ColorInputPixi.svelte'
  import { tick } from 'svelte';


  let app = new PIXI.Application({
    width: 300,
    height: 300,
    backgroundAlpha: 0
  });
  
  
  export let appState;

  let tilesetName = "default"

  let orientation: hexOrientation = "flatTop"

  let workingTileset: Tileset = {
    name: "New Tileset",
    id: "new-tileset",
    author: "",
    version: 1,
    tiles: []
  }


  let selectedTile: Tile | null = null

  let loader = new PIXI.Loader()
  

  let previewSprite = new PIXI.Sprite()
  let previewGraphics = new PIXI.Graphics()
  let previewContainer = new PIXI.Container()
  previewContainer.addChild(previewGraphics).addChild(previewSprite)


  function findID(baseId: string = "new-hex"): string {

    let id = baseId
    let counter = 0

    while (workingTileset.tiles.find( (tile: Tile) => tile.id == `${id}${counter == 0 ? "" : counter}` ) != null) {
      counter++
    }

    return `${id}${counter == 0 ? "" : counter}`
  }


  function newTile() {

    let newTile: Tile = {
      display: "New Hex",
      id: findID("new-hex"),
      symbol: null,
      bgColor: DEFAULTBLANKHEXCOLOR,
      preview: ""

    }

    newTile.preview = generatePreview(newTile)

    workingTileset.tiles = [...workingTileset.tiles, newTile]

    selectedTile = workingTileset.tiles[workingTileset.tiles.length - 1]

  }

  function generatePreview(tile: Tile) {
      previewGraphics.clear();
      previewGraphics.beginFill(tile.bgColor);
      previewGraphics.drawPolygon( getHexPathRadius(25, orientation, 0, 0) );
      previewGraphics.endFill();

      previewSprite.texture = null
      if (tile.symbol) {
        previewSprite.texture = PIXI.Texture.from(tile.symbol.base64)
        previewSprite.scale.set( getSymbolScale(tile.symbol, 25).x )
        previewSprite.anchor.set(0.5)
        previewSprite.tint = tile.symbol.color
      } 

      return app.renderer.plugins.extract.base64(previewContainer)
  } 

  function IDify(name: string) {
    return name.toLowerCase().replace(" ", "-")
  }

  $: {
    //if (selectedTile) selectedTile.preview = generatePreview(workingTileset.tiles[stIndex])
  
    if (selectedTile) {
      selectedTile.preview = generatePreview(selectedTile)
      selectedTile.id = workingTileset.id + "_" + findID( IDify(selectedTile.display) )
    }
  }


  let symbolFileInput
  let symbolFiles = [];

  function updateSymbolFile() {
    

    console.log(symbolFiles[0].name)

    let r = new FileReader()
    r.readAsDataURL(symbolFiles[0])
    r.onload = eb => {
    
      loader.reset()
      loader.add("s", eb.target.result)
      loader.load(() => {

        selectedTile.symbol = {
          color: selectedTile.symbol ? selectedTile.symbol.color : 0xffffff,
          texWidth: loader.resources.s.texture.width,
          texHeight: loader.resources.s.texture.height,
          pHex: 80,
          base64: eb.target.result,
        }

      })

    }

  }


  function getSymbolScale(symbol, radius = 150) {

    let h, w
    if (orientation == "pointyTop") {
        h = radius * 2;
        w = Math.cos(Math.PI / 6) * radius * 2;

    } else {
        w = radius * 2;
        h = (radius / Math.tan(Math.PI / 6));

    }

    let scale
    if (w < h) {
      scale = w * symbol.pHex / 100 / symbol.texWidth
    } else {
      scale = h * symbol.pHex / 100 / symbol.texHeight;
    }

    return {x: scale, y: scale}
  }

  const DEFAULTBLANKHEXCOLOR = 0xf2f2f2

  function exportTileset() {

    workingTileset.id = IDify(workingTileset.name)

    download( 
      JSON.stringify(workingTileset),
      tilesetName + ".hfts"
    )

  }

  let importFiles = [];

  async function importTileset() {
    let importFile = importFiles[0]

    if (!importFile) return


    let r = new FileReader()
    r.readAsText(importFile)
    r.onload = async eb => {
      /* Read the file */
      let setToImport = JSON.parse(eb.target.result);
      
      //console.log(setToImport)

      /* Load textures */
 
      workingTileset = {...setToImport}
      await tick();
      //workingTileset.tiles = workingTileset.tiles;
      

    }
  }

</script>

<main>
  
  <nav>
    <div id="set-controls">
      <button on:click={ () => {appState = "normal"} }>Exit Tileset Builder</button>
      <input type="text" bind:value={workingTileset.name} placeholder="Tileset Name" >
      <input type="text" bind:value={workingTileset.author} placeholder="Tileset Author">
      <input type="number" bind:value={workingTileset.version}>
      <button on:click={ () => exportTileset() }>Export</button>

      <button on:click={ () => importTileset() } class="file-input-button">
        Import Tileset
        <input type="file" bind:files={importFiles} accept={".hfts"} on:change={e => {importTileset(); e.target.value = ""}}>
      </button>
    </div>


    <div id="tile-buttons">

      {#each workingTileset.tiles as tile (tile.id)}
        <button class="tile-button" class:selected={ selectedTile == tile } on:click={ () => { selectedTile = tile }} title={tile.display}>
          <img src={tile.preview} alt="Button for {tile.display}">
        </button>
      {/each}

      <button class="tile-button" on:click={ () => { newTile() } }>+</button>
    
    </div>
  </nav>

  {#if selectedTile}

    <div id="tile-preview">


      
      <Pixi {app}>

        {#if selectedTile.symbol}
          <Sprite 
            texture={PIXI.Texture.from(selectedTile.symbol.base64)}
            x={150}
            y={150}
            anchor={ {x: 0.5, y: 0.5} }
            tint={selectedTile.symbol.color}
            scale={ getSymbolScale( selectedTile.symbol ) }
          />
        {/if}

        <Graphics draw={(g) => {
          g.clear();
          g.beginFill(selectedTile.bgColor);
          g.drawPolygon( getHexPathRadius(150, orientation, 150, 150) );
          g.endFill();
        }} />
      
      </Pixi>
      
      
      <input type="text" bind:value={ selectedTile.display } on:change={() => { workingTileset.tiles = workingTileset.tiles }}>
      <!--
      <button on:click={() => {orientation = orientation == "flatTop" ? "pointyTop" : "flatTop"; workingTileset.tiles=workingTileset.tiles}}>Change Orientation</button>
      <button on:click={() => { deleteTile() } }>Delete Hex</button>
      <button on:click={() => { duplicateTile() }}> Duplicate Hex </button>
      -->
    </div>
    
    <div id="tile-controls">
      
      <!-- Background Color -->
      <div class="color" style="margin-bottom: 10px">
        
        <div>
          <ColorInputPixi bind:value={selectedTile.bgColor} w={50} h={50} />
        </div>

        <p>Background</p>
        <p>{PIXI.utils.hex2string(selectedTile.bgColor)}</p>
      </div>      
      


      <!-- Symbol Filename 
        {#if workingTileset.tiles[stIndex].symbolFile}
        Current Symbol: {workingTileset.tiles[stIndex].symbolFile.name}
        {:else}
        <p>Current Symbol: —</p>
        {/if}
      -->
      


      <!-- File Upload Button -->
        <button class="file-input-button">
          Upload Symbol
          <input type="file" accept="image/*" bind:files={symbolFiles} on:change={e => { updateSymbolFile(); e.target.value="" /*Hacky, but necessary*/ } } >
        </button>


      
      <!-- Symbol Input Controls 
      -->
      {#if selectedTile.symbol}
        <div class="color" style="margin-top: 10px">
          <div>
            <ColorInputPixi bind:value={selectedTile.symbol.color} w={50} h={50} />
          </div>
          <p>Symbol</p>
          <p>{PIXI.utils.hex2string(selectedTile.symbol.color)}</p>
        </div>

        <div id="symbol-scale">
          Symbol Scale
          <input type="range" min="5" max="100" bind:value={selectedTile.symbol.pHex}>
          <input type="number" bind:value={selectedTile.symbol.pHex}>%
        </div>
        {/if}


    </div>
  
  {:else}

    <div id="editor-placeholder">
      <p>Select a tile or make a new one!</p>
    </div>

  {/if}

</main>











<style>

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

  #import-button {
    position: relative;
  } 
   
  #import-button input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  input[type="number"] {
    background-color: #777777;
    border: 0;
    border-bottom: solid 2px #222222;
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

  #tile-controls {
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 50%;
  }

  nav {
    height: 100%;
    background-color: #222222;
  }

  #set-controls {
    background-color: #555555;
    padding: 10px;
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
    width: 100%;
  }

  .color {
    display: grid;
    grid-template-columns: 60px 1fr;
    grid-template-rows: 30px 30px;
    column-gap: 10px;
  }

  .color div {
    grid-row: 1/3;
  }

  .color p {
    margin: 0;
  }

</style>
