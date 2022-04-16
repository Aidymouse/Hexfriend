<script lang="ts">
    import type { path } from 'src/types/path'

    import * as PIXI from 'pixi.js'

    import ColorInputPixi from '../../components/ColorInputPixi.svelte'
    import SelectGrid from '../../components/SelectGrid.svelte'

    export let comp_pathLayer
    export let data_path

    $: {
        if (data_path.selectedPath) {
            data_path.selectedPath.style = {...data_path.style}
        }
    }

    let pathButtons = [
        {display: "Green", style: {color: 0x00ff00, width: 13, cap: "round", join: "round"} },
        {display: "Red", style: {color: 0xff0000, width: 3, cap: "round", join: "bevel"} },
    ]

</script>

<div class="panel">
        
        <div id="controls">
        
            <ColorInputPixi bind:value={data_path.style.color} />
            Thickness <input type="number" bind:value={data_path.style.width}>
            Snap <input type="checkbox" bind:checked={data_path.snap} >

            Line Ends
            <SelectGrid values={["round", "butt", "square"]} bind:value={data_path.style.cap} filenamePrefix={"lineend"}/>
            
            Corners
            <SelectGrid values={["round", "miter", "bevel"]} bind:value={data_path.style.join} filenamePrefix={"linecorner"} />

        </div>


        
        {#if data_path.selectedPath}
        <div id="selected-path-controls">    
                <button on:click={() => {data_path.selectedPath = null}} >Deselect Current Path</button>
                <button on:click={() => {comp_pathLayer.removeLastPoint(data_path.selectedPath)}}>Remove Last Point</button>
                <button on:click={() => {comp_pathLayer.deletePath(data_path.selectedPath)}}>Delete Path</button>
            </div>
            {/if}
            
        <div id="path-styles">
            {#each pathButtons as pb}
                <button on:click={ () => {data_path.colorString = PIXI.utils.hex2string(pb.style.color); data_path.style = {...pb.style}} } >{pb.display}</button>
            {/each}
        </div>
        <!--


        -->
        
        
</div>

<style>
    div { color: white; }
    
    #controls {
        padding: 10px;
    }

    #selected-path-controls {
        background-color: #555555;
        padding: 10px;
    }

    #path-styles {
        padding: 10px;
    }
</style>