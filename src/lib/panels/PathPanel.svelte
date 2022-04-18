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

        pathButtons = pathButtons
    }

    let pathButtons = [
        {display: "Green", style: {color: 0x00ff00, width: 13, cap: "round", join: "round"} },
        {display: "Red", style: {color: 0xff0000, width: 3, cap: "round", join: "bevel"} },
    ]

    function styleMatchesData(pathStyle) {
        console.log(pathStyle, data_path.style)
        if (pathStyle.color != data_path.style.color) return false
        if (pathStyle.width != data_path.style.width) return false
        if (pathStyle.cap != data_path.style.cap) return false
        if (pathStyle.join != data_path.style.join) return false

        return true
    }

</script>

<div class="panel">
        
        <div id="controls">
            <div style="width: 25px; height: 25px">
                <ColorInputPixi bind:value={data_path.style.color} />
            </div>

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
                <button on:click={ () => {data_path.style = {...pb.style}} } class:selected={styleMatchesData(pb.style)} >{pb.display}</button>
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

    .selected {
        border-color: #8cc63f;
        outline: #8cc63f solid 1px;
        transition-duration: .2s;
    }
</style>