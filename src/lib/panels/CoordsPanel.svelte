<script lang="ts">
    
    import type { coordinates_data } from "../../types/data";
    
    import ColorInputPixi from "../../components/ColorInputPixi.svelte";
    
    export let data_coordinates: coordinates_data
    export let comp_coordsLayer

    
</script>


<div class="panel">

    <input type="checkbox" bind:checked={data_coordinates.shown}>

    {#if data_coordinates.shown}
        <input type="number" bind:value={data_coordinates.style.fontSize}> <!-- Gotta fix this... -->
        <div style="width: 30px; height: 30px;"><ColorInputPixi bind:value={data_coordinates.style.fill} /></div>
        <input type="number" bind:value={data_coordinates.style.strokeThickness}>
        <div style="width: 30px; height: 30px;"><ColorInputPixi bind:value={data_coordinates.style.stroke} /></div>

        <input type="text" bind:value={data_coordinates.seperator} on:change={() => { comp_coordsLayer.updateSeperator() }}/>

    {/if}
</div>


<style>

    .panel {
        padding: 10px;
    }

</style>