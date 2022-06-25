<script lang="ts">
    import type { terrain_data } from "src/types/data";
import TerrainField from "./TerrainField.svelte";


    export let selectedTool;

    export let data_terrain: terrain_data;



    /* Terrain */
    interface terrain_controls {
        leftMouse: string
    }
    let c_terrain: terrain_controls = {
        leftMouse: "Place Terrain"
    }


    $: {
        c_terrain.leftMouse = "Place Terrain"

        if (data_terrain.usingEyedropper) {
            c_terrain.leftMouse = "Eyedrop Hex"
        } else if (data_terrain.usingPaintbucket && data_terrain.usingEraser) {
            c_terrain.leftMouse = "Erase all similar"
        
        } else if (data_terrain.usingPaintbucket) {
            c_terrain.leftMouse = "Fill with Terrain"
            
        } else if (data_terrain.usingEraser) {
            c_terrain.leftMouse = "Erase Hex"
        }
    }
 
</script>

<span>

    <div class="control"> <p>Right Mouse</p> <p>Pan</p></div>
    <div class="control"> <p>Scroll</p> <p>Zoom</p></div>

    {#if selectedTool == "terrain"}
        <div class="control"> <p>Left Mouse</p> <p>{c_terrain.leftMouse}</p></div>

    {/if}

</span>

<style>

    p {
        margin: 0;
        font-size: 10pt;
    }

    .control {
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 100%;
    }

    span {
        
        position: absolute;
        right: 0px;
        bottom: 0px;

        padding: 10px;

        width: 200px;
        display: flex;
        
        align-items: flex-end;
        flex-direction: column;
    }

</style>