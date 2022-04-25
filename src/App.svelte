<script lang="ts">
  
  /* COLORS

    hexfriend green: #8cc63f

  */

  /* TODO 
  
    - fix textures not loading in time to be on the map
    - keyboard shortcuts
    - tooltips
    - more fonts
    - dashed lines
    - hex coordinates on map
    - export at different sizes

  */

  import type { Tile } from './types/tilesets'
  import type { TerrainHexField } from './types/terrain'
  import type { saveData } from './lib/defaultSaveData'
  import type { icon_data } from './types/data';
  import type { text_data } from './types/text';

  import * as PIXI from 'pixi.js'
  import { Pixi, Container, Sprite } from 'svelte-pixi'
  import { tick } from 'svelte'
  import { db } from './lib/db'

  import { getHexPath, cubeToWorld } from './helpers/hexHelpers'

  // Layers
  import TerrainField from './lib/TerrainField.svelte'
  import IconLayer from './lib/IconLayer.svelte'
  import PathLayer from './lib/PathLayer.svelte'
  import TextLayer from './lib/TextLayer.svelte'
  
  // Panels
  import TerrainPanel from './lib/panels/TerrainPanel.svelte'
  import IconPanel from './lib/panels/IconPanel.svelte'
  import PathPanel from './lib/panels/PathPanel.svelte'
  import TextPanel from './lib/panels/TextPanel.svelte'

  // Like, whatever
  import ToolButtons from './lib/ToolButtons.svelte'
  import TilesetCreator from './lib/TilesetCreator.svelte'
  import IconsetCreator from './lib/IconsetCreator.svelte';
  import TerrainGenerator from './lib/TerrainGenerator.svelte';  
  import SavedMaps from './lib/SavedMaps.svelte';
  import MapSettings from './lib/MapSettings.svelte';

  // Methods
  import { collapseWaveGen } from './lib/terrainGenerator'
  import { download } from './lib/download2';

  // Data
  import DEFAULTSAVEDATA from './lib/defaultSaveData'
  

  /* STATE */

  let loadedSave: saveData = DEFAULTSAVEDATA
  let loadedId: number | null = null;

  let appState: "normal" | "tilesetCreator" | "iconsetCreator" = "normal"

  let showSettings = false
  let showTerrainGenerator = false

  function changeState(e) {
    appState = e.detail.newState
  }

  

  let offsetContainer = new PIXI.Container();

  /* STUFF TO BIND TO */
  let comp_terrainField;
  let comp_iconLayer;
  let comp_pathLayer;
  let comp_textLayer;

  //offsetContainer.addChild(terrainGraphics);

  /* APPLICATION */
  let app = new PIXI.Application({
    backgroundAlpha: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    resizeTo: window
  });

  let showSavedMaps = false

  let loading = true

  let loadedTilesets: {[key: string]: Tile[]}
  let loadedIconsets
  let tfield: TerrainHexField
  

  /* PANNING */
  let pan = {
    panning: false,

    oldX: 0,
    oldY: 0,

    offsetX: window.innerWidth/2,
    offsetY: window.innerHeight/2,
    
    screenX: 0,
    screenY: 0,

    zoomScale: 1,

    get worldX() {
      return (pan.screenX - pan.offsetX) / pan.zoomScale
    },
    
    get worldY() {
      return (pan.screenY - pan.offsetY) / pan.zoomScale
    },

    startPan: function(e: PointerEvent) {

      pan.panning = true
      pan.oldX = e.clientX
      pan.oldY = e.clientY
        
    },
    
    handle: function(e: PointerEvent) {

      pan.screenX = e.clientX //e.detail.data.global.x
      pan.screenY = e.clientY //e.detail.data.global.y

      if (pan.panning) {
        pan.offsetX += e.clientX - pan.oldX //e.detail.data.global.x - pan.oldX
        pan.offsetY += e.clientY - pan.oldY //e.detail.data.global.y - pan.oldY
        
        pan.oldX = e.clientX //e.detail.data.global.x
        pan.oldY = e.clientY //e.detail.data.global.y
      }
      
    },
    
    endPan: function() {
      pan.panning = false
      
    },
    
    zoom: function(e: WheelEvent) {
      let xBeforeZoom = pan.worldX
      let yBeforeZoom = pan.worldY

      let zoomFactor = 1.15
      if (e.deltaY < 0) {
        pan.zoomScale *= zoomFactor
        
      } else {
        pan.zoomScale /= zoomFactor
      }

      // Move the screen
      let xAfterZoom = pan.worldX
      let yAfterZoom = pan.worldY

      let dx = (xAfterZoom - xBeforeZoom) * pan.zoomScale
      let dy = (yAfterZoom - yBeforeZoom) * pan.zoomScale

      pan.offsetX += dx
      pan.offsetY += dy
    },
    
  }

  let controls = {
    mouseDown: [false, false, false, false, false]
  }

  let selectedTool: string = "terrain";

  /* DATA */
  /* Data is bound to both layer and panel of a particluar tool. It contains all the shared state they need, and is bound to both */
  
  let data_terrain = {
    bgColor: null,
    symbolData: null,
    usingEyedropper: false,
    usingPaintbucket: false,
  }

  let data_icon: icon_data = {
    color: null,
    texId: null,
    pHex: 80,
    snapToHex: true
  }

  let data_path = {
    style: {color: 0, width: 3, cap: "round", join: "round"},
    colorString: "#000000",
    selectedPath: null,
    snap: false,
    editorRef:null,
  }

  let data_text: text_data = {
    style: {fontFamily: "Segoe UI", fill: "#000000", fontSize: 25, miterLimit: 2, strokeThickness: 0, stroke: "#f2f2f2", align: "left"},
    selectedText: null,
    editorRef: null
  }


  const L: PIXI.Loader = new PIXI.Loader()

  // Never cleared, to stop duplicate textures being added
  let seentextures = []
  let seenicons = []
  // Theoretically a memory leak... but bounded by how many unique tiles can be loaded. Shouldn't be a problem?

  function loadSave(data: saveData, id: number | null) {

    loadedTilesets = data.tilesets;
    loadedIconsets = data.iconsets;
    tfield = data.TerrainField;

    // Load Textures
    for (let tilesetName in loadedTilesets) {
      let tileset = loadedTilesets[tilesetName]
      tileset.forEach(async tile => {
        if (tile.symbol && seentextures.find(id => tile.symbol.texId == id) == undefined && !L.resources[tile.symbol.texId] ) {
          L.add(tile.symbol.texId, tile.symbol.base64)
          seentextures.push(tile.symbol.texId);
        }
      });
    }

    // Load Icons
    for (let iconsetName in loadedIconsets) {
      let iconset = loadedIconsets[iconsetName]
      iconset.forEach(icon => {

        if (seenicons.find(id => icon.texId == id) == undefined && !L.resources[icon.texId]) {
          L.add(icon.texId, icon.base64)
          seenicons.push(icon.texId)
        }
      
      })
    }

    L.onComplete.add( async () => {

      loadedSave = data
      loadedId = id

      let firstTile = loadedTilesets[ Object.keys(loadedTilesets)[0] ][0]
      data_terrain.bgColor = firstTile.bgColor
      data_terrain.symbolData = firstTile.symbol ? {...firstTile.symbol} : null
  
      let firstIcon = loadedIconsets[ Object.keys(loadedIconsets)[0] ][0]
      data_icon.color = firstIcon.color
      data_icon.texId = firstIcon.texId

      loading = false
      await tick()
      comp_terrainField.clearTerrainSprites();
      comp_terrainField.renderAllHexes();

    });
  
    L.load();
    
    /* Set up tools - would be nice to remember tool settings but this works regardless of loaded tileset */

    //loadedSave = data
    //loadedId = id
  }
 
  loadSave(DEFAULTSAVEDATA, null);




  function exportMap() {
    download( app.renderer.plugins.extract.base64(offsetContainer), "export.png", "image/png" )
  }

  /* TOOL METHODS */


  /* ALL PURPOSE POINTER METHODS */
  function pointerdown(e: PointerEvent) {
    controls.mouseDown[e.button] = true

    if (controls.mouseDown[2]) pan.startPan(e)

    switch (selectedTool) {
      case "terrain":
        if (controls.mouseDown[0]) comp_terrainField.pointerdown()
        break
      
      case "icon":
        if (controls.mouseDown[0]) comp_iconLayer.newIcon()
        break

      case "path":
        if (controls.mouseDown[0]) comp_pathLayer.pointerdown()
        break

      case "text":
        if (controls.mouseDown[0]) comp_textLayer.pointerdown()
        break

      case "eraser":
        if (controls.mouseDown[0]) comp_terrainField.erase()
        /* Icons are handled in the IconLayer */
        break
    }

  }

  function pointerup(e: PointerEvent) {
    controls.mouseDown[e.button] = false

    if (!controls.mouseDown[2]) pan.endPan()

    switch (selectedTool) {
      case "text":
        comp_textLayer.pointerup()
        break
    }
  }

  function pointermove(e: PointerEvent) {
    pan.handle(e);

    switch (selectedTool) {
      case "terrain":
        if (controls.mouseDown[0]) comp_terrainField.placeTerrain()
        break

      case "text":
        comp_textLayer.pointermove()
        break
      
      case "eraser":
        if (controls.mouseDown[0]) comp_terrainField.erase()
        break
    }
  }



  

  
  

  function gen() {
    
    showSettings = false

    let generated = collapseWaveGen(10)
    //console.log(generated)
    let c = 0;
    Object.keys(generated).forEach(hexId => {
        let tileToPaint = loadedTilesets['default'].find(tile => tile.id == generated[hexId].id)
        setTimeout(() => { comp_terrainField.paintFromTile(hexId, tileToPaint) }, c*5)
        c++
    })

    //comp_terrainField.renderAllHexes();
  }

  async function save() {

    if (loadedSave.title == "") {
      let t = prompt("Map Title:")
      if (t != null) {
        loadedSave.title = t
      } else {
        alert("Cancelled save")
        return
      }
    }

    let c = JSON.stringify(loadedSave)
    let p = app.renderer.plugins.extract.base64(offsetContainer);

    if (loadedId) {
      const id = await db.mapSaves.update(loadedId, {
        mapTitle: loadedSave.title,
        previewBase64: p
      })

      await db.mapStrings.update(loadedId, {
        mapString: c
      })

      console.log(`Updated saved map with id ${loadedId}`)

    } else {
      const id = await db.mapSaves.add({
        mapTitle: loadedSave.title,
        previewBase64: p,
      })

      await db.mapStrings.add({
        mapString: c
      })
  
      console.log(`Added map with id ${id}`)
      loadedId = id
      
    }

    alert("Saved")


  }

  function load(data: saveData, id: number) {
    
    // Clean up
    console.log(`Loaded ${id}`)
    loading = true

    loadSave(data, id)
    //await loadSave(data, id)

    data_path.selectedPath = null
    data_text.selectedText = null
  
    //await tick()

    // await tick() // The terrain field needs time to hook onto 
    //comp_terrainField.renderAllHexes() 
  }
  
  /* HOT ZONE */

