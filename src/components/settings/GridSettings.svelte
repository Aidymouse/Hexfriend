
<script lang="ts">

    import "../../styles/settings.css";

    import Checkbox from "../Checkbox.svelte";
    import ColorInputPixi from "../ColorInputPixi.svelte";
    import SelectGrid from "../SelectGrid.svelte";

    import { tfield } from "../../stores/tfield";
  
    import { map_shape } from "../../types/settings";
    import { hex_orientation } from "../../types/terrain";

    export let comp_terrainLayer;
    export let comp_coordsLayer;

    export let renderGrid: Function;
    export let redrawEntireMap: Function;
    export let retain_positions: Function;

</script>

<div class="settings-grid">

    <label for="showGrid">Show Grid</label>
    <!-- Weird bug where the grid wont render if you turn it off then resize the hex flower map ?? -->
    <Checkbox bind:checked={$tfield.grid.shown} id={'showGrid'} on:change={comp_terrainLayer.renderGrid} />
    {#if $tfield.grid.shown}
        <label for="gridThickness">Grid Thickness</label>
        <input
            id="gridThickness"
            type="number"
            min="0"
            max="99"
            bind:value={$tfield.grid.thickness}
            on:change={() => {
                renderGrid();
            }}
        />

        <label for="gridColor">Grid Color</label>
        <ColorInputPixi
            bind:value={$tfield.grid.stroke}
            on:change={() => {
                renderGrid();
            }}
            id={'gridColor'}
        />
    {/if}

    <label for="gridGap">Gap</label>
    <input
        id="gap"
        type="number"
        min="0"
        max="99"
        bind:value={$tfield.grid.gap}
        on:focus={() => {
        }}
        on:change={(e) => {
            redrawEntireMap();
            comp_coordsLayer.updateAllCoordPositions();
            retain_positions();
        }}
    />

    <!-- LARGE HEXES -->
    <label for="showOverlay">Large Hexes</label>
    <Checkbox bind:checked={$tfield.largehexes.shown} id="showOverlay" />

    {#if $tfield.largehexes.shown}
        
            <label for="overlayDiameter">Size</label>
            <input type="number" id="overlayDiameter" min={2} bind:value={$tfield.largehexes.diameterInHexes} />

            <label for="overlayColor">Color</label>
            <ColorInputPixi id={'overlayColor'} bind:value={$tfield.largehexes.style.color} />

            <label for="overlayThickness">Outline Thickness</label>
            <input type="number" id={'overlayThickness'} bind:value={$tfield.largehexes.style.width} />

            <label for="overlayOffsetX" title="Measured in Hex Widths">Horizontal Offset</label>
            <input type="number" bind:value={$tfield.largehexes.offset.x} min={0} step={0.25} />

            <label for="overlayOffsetY" title="Measured in Hex Heights">Vertical Offset</label>
            <input type="number" bind:value={$tfield.largehexes.offset.y} min={0} step={0.25} />

            <label for="overlayEncompass">Encompass Map Edges</label>
            <Checkbox bind:checked={$tfield.largehexes.encompassEdges} id="overlayEncompass" />

            {#if $tfield.mapShape == map_shape.SQUARE}
                <label>{$tfield.orientation == hex_orientation.FLATTOP ? 'Large Raised Column' : 'Large Indented Row'}</label>
                <span style={'height: 100%; display: flex; align-items: center;'}>
                    <SelectGrid
                        options={[
                            {
                                title: 'Even',
                                value: 'even',
                                filename: `${$tfield.orientation == hex_orientation.FLATTOP ? 'bigraisedcolumn' : 'bigindentedrow'}even`,
                            },
                            {
                                title: 'Even',
                                value: 'odd',
                                filename: `${$tfield.orientation == hex_orientation.FLATTOP ? 'bigraisedcolumn' : 'bigindentedrow'}odd`,
                            },
                        ]}
                        bind:value={$tfield.largehexes.raised}
                    />
                </span>
            {/if}
        {/if}
</div>