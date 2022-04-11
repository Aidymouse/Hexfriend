<script lang="ts">
  import type { hexOrientation } from './hexHelpers';
  import type { Tile, TileSymbol } from './defaultSaveData';

  import * as PIXI from 'pixi.js';
  import { Pixi, Graphics, Sprite } from 'svelte-pixi'
  
  import { createEventDispatcher } from 'svelte'

  import { getHexPathRadius } from './hexHelpers'

  import {download} from './download2'

  let dispatch = createEventDispatcher();

  function changeAppState() {
    dispatch('appstatechange', {
      newState: "normal"
    })
  }

  let app = new PIXI.Application({
    width: 300,
    height: 300,
    backgroundAlpha: 0
  });
  
  
  let tilesetName: string = "default"

  let orientation: hexOrientation = "flatTop"

  let tileButtons: {display: string, bgColor: number, symbol: TileSymbol}[] = [];
  let stIndex: number = -1; // Seleccted Tile Index

  $: symbolScale = (stIndex != -1 && tileButtons[stIndex].symbol) ? 280 / tileButtons[stIndex].symbol.texWidth : 0

  let loader: PIXI.Loader = new PIXI.Loader();

  let symbolTex: PIXI.Texture | null;
  let symbolFileInput;

  function symbolFileChanged(e) {
    let image = e.target.files[0]
    //console.log(image);
    let r = new FileReader()
    r.readAsDataURL(image)
    r.onload = eb => {
      
      loader.reset()
      loader.add("s", eb.target.result)
      loader.load(() => {

        symbolTex = loader.resources.s.texture

        tileButtons[stIndex].symbol = {
          color: tileButtons[stIndex].symbol ? tileButtons[stIndex].symbol.color : "#ffffff",
          base64: eb.target.result,
          imageWidth: loader.resources.s.texture.width,
          imageHeight: loader.resources.s.texture.height
        }
      
      });
    
    }
  }

  const DEFAULTBLANKHEXCOLORSTRING = "#f2f2f2";
  const DEFAULTBLANKHEXCOLOR = PIXI.utils.string2hex(DEFAULTBLANKHEXCOLORSTRING);


  function selectButton(index) {
    stIndex = index;
    //bgColor = buttons[selectedButtonIndex].bgColor;
  }

  function exportTileset() {

    let generatedTileset: Tile[] = tileButtons.map( b => { return {display: b.display, bgColor: b.bgColor, id: tilesetName + "_" + b.display.replace(" ", "-"), symbol: b.symbol} } )

    download( 
      JSON.stringify(generatedTileset),
      tilesetName + ".hfts"
    )
  }

  function newTile() {
    tileButtons = [...tileButtons, { display: "New Hex", bgColor: DEFAULTBLANKHEXCOLOR, symbol: null } ]
    selectButton(tileButtons.length-1)
  }

  function removeSymbol() {
    tileButtons[stIndex].symbol = null;
    symbolTex = null;
    symbolFileInput.value = null;
    tileButtons = tileButtons;
  }

</script>

<main>
  
  <div id="buttons">
    <button on:click={e => changeAppState()}>Exit Tileset Builder</button>
    
    <input type="text" bind:value={tilesetName} >
    {#each tileButtons as b}
      <button class="tile-button" on:click={ () => { selectButton( tileButtons.indexOf(b) ) }}>{b.display}</button>
    {/each}

    <button class="tile-button" on:click={ () => { newTile() } }>+</button>
  
    <button on:click={() => exportTileset()}>Export</button>
  </div>

  {#if stIndex >= 0}

    <div id="tile-preview">

      <Pixi {app}>
    
          {#if tileButtons[stIndex].symbol}
            <Sprite 
              texture={symbolTex}
              tint={ tileButtons[stIndex].symbol.color }
              x={150}
              y={150}
              scale={{x: symbolScale, y: symbolScale}}
              anchor={{x:0.5, y:0.5}}
            />
          {/if}

          <Graphics draw={(g) => {
            g.clear();
            g.beginFill(bgColorPixi);
            g.drawPolygon( getHexPathRadius(150, orientation, 150, 150) );
            g.endFill();
          }} />
      
      </Pixi>

      <input type="text" bind:value={ tileButtons[stIndex].display }>
      <button on:click={() => {orientation = orientation == "flatTop" ? "pointyTop" : "flatTop"}}>Change Orientation</button>
    </div>

    <div id="tile-controls">
    

      <input type="color" bind:value={ tileButtons[stIndex].bgColor }>

      <input type="file" on:change={ e => symbolFileChanged(e) } bind:this={symbolFileInput} >
      
      {#if tileButtons[stIndex].symbol}

        <input type="color" bind:value={ tileButtons[stIndex].symbol.color }>
        <button on:click={ e => removeSymbol() }>Remove Icon</button>
 
      {/if}

      </div>
  
  {:else}

    <div id="editor-placeholder">
      <p>Select a tile or make a new one!</p>
    </div>

  {/if}

</main>

<style>

  main {
    display: grid;
    grid-template-columns: 300px 1fr 1fr;
    grid-template-rows: 1fr;
    margin: 0;
    height: 100%;
    color: #f2f2f2;
  }

  #buttons {
    background-color: #222222;
  }


  #editor-placeholder {
    grid-column: 2/4;
    display: flex;
    align-items: center;
    justify-content: center;
  }


  .tile-button {
    width: 50px;
    height: 50px;
  }
  
</style>
