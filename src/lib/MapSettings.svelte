<script lang="ts" >
    import type { saveData } from "./defaultSaveData";

    import SelectGrid from "../components/SelectGrid.svelte";
    import ColorInputPixi from "../components/ColorInputPixi.svelte";

    export let loadedSave: saveData;
    export let tfield;
    export let showSettings;
    export let appState;
    export let showTerrainGenerator;

    export let save: Function;
    export let renderAllHexes: Function;
    export let renderGrid: Function;
    export let exportMap: Function;

</script>

<div id="settings-container">
    
    <div id="settings">
        
        Title: <input type="text" bind:value={loadedSave.title}>
        
        <button on:click={()=>{showSettings = false}}>Close</button>
        <button on:click={()=>{ save(); showSettings = false}}>Save and Close</button>

        Show Grid <input type="checkbox" bind:checked={tfield.grid.shown} on:change={() => { renderGrid() }} >
        {#if tfield.grid.shown}<input type="number" bind:value={tfield.grid.thickness} on:change={() => { renderGrid() } }>{/if}


        Blank Hex Color
        <div style="width: 30px; height: 30px;">
            <ColorInputPixi bind:value={tfield.blankHexColor} on:change={ () => { renderAllHexes() } } />
        </div>
        <button on:click={ () => {tfield.blankHexColor = 0xf2f2f2} }>Reset to default color</button>

        <SelectGrid values={["flatTop", "pointyTop"]} bind:value={tfield.orientation} on:change={ () => {renderAllHexes()} } />

        <input type="number" bind:value={tfield.hexWidth} on:change={() => { renderAllHexes() } }>
        <input type="number" bind:value={tfield.hexHeight} on:change={() => { renderAllHexes() }}>

        <button on:click={() => { appState = "tilesetCreator" }}>Tileset Builder</button>  
        <button on:click={() => { appState = "iconsetCreator" }}>Iconset Builder</button>  

        <button on:click={() => { showTerrainGenerator = true; showSettings = false }}> Generate Terrain </button>
            <button on:click={exportMap} title="Export" >Export</button>


    </div>
    
</div>

<style>
    #settings-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
    }

    #settings {
        width: 50%;
        height: 50%;
        background: #333333;
        border: solid 1px grey;
        border-radius: 3px;

        padding: 10px;
        box-sizing: border-box;

        overflow-y: scroll;
        overflow-x: hidden;
    }




</style>