</script>













{#if appState == "normal" && !loading}


  <main
    on:contextmenu|preventDefault={e => {}}
    on:mousewheel={e => {pan.zoom(e)} }
    on:pointerdown={ e => { pointerdown(e) }}
    on:pointermove={ e => { pointermove(e) }}
    on:pointerup={ e => { pointerup(e) }}
  >
    
    <Pixi {app} >
      <Container
        instance={offsetContainer}
        x={pan.offsetX}
        y={pan.offsetY}
        scale={ {x: pan.zoomScale, y: pan.zoomScale} }
      >

        <TerrainField bind:this={comp_terrainField} bind:data_terrain {pan} {controls} {L} bind:tfield={loadedSave.TerrainField} />

        <PathLayer bind:this={comp_pathLayer} bind:paths={loadedSave.paths} bind:data_path {pan} {controls} {selectedTool} {tfield}  />

        <IconLayer bind:this={comp_iconLayer} bind:icons={loadedSave.icons} bind:data_icon {L} {pan} {selectedTool} {tfield} {controls} />          

        <TextLayer bind:this={comp_textLayer} bind:texts={loadedSave.texts} bind:data_text {pan} />

      </Container>

    </Pixi>
    
  </main>

  <!-- Terrain Buttons -->
  {#if showTerrainGenerator}
    <TerrainGenerator {loadedTilesets} {tfield} {comp_terrainField} bind:showTerrainGenerator />

  {:else if selectedTool == "terrain"}
    <TerrainPanel {loadedTilesets} {tfield} {app} {L} bind:data_terrain />
  
  {:else if selectedTool == "icon"}
    <IconPanel {L} {app} {loadedIconsets} bind:data_icon />
  
  {:else if selectedTool == "path"}
    <PathPanel bind:data_path {comp_pathLayer} />

  {:else if selectedTool == "text"}
    <TextPanel bind:data_text {comp_textLayer} />
  {/if}
    
    
    <!--
      -->
    
    

  <div id="tool-buttons">
    <ToolButtons bind:selectedTool />
      
    
    <!--
    
    -->
  </div>

  <div id="setting-buttons">
    <div id="save-buttons">
      <button on:click={save} title={"Save"} > <img src="assets/img/tools/save.png" alt="Save"> </button>
    </div>
    <button on:click={() => {showSavedMaps = true}} title={"Maps"} ><img src="assets/img/tools/maps.png" alt="Maps"></button>
    <button on:click={()=>{showSettings = true}} title={"Map Settings"} ><img src="assets/img/tools/settings.png" alt="Map Settings"></button>
  </div>
    
  {#if showSavedMaps}
  <SavedMaps bind:showSavedMaps {load} />
  {/if}

  {#if showSettings}
    <MapSettings 
      {loadedSave}
      {tfield}
      bind:showSettings
      bind:appState
      bind:showTerrainGenerator
      {save}
      renderAllHexes={() => {comp_terrainField.renderAllHexes()}}
      renderGrid={() => { comp_terrainField.renderGrid() }}
      exportMap={() => {exportMap()}}
    />
  {/if}



{:else if appState == "tilesetCreator"}

<TilesetCreator bind:appState />

{:else if appState == "iconsetCreator"}

<IconsetCreator bind:appState />

{/if}












<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

    background-color: #333333;
    color: white;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .invisible {
    display: none;
  }

  #cover {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
    display: none;
  }
  
  #cover .visible {
    display: block;
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

  /* PANELS */
  :global(.panel) {
    background-color: #333333;
    border-radius: 4px;
    width: 300px;
    box-sizing: border-box;
    position: fixed;
    top: 10px;
    right: 10px;
  }

  /* GLOBAL BUTTON STYLING */
  :global(button) {
    border: solid 1px #777777;
    border-radius: 3px;
    background-color: #333333;
    color: white;
    padding: 5px;
    transition-duration: .2s;
  }

  :global(button:hover) {
    background-color: #555555;
  }
  
  :global(button:active) {
    background-color: #444444;
  }

  /* GLOBAL INPUT STYLE */
  :global(input) {
    background-color: #777777;
    border: 0;
    border-bottom: solid 2px #222222;
    transition-duration: .2s;
    transition-property: border-color;
    color: #f2f2f2;
  }

  :global(input[type=text]) {
    padding: 5px;
  }

  :global(input[type=number]) {
    padding: 5px;
  }

  :global(input:focus) {
    border-color: #8cc63f;
    transition-duration: .2s;
    transition-property: border-color;
    outline: none;
  }


  :global(textarea) {
    outline: none;
    color: #f2f2f2;
    background-color: #333333;
    border-radius: 3px;
  }

  :global(textarea:focus) {
    outline-style: solid;
    outline-width: 1px;
    outline-color: #8cc63f;
    border-color: #8cc63f
  }

  :global(select) {
    background-color: #777777;
    color: #f2f2f2;
    padding: 5px;
    border-radius: 3px;
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