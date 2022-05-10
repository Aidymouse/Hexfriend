<script lang="ts" >
    import type { saveData } from "./defaultSaveData";
    import { map_type } from "../types/settings";
    import type { coordinates_data } from "../types/data";
    import type { TerrainHexField } from "../types/terrain";

    import SelectGrid from "../components/SelectGrid.svelte";
    import ColorInputPixi from "../components/ColorInputPixi.svelte";
    import Checkbox from "../components/Checkbox.svelte";

    export let loadedSave: saveData
    export let showSettings
    export let appState
    export let showTerrainGenerator
    
    export let save: Function
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


    

</script>

<button id="close-tab" class:shown={showSettings} on:click={()=>{showSettings = false}}><p>&lt;</p></button>
  
<div id="settings" class:shown={showSettings}>
    
    <input style="font-size: 20pt; font-family: Segoe UI; border-radius: 3px" type="text" placeholder="Map Title" bind:value={loadedSave.title}>
    

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
        <input id="hexWidth" type="number" bind:value={tfield.hexWidth} on:change={() => { redrawEntireMap() } }>
        
        <label for="hexHeight">Hex Height</label>
        <input id="hexHeight" type="number" bind:value={tfield.hexHeight} on:change={() => { redrawEntireMap() }}>

        <label for="mapType">Map Type</label>
        <select id="mapType" bind:value={tfield.mapType}>
            <option value={map_type.SQUARE}>Square</option>
            <option value={map_type.RADIAL}>Radial</option>
        </select>
        
        {#if tfield.mapType == map_type.SQUARE}

            {#if tfield.orientation == "flatTop"}
                <p>Raised Column</p>
                <div style={"height: 100%; display: flex; align-items: center;"}>
                    <SelectGrid values={["even", "odd"]} filenamePrefix={"raisedColumn"} bind:value={tfield.raised} on:change={() => { renderAllHexes() }}/>
                </div>

            {:else if tfield.orientation == "pointyTop"}
                <p>Indented Row</p>
                <div style={"height: 100%; display: flex; align-items: center;"}>
                    <SelectGrid values={["even", "odd"]} filenamePrefix={"indentedRow"} bind:value={tfield.raised} on:change={() => { renderAllHexes() }} />
                </div>
                
            {/if}
            
        {/if}

    </div>


    <h2>Map Dimensions</h2>
    <button on:click={() => { comp_terrainField.square_expandMapDimension('left', 1) } }>Add Left</button>
    <button on:click={() => { comp_terrainField.square_expandMapDimension('top', 1) } }>Add Top</button>
    <button on:click={() => { comp_terrainField.square_expandMapDimension('bottom', 1) } }>Add Bottom</button>
    <button on:click={() => { comp_terrainField.square_expandMapDimension('right', 1) } }>Add Right</button>
    

    <h2 style="margin-bottom: 0px;">Coordinates</h2>
    <p class="helperText">Turn coordinates on only before export. They are slow.</p>
    <div class="settings-grid">
        <label for="showCoords">Show Coordinates</label>
        <Checkbox bind:checked={data_coordinates.shown} name={"showCoords"} />

        {#if data_coordinates.shown}
            <label for="coordFontSize">Font Size</label>
            <input id="coordFontSize" type="number" bind:value={data_coordinates.style.fontSize}>
            
            <label for="coordsFill">Color</label>
            <ColorInputPixi bind:value={data_coordinates.style.fill} name={"coordsFill"} />
            
            <label for="coordsStrokeThickness">Outline Thickness</label>
            <input id="coordsStrokeThickness" type="number" bind:value={data_coordinates.style.strokeThickness}>
            
            <label for="coordsOutline">Outline Color</label>
            <ColorInputPixi bind:value={data_coordinates.style.stroke} name={"coordsOutline"}/>

            <lavel for="coordSeperator">Seperator</lavel>
            <input id="coordSeperator" type="text" bind:value={data_coordinates.seperator} on:change={() => { comp_coordsLayer.updateSeperator() }}/>

        {/if}
    </div>


    <h2>Idk</h2>
    
    <button on:click={() => { appState = "tilesetCreator" }}>Tileset Builder</button>
    <button on:click={() => { appState = "iconsetCreator" }}>Iconset Builder</button>

    <button on:click={() => { showTerrainGenerator = true; showSettings = false }}> Generate Terrain </button>
    <button on:click={() => { exportMap() } } title="Export" >Export</button>



</div>
    

<style>

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
        grid-template-columns: 3fr 1fr;
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

    #close-tab p {
        margin: 0;
        width: 50%;
        margin-left: 50%;
        color: #777777;
        font-weight: bold;
    }



</style>