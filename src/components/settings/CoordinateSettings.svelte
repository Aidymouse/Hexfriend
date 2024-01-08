<script lang="ts">
    
    import "../../styles/settings.css";

    import { data_coordinates } from "../../stores/data";
    
    import Checkbox from "../Checkbox.svelte";
    import ColorInputPixi from "../ColorInputPixi.svelte";
    
    import { coord_system } from "../../types/coordinates";

    export let comp_coordsLayer;



</script>

<div class="settings-grid">
    <label class="helper-text">Coordinates can slow down map changes such as adding hexes or changing orientation.</label>
    <label for="showCoords">Show Coordinates</label>
    <Checkbox bind:checked={$data_coordinates.shown} id={'showCoords'} />

    {#if $data_coordinates.shown}
        <label for="coordsSystem"
            >Coordinate System<sup
                ><a href="https://www.redblobgames.com/grids/hexagons/#coordinates" target="_blank" title="Hex Coordinate Systems Explanation"
                    >?</a
                ></sup
            ></label
        >
        <select id="coordsSystem" bind:value={$data_coordinates.system} on:change={comp_coordsLayer.updateAllCoordsText}>
            <option value={coord_system.ROWCOL}>Column, Row</option>
            <option value={coord_system.AXIAL}>Axial</option>
            <option value={coord_system.CUBE}>Cube</option>
            <option value={coord_system.LETTERNUMBER}>Letter Number</option>
        </select>

        <label for="coordsFill">Color</label>
        <ColorInputPixi bind:value={$data_coordinates.style.fill} id={'coordsFill'} />

        <label for="coordFontSize">Font Size</label>
        <input id="coordFontSize" type="number" bind:value={$data_coordinates.style.fontSize} />

        <label for="coordsOutline">Outline Color</label>
        <ColorInputPixi bind:value={$data_coordinates.style.stroke} id={'coordsOutline'} />

        <label for="coordsStrokeThickness">Outline Thickness</label>
        <input id="coordsStrokeThickness" type="number" bind:value={$data_coordinates.style.strokeThickness} />

        <label for="coordSeperator">Separator</label>
        <input
            id="coordSeperator"
            type="text"
            bind:value={$data_coordinates.seperator}
            on:change={() => {
                comp_coordsLayer.updateAllCoordsText();
            }}
        />

        <label for="coordGap">Space from bottom</label>
        <input
            id="coordGap"
            type="number"
            bind:value={$data_coordinates.gap}
            on:change={() => {
                comp_coordsLayer.updateAllCoordPositions();
            }}
        />

        {#if $data_coordinates.system == coord_system.ROWCOL || $data_coordinates.system == coord_system.LETTERNUMBER}
            <label for="coord-offset-rowcol-row">Row Offset</label>
            <input  id="coord-offset-rowcol-row" type="number" bind:value={$data_coordinates.offsets.row_col.row} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
            
            <label for="coord-offset-rowcol-col">Column Offset</label>
            <input  id="coord-offset-rowcol-col" type="number" bind:value={$data_coordinates.offsets.row_col.col} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
        {/if}
        
        {#if $data_coordinates.system == coord_system.AXIAL || $data_coordinates.system == coord_system.CUBE}
            <label for="coord-offset-cube-q">Q Offset</label>
            <input  id="coord-offset-cube-q" type="number" bind:value={$data_coordinates.offsets.cube.q} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
            
            <label for="coord-offset-cube-r">R Offset</label>
            <input  id="coord-offset-cube-r" type="number" bind:value={$data_coordinates.offsets.cube.r} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
        {/if}
        
        {#if $data_coordinates.system == coord_system.CUBE}
            <label for="coord-offset-cube-s">S Offset</label>
            <input  id="coord-offset-cube-s" type="number" bind:value={$data_coordinates.offsets.cube.s} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
        {/if}

    {/if}
</div>

<style>

</style>