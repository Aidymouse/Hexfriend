<script lang="ts">
    
    import "../../styles/settings.css";

    import { data_coordinates } from "../../stores/data";
    import { tl } from "../../stores/translation";
    
    import Checkbox from "../Checkbox.svelte";
    import ColorInputPixi from "../ColorInputPixi.svelte";
    
    import { coord_system } from "../../types/coordinates";

    export let comp_coordsLayer;



</script>

<div class="settings-grid">
    <label class="helper-text">{$tl.settings.coordinates.disclaimer}</label>
    <label for="showCoords">{$tl.settings.coordinates.show}</label>
    <Checkbox bind:checked={$data_coordinates.shown} id={'showCoords'} />

    {#if $data_coordinates.shown}
        <label for="coordsSystem"
               >{$tl.settings.coordinates.system}<sup
                ><a href="https://www.redblobgames.com/grids/hexagons/#coordinates" target="_blank" title="Hex Coordinate Systems Explanation"
                    >?</a
                ></sup
            ></label
        >
        <select id="coordsSystem" bind:value={$data_coordinates.system} on:change={comp_coordsLayer.updateAllCoordsText}>
            <option value={coord_system.ROWCOL}>{$tl.settings.coordinates.systems.colrow}</option>
            <option value={coord_system.AXIAL}>{$tl.settings.coordinates.systems.axial}</option>
            <option value={coord_system.CUBE}>{$tl.settings.coordinates.systems.cube}</option>
            <option value={coord_system.LETTERNUMBER}>{$tl.settings.coordinates.systems.letternumber}</option>
        </select>

        <label for="coordsFill">{$tl.settings.coordinates.text_labels.color}</label>
        <ColorInputPixi bind:value={$data_coordinates.style.fill} id={'coordsFill'} />

        <label for="coordFontSize">{$tl.settings.coordinates.text_labels.size}</label>
        <input id="coordFontSize" type="number" bind:value={$data_coordinates.style.fontSize} />

        <label for="coordsOutline">{$tl.settings.coordinates.text_labels.outline_color}</label>
        <ColorInputPixi bind:value={$data_coordinates.style.stroke} id={'coordsOutline'} />

        <label for="coordsStrokeThickness">{$tl.settings.coordinates.text_labels.outline_thickness}</label>
        <input id="coordsStrokeThickness" type="number" bind:value={$data_coordinates.style.strokeThickness} />

        <label for="coordSeperator">{$tl.settings.coordinates.separator}</label>
        <input
            id="coordSeperator"
            type="text"
            bind:value={$data_coordinates.seperator}
            on:change={() => {
                comp_coordsLayer.updateAllCoordsText();
            }}
        />

        <label for="coordGap">{$tl.settings.coordinates.space}</label>
        <input
            id="coordGap"
            type="number"
            bind:value={$data_coordinates.gap}
            on:change={() => {
                comp_coordsLayer.updateAllCoordPositions();
            }}
        />

        {#if $data_coordinates.system == coord_system.ROWCOL || $data_coordinates.system == coord_system.LETTERNUMBER}
            <label for="coord-offset-rowcol-row">{$tl.settings.coordinates.offset.row}</label>
            <input  id="coord-offset-rowcol-row" type="number" bind:value={$data_coordinates.offsets.row_col.row} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
            
            <label for="coord-offset-rowcol-col">{$tl.settings.coordinates.offset.column}</label>
            <input  id="coord-offset-rowcol-col" type="number" bind:value={$data_coordinates.offsets.row_col.col} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
        {/if}
        
        {#if $data_coordinates.system == coord_system.AXIAL || $data_coordinates.system == coord_system.CUBE}
            <label for="coord-offset-cube-q">{$tl.settings.coordinates.offset.q}</label>
            <input  id="coord-offset-cube-q" type="number" bind:value={$data_coordinates.offsets.cube.q} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
            
            <label for="coord-offset-cube-r">{$tl.settings.coordinates.offset.r}</label>
            <input  id="coord-offset-cube-r" type="number" bind:value={$data_coordinates.offsets.cube.r} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
        {/if}
        
        {#if $data_coordinates.system == coord_system.CUBE}
            <label for="coord-offset-cube-s">{$tl.settings.coordinates.offset.s}</label>
            <input  id="coord-offset-cube-s" type="number" bind:value={$data_coordinates.offsets.cube.s} on:change={() => { comp_coordsLayer.updateAllCoordsText(); }}/>
        {/if}

    {/if}
</div>

<style>

</style>
