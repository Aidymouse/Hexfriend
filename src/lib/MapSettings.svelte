<script lang="ts" >
    import type { saveData } from "./defaultSaveData";
    import { map_type } from "../types/settings";
    import type { coordinates_data } from "../types/data";
    import type { TerrainHexField } from "../types/terrain";

    import SelectGrid from "../components/SelectGrid.svelte";
    import ColorInputPixi from "../components/ColorInputPixi.svelte";
    import Checkbox from "../components/Checkbox.svelte";
    import { coord_system } from "/src/types/cordinates";

    export let loadedSave: saveData
    export let showSettings
    export let appState
    export let showTerrainGenerator
    
    export let exportMap: Function
    
    export let tfield: TerrainHexField
    export let comp_terrainField
    export let renderAllHexes: Function
    export let renderGrid: Function
    export let redrawEntireMap: Function

    export let comp_coordsLayer
    export let data_coordinates: coordinates_data

    function changeOrientation() {
        let t = tfield.hexWidth
        tfield.hexWidth = tfield.hexHeight
        tfield.hexHeight = t
        //tfield.hexWidth, tfield.hexHeight = tfield.hexHeight, tfield.hexWidth
        
        comp_terrainField.changeOrientation()

        //redrawEntireMap()
    }

    let addOrRemoveHex: "add" | "remove" = "add"
    

</script>

<button id="close-tab" class:shown={showSettings} on:click={()=>{showSettings = false}} title={"Close Settings"}> <img src="/assets/img/tools/back.png" alt={"Back"}> </button>
  
