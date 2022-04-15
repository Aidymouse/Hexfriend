<script lang="ts">

  import type { hexOrientation } from './hexHelpers';

  import * as PIXI from 'pixi.js';
  import { Pixi, Graphics, Sprite } from 'svelte-pixi'

  import { getHexPathRadius } from './hexHelpers'

  import {download} from './download2'

  import ColorInputPixi from './components/ColorInputPixi.svelte'
import { tick } from 'svelte';


  let app = new PIXI.Application({
    width: 300,
    height: 300,
    backgroundAlpha: 0
  });
  
  
  export let appState;

  let tilesetName = "default"

  let orientation: hexOrientation = "flatTop"

  let tileButtons = []
  let stIndex = -1

  let loader = new PIXI.Loader()

  let symbolFileInput
  let symbolFiles = [];

  let importFiles = [];

  let previewSprite = new PIXI.Sprite()
  let previewGraphics = new PIXI.Graphics()
  let previewContainer = new PIXI.Container()
  previewContainer.addChild(previewGraphics).addChild(previewSprite)

  function generatePreview(button) {
      previewGraphics.clear();
      previewGraphics.beginFill(button.bgColor);
      previewGraphics.drawPolygon( getHexPathRadius(25, orientation, 0, 0) );
      previewGraphics.endFill();

      previewSprite.texture = null
      if (button.symbol) {
        previewSprite.texture = PIXI.Texture.from(button.symbol.base64)
        previewSprite.scale.set( getSymbolScale(button.symbol, 25).x )
        previewSprite.anchor.set(0.5)
        previewSprite.tint = button.symbol.color
      } 

      return app.renderer.plugins.extract.base64(previewContainer)
  } 

  $: {
    if (stIndex > -1) tileButtons[stIndex].preview = generatePreview(tileButtons[stIndex])
  }

  function updateFile() {
    tileButtons[stIndex].symbolFile = symbolFiles[0]

    let r = new FileReader()
    r.readAsDataURL(symbolFiles[0])
    r.onload = eb => {
    
      loader.reset()
      loader.add("s", eb.target.result)
      loader.load(() => {

        tileButtons[stIndex].symbol = {
          color: tileButtons[stIndex].symbol ? tileButtons[stIndex].symbol.color : 0xffffff,
          texWidth: loader.resources.s.texture.width,
          texHeight: loader.resources.s.texture.height,
          pHex: 80,
          base64: eb.target.result,
        }

      })

    }

  }

  function changeSelected(index) {
    stIndex = index
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

    let generatedTileset = tileButtons.map( b => { 
      return {
        display: b.display,
        bgColor: b.bgColor,
        id: tilesetName + "_" + b.display.replace(" ", "-"),
        symbol: b.symbol ? {...b.symbol, texId: b.display.replace(" ", "-")} : null
      }

    });

    download( 
      JSON.stringify(generatedTileset),
      tilesetName + ".hfts"
    )

    console.log(generatedTileset)
  }

  async function importTileset() {
    let importFile = importFiles[0]

    let r = new FileReader()
    r.readAsText(importFile)
    r.onload = async eb => {
      /* Read the file */
      let setToImport = JSON.parse(eb.target.result);
      
      //console.log(setToImport)

      /* Load textures */
 

      tileButtons = [...setToImport]
      await tick();
      //tileButtons = tileButtons;
      console.log(tileButtons)
      

    }
  }

  function newTile() {
    let newButton = { display: "New Hex", bgColor: DEFAULTBLANKHEXCOLOR, symbol: null, symbolFile: null, preview: null }
    newButton.preview = generatePreview(newButton)
    tileButtons = [...tileButtons, newButton ]
    stIndex = tileButtons.length-1
  }

  function removeSymbol() {
    tileButtons[stIndex].symbol = null
    symbolFileInput.value = null
    tileButtons = tileButtons
  }

</script>

<main>
  
  <nav>
    <div id="set-controls">
      <button on:click={ () => {appState = "normal"} }>Exit Tileset Builder</button>
      <input type="text" bind:value={tilesetName} >
      <button on:click={ () => exportTileset() }>Export</button>

      <button on:click={ () => importTileset() } id="import-button">
        Import Tileset
        <input type="file" bind:files={importFiles} on:change={e => {importTileset(); e.target.value = ""}}>
      </button>
    </div>


    <div id="tile-buttons">

      {#each tileButtons as b}
        <button class="tile-button {tileButtons.indexOf(b) == stIndex ? 'selected' : ''}" on:click={ () => { changeSelected(tileButtons.indexOf(b)) }}>
          <img src={b.preview} alt={`${b.display} Tile`}>
        </button>
      {/each}

      <button class="tile-button" on:click={ () => { newTile() } }>+</button>
    
    </div>
  </nav>

  {#if stIndex > -1}

    <div id="tile-preview">

      <Pixi {app}>

        {#if tileButtons[stIndex].symbol}
          <Sprite 
            texture={PIXI.Texture.from(tileButtons[stIndex].symbol.base64)}
            x={150}
            y={150}
            anchor={ {x: 0.5, y: 0.5} }
            tint={tileButtons[stIndex].symbol.color}
            scale={ getSymbolScale( tileButtons[stIndex].symbol ) }
          />
        {/if}

          <Graphics draw={(g) => {
            g.clear();
            g.beginFill(tileButtons[stIndex].bgColor);
            g.drawPolygon( getHexPathRadius(150, orientation, 150, 150) );
            g.endFill();
          }} />
      
      </Pixi>

      <input type="text" bind:value={ tileButtons[stIndex].display } on:change={() => {tileButtons = tileButtons}}>
      <button on:click={() => {orientation = orientation == "flatTop" ? "pointyTop" : "flatTop"; tileButtons=tileButtons}}>Change Orientation</button>

    </div>
    
    <div id="tile-controls">
      
      <!-- Background Color -->
      <div class="color" style="margin-bottom: 10px">
        <div>
          <ColorInputPixi bind:value={tileButtons[stIndex].bgColor} />
        </div>
        <p>Background</p>
        <p>{PIXI.utils.hex2string(tileButtons[stIndex].bgColor)}</p>
      </div>

      <!-- File Upload Button -->
      
      
      <!-- Symbol Filename -->
      {#if tileButtons[stIndex].symbolFile}
        Current Symbol: {tileButtons[stIndex].symbolFile.name}
      {:else}
        <p>Current Symbol: —</p>
      {/if}

      <div id="upload" style="margin-top: 10px">
        <input type="file" bind:files={symbolFiles} on:change={e => { updateFile(); e.target.value="" /*Hacky, but necessary*/ } } >
      </div>

      <!-- Symbol Input Controls -->
      {#if tileButtons[stIndex].symbol}
        <div class="color" style="margin-top: 10px">
          <div>
            <ColorInputPixi bind:value={tileButtons[stIndex].symbol.color} />
          </div>
          <p>Symbol</p>
          <p>{PIXI.utils.hex2string(tileButtons[stIndex].symbol.color)}</p>
        </div>

        <div id="symbol-scale">
          Symbol Scale
          <input type="range" min="5" max="100" bind:value={tileButtons[stIndex].symbol.pHex}>
          <input type="number" bind:value={tileButtons[stIndex].symbol.pHex}>%
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

  input[type="text"] {
    background-color: #777777;
    border: 0;
    border-bottom: solid 2px #222222;
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

  #upload {
    width: 50px;
    height: 20px;
    border: solid 1px grey;
    border-radius: 3px;
  }

  #upload input {
    opacity: 0;
    width: 100%;
    height: 100%;
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

  .selected {
    border-color: red;
  }

</style>