<div id="settings" class:shown={showSettings}>
    
    <input style="font-size: 20pt; font-family: Segoe UI; border-radius: 3px; width: 100%; box-sizing: border-box;" type="text" placeholder="Map Title" bind:value={loadedSave.title}>
    
    <span style="display: grid; grid-template-columns: 1fr 1fr; margin-top: 5px; column-gap: 5px;">
        <button on:click={() => { exportMap() } } title="Export" >Export as PNG</button>
        <button disabled={true} on:click={() => {  } } title="Import (Coming Soon)" >Import</button>
    </span> 
    <p style="font-size: 10pt; color: #FF6666; background-color: rgba(1, 1, 1, 0.5); padding: 5px; margin-top: 5px;">Hexfriend is still a work in progress, so unexpected things may occur.</p>

    <h2>Grid</h2>
    <div class="settings-grid">
        <label for="showGrid">Show Grid</label>
        <Checkbox bind:checked={tfield.grid.shown} name={"showGrid"} />
        {#if tfield.grid.shown}
            <label for="gridThickness">Grid Thickness</label>
            <input id="gridThickness" type="number" bind:value={tfield.grid.thickness} on:change={() => { renderGrid() }  }> 
            <label for="gridColor">Grid Color</label>
            <ColorInputPixi bind:value={tfield.grid.stroke} on:change={() => {renderGrid()} } name={"gridColor"} />
        {/if}
    </div>
    

    <h2>Hexes</h2>
    <div class="settings-grid">
        
        <label for="blankHexColor">Blank Hex Color</label>
        <ColorInputPixi bind:value={tfield.blankHexColor} on:change={ () => { renderAllHexes() } } name={"blankHexColor"}/>
            
        <button style={"margin-right: 10px"} on:click={ () => {tfield.blankHexColor = 0xf2f2f2} }>Reset to default color</button>
        <p></p>
        
        <p>Hex Orientation</p>
        <div style={"height: 100%; display: flex; align-items: center;"}>
            <SelectGrid values={["flatTop", "pointyTop"]} bind:value={tfield.orientation} on:change={ () => { changeOrientation() } } />
        </div>
        <label for="hexWidth">Hex Width</label>
        <input id="hexWidth" type="number" bind:value={tfield.hexWidth} on:change={() => { redrawEntireMap(); comp_coordsLayer.updateAllCoordPositions() } }>
        
        <label for="hexHeight">Hex Height</label>
        <input id="hexHeight" type="number" bind:value={tfield.hexHeight} on:change={() => { redrawEntireMap(); comp_coordsLayer.updateAllCoordPositions() }}>

        <!--
        <label for="mapType">Map Type</label>
        <select id="mapType" bind:value={tfield.mapType}>
            <option value={map_type.SQUARE}>Square</option>
            <option value={map_type.RADIAL}>Radial</option>
        </select>
        -->

        {#if tfield.mapType == map_type.SQUARE}

            {#if tfield.orientation == "flatTop"}
                <p>Raised Column</p>
                <div style={"height: 100%; display: flex; align-items: center;"}>
                    <SelectGrid values={["even", "odd"]} filenamePrefix={"raisedColumn"} bind:value={tfield.raised} on:change={() => { comp_terrainField.square_updateRaisedColumn() }}/>
                </div>

            {:else if tfield.orientation == "pointyTop"}
                <p>Indented Row</p>
                <div style={"height: 100%; display: flex; align-items: center;"}>
                    <SelectGrid values={["even", "odd"]} filenamePrefix={"indentedRow"} bind:value={tfield.raised} on:change={() => { comp_terrainField.square_changeIndentedRow() }} />
                </div>
                
            {/if}
            
        {/if}

    </div>


    <!--
    -->
    <h2>Map Dimensions</h2>
    <section id="map-dimensions-container">
        <div id="map-dimensions">
            {#if addOrRemoveHex == "add"}
                <button style="grid-area: left;" on:click={() => { comp_terrainField.square_expandMapDimension('left', 1) } }>Add<br>Left</button>
                <button style="grid-area: top;" on:click={() => { comp_terrainField.square_expandMapDimension('top', 1) } }>Add<br>Top</button>
                <button style="grid-area: bottom;" on:click={() => { comp_terrainField.square_expandMapDimension('bottom', 1) } }>Add<br>Bottom</button>
                <button style="grid-area: right;" on:click={() => { comp_terrainField.square_expandMapDimension('right', 1) } }>Add<br>Right</button>
                <button style="grid-area: center;" on:click={() => { addOrRemoveHex = "remove" }}> 
                    <img src={`/assets/img/tools/addHex_${tfield.orientation == "flatTop" ? "ft" : "pt"}.png`} alt={"Add Hex"} title={"Add Hex"}> 
                </button>
                
            {:else}
                <button style="grid-area: left;" on:click={() => { comp_terrainField.square_reduceMapDimension('left', 1) } }>Remove<br>Left</button>
                <button style="grid-area: top;" on:click={() => { comp_terrainField.square_reduceMapDimension('top', 1) } }>Remove<br>Top</button>
                <button style="grid-area: bottom;" on:click={() => { comp_terrainField.square_reduceMapDimension('bottom', 1) } }>Remove<br>Bottom</button>
                <button style="grid-area: right;" on:click={() => { comp_terrainField.square_reduceMapDimension('right', 1) } }>Remove<br>Right</button>
                <button style="grid-area: center;" on:click={() => { addOrRemoveHex = "add" }}> 
                    <img src={`/assets/img/tools/removeHex_${tfield.orientation == "flatTop" ? "ft" : "pt"}.png`} alt={"Remove Hex"} title={"Remove Hex"}> 
                </button>
            {/if}
        </div>
    </section>

    
    <h2 style="margin-bottom: 0px;">Coordinates</h2>
    <p class="helperText">Coordinates can slow down map changes such as adding or removing rows.</p>
    <div class="settings-grid">
        <label for="showCoords">Show Coordinates</label>
        <Checkbox bind:checked={data_coordinates.shown} name={"showCoords"} />

        {#if data_coordinates.shown}
            <label for="coordsSystem">Coordinate System<sup><a href="https://www.redblobgames.com/grids/hexagons/#coordinates" target="_blank" title="Hex Coordinate Systems Explanation">?</a></sup></label>
            <select id="coordsSystem" bind:value={data_coordinates.system} on:change={ comp_coordsLayer.updateAllCoordsText() }>
                <option value={coord_system.ROWCOL}>Column, Row</option>
                <option value={coord_system.AXIAL}>Axial</option>
                <option value={coord_system.CUBE}>Cube</option>
            </select>

            <label for="coordsFill">Color</label>
            <ColorInputPixi bind:value={data_coordinates.style.fill} name={"coordsFill"} />
            
            <label for="coordFontSize">Font Size</label>
            <input id="coordFontSize" type="number" bind:value={data_coordinates.style.fontSize}>
            
            <label for="coordsOutline">Outline Color</label>
            <ColorInputPixi bind:value={data_coordinates.style.stroke} name={"coordsOutline"}/>

            <label for="coordsStrokeThickness">Outline Thickness</label>
            <input id="coordsStrokeThickness" type="number" bind:value={data_coordinates.style.strokeThickness}>

            <label for="coordSeperator">Seperator</label>
            <input id="coordSeperator" type="text" bind:value={data_coordinates.seperator} on:change={() => { comp_coordsLayer.updateAllCoordsText() }}/>

            <label for="coordGap">Gap</label>
            <input id="coordGap" type="number" bind:value={data_coordinates.gap} on:change={() => { comp_coordsLayer.updateAllCoordPositions() }}/>

        {/if}
    </div>


    <h2>Tilesets</h2>

    <button>Import Tileset</button>
    
    <h2>Iconsets</h2>
    <button>Import Iconset</button>

    <h2>Experimental</h2>
    <p class="helperText">This stuff is not polished and may be broken.</p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
    
    <button on:click={() => { appState = "tilesetCreator" }}>Tileset Builder</button>
    <button on:click={() => { appState = "iconsetCreator" }}>Iconset Builder</button>

    <button disabled={true} on:click={() => { /*showTerrainGenerator = true; showSettings = false */ }} title={"Coming soon!"}> Generate Terrain </button>
    </div>
    
    <h2>About</h2>
    <p class="helperText">
        Hexfriend version 0.1 – "Hex Cometh"
        <br>
        By Aidymouse
    </p>

    <p class="helperText">
        Hexfriend is built with Svelte, Pixi JS and Typescript. Check out the <a href="https://www.github.com/Aidymouse/Hexfriend">Github</a>
    </p>

    <p class="helperText" style="text-align: center; font-size: 20pt;">
        ☺
    </p>
        
    

</div>
    

<style>

    #map-dimensions-container {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #map-dimensions {
        display: grid;
        
        grid-template-columns: 60px 60px 60px;
        grid-template-rows: 60px 60px 60px;
        gap: 5px;

        grid-template-areas: "top-left top top-right"
        "left center right"
        "bottom-left bottom bottom-right";
    }

    #map-dimensions button {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #map-dimensions button img {
        width: 90%;
        height: auto;
    }

    h2 {
        margin-bottom: 10px;
    }


    button.shown {
        left: 275px !important;
    }

    #settings.shown {
        left: 0px !important;
    }

    .helperText {
        font-size: 12px;
        color: #999999;
        line-height: 1.2;
        margin: 0;
        margin-bottom: 5px;
        margin-top: 5px;
        font-style: oblique;
    }

    .settings-grid {
        display: grid;
        grid-template-columns: 3fr 2fr;
        grid-template-rows: auto;
        row-gap: 5px;
    }
    
    .settings-grid input {
        width: 50px;
    }


    p {
        margin: 0;
    }


    #settings {
        position: absolute;
        top: 0;
        left: -325px;
        width: 300px;
        height: 100%;
        background: #333333;

        padding: 10px;
        box-sizing: border-box;

        overflow-y: scroll;
        overflow-x: hidden;
        transition-duration: 0.2s;
    }

    #close-tab {
        position: absolute;
        left: -50px;        

        top: calc(50% - 25px);

        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        background: #333333;
    }

    #close-tab:hover {
        background: #555555;
    }

    #close-tab img {
        margin: 0;
        width: 50%;
        margin-left: 50%;
    }



</style>