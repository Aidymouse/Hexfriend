<script lang="ts">

    import "../../styles/settings.css";

    import ColorInputPixi from "../ColorInputPixi.svelte";
    import SelectGrid from "../SelectGrid.svelte";
    import ImageCheckbox from "../ImageCheckbox.svelte";

    import { hex_orientation } from "../../types/terrain";
    import { map_shape } from "../../types/settings";

    import { tfield } from "../../stores/tfield";
    import { resize_parameters } from "../../stores/resize_parameters";
    import { store_has_unsaved_changes } from "../../stores/flags";

    import { get_radius_from_width_height, get_width_height_from_radius } from '../../helpers/hexHelpers'

    export let comp_coordsLayer;
    export let comp_terrainLayer;

    export let retain_positions: Function;
    export let save_old_resize_parameters: Function;
    export let renderAllHexes: Function;
    export let redrawEntireMap: Function;

    export let retainIconPosition;
    export let retainPathPosition;
    export let retainTextPosition;

    function changeOrientation() {
		let t = $tfield.hexWidth;
		$tfield.hexWidth = $tfield.hexHeight;
		$tfield.hexHeight = t;
		//$tfield.hexWidth, $tfield.hexHeight = $tfield.hexHeight, $tfield.hexWidth

		comp_terrainLayer.changeOrientation();

		$store_has_unsaved_changes = true;

		//redrawEntireMap()
	}

</script>

<div class="settings-grid">
    <label for="blankHexColor">Blank Hex Color</label>
    <div style="display: flex; gap: 0.25em; align-items: center;">
        <ColorInputPixi
            bind:value={$tfield.blankHexColor}
            on:change={() => {
                renderAllHexes();
            }}
            id={'blankHexColor'}
        />

        <button
            style={'height: fit-content;'}
            on:click={() => {
                $tfield.blankHexColor = 0xf2f2f2;
            }}>Reset</button
        >
    </div>

    <label>Hex Orientation</label>
    <div style={'height: 100%; display: flex; align-items: center;'}>
        <SelectGrid
            options={[
                { title: 'Flat Top', value: hex_orientation.FLATTOP, filename: 'flatTop' },
                { title: 'Pointy Top', value: hex_orientation.POINTYTOP, filename: 'pointyTop' },
            ]}
            bind:value={$tfield.orientation}
            on:change={() => {
                changeOrientation();

                comp_coordsLayer.cullUnusedCoordinates();
                comp_coordsLayer.updateAllCoordPositions();
                comp_coordsLayer.updateAllCoordsText();
                comp_coordsLayer.populateBlankHexes();

                save_old_resize_parameters();
            }}
        />
    </div>

    {#if $tfield.mapShape == map_shape.SQUARE}
        <label>{$tfield.orientation == hex_orientation.FLATTOP ? 'Raised Column' : 'Indented Row'}</label>
        <span style={'height: 100%; display: flex; align-items: center;'}>
            <SelectGrid
                options={[
                    {
                        title: 'Even',
                        value: 'even',
                        filename: `${$tfield.orientation == hex_orientation.FLATTOP ? 'raisedcolumn' : 'indentedrow'}even`,
                    },
                    {
                        title: 'Odd',
                        value: 'odd',
                        filename: `${$tfield.orientation == hex_orientation.FLATTOP ? 'raisedcolumn' : 'indentedrow'}odd`,
                    },
                ]}
                bind:value={$tfield.raised}
                on:change={() => {
                    if ($tfield.orientation == hex_orientation.FLATTOP) {
                        comp_terrainLayer.square_updateRaisedColumn();
                    } else {
                        comp_terrainLayer.square_changeIndentedRow();
                    }
                    comp_coordsLayer.cullUnusedCoordinates();
                }}
            />
        </span>
    {/if}

    <label for="hexWidth">Hex Width</label>
    <input
        id="hexWidth"
        type="number"
        min={1}
        bind:value={$tfield.hexWidth}
        on:change={(e) => {
            if (Number.isNaN(e.target.valueAsNumber)) {
                $tfield.hexWidth = $resize_parameters.old_hex_width;
                return;
            }

            redrawEntireMap();
            comp_coordsLayer.updateAllCoordPositions();
            retain_positions();
            save_old_resize_parameters();
            
        }}
    />

    <label for="hexHeight">Hex Height</label>
    <input
        id="hexHeight"
        type="number"
        min={1}
        bind:value={$tfield.hexHeight}
        on:change={(e) => {
            if (Number.isNaN(e.target.valueAsNumber)) {
                $tfield.hexHeight = $resize_parameters.old_hex_height;
                return;
            }
            redrawEntireMap();
            comp_coordsLayer.updateAllCoordPositions();
            retain_positions();
            save_old_resize_parameters();
        }}
    />

    <label for="hex-radius">Size by Radius</label>
    <span>
        <!-- DEPRECATED due to styling and usability issues -->
        <!-- <input id="hex-radius" type="number" /> -->
        <button on:click={() => {

                let currentRadius = get_radius_from_width_height($tfield.hexWidth, $tfield.hexHeight, $tfield.orientation)

                let radius = +prompt("Enter hex radius", currentRadius.toString());
                console.log(radius);
                if (Number.isNaN(radius)|| radius < 1) return;	
                
                let new_dims = get_width_height_from_radius(radius, $tfield.orientation)
                
                $tfield.hexWidth = new_dims.width
                $tfield.hexHeight = new_dims.height
                
                redrawEntireMap();
                
                retain_positions();
                save_old_resize_parameters();

                comp_coordsLayer.updateAllCoordPositions();
            }}>Set</button>
    </span>

    <!--
    <label for="mapShape">Map Type</label>
    <select id="mapShape" bind:value={$tfield.mapShape}>
        <option value={map_shape.SQUARE}>Square</option>
        <option value={map_shape.RADIAL}>Radial</option>
    </select>
    -->

    <label title="Selected objects will attempt to remain in their hex when they are resized">Retain Position<sup id="retain-position-tip" title="Selected objects will attempt to remain in their hex when they are resized">?</sup></label>
    <div id="retain-position-container">
        <div id="retain-position-grid">
            <ImageCheckbox image_filename={ "/assets/img/tools/icon.svg" } title={"Icons"} bind:checked={ retainIconPosition } />
            <ImageCheckbox image_filename={ "/assets/img/tools/path.svg" } title={"Paths"} bind:checked={ retainPathPosition } />
            <ImageCheckbox image_filename={ "/assets/img/tools/text.svg" } title={"Text"} bind:checked={ retainTextPosition } />
        </div>
    </div>
</div>

<style>

    #retain-position-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#retain-position-grid {
		height: 2em;
		display: flex;
		border-radius: var(--small-radius);
		overflow: hidden;
	}

    #retain-position-tip {
        color: var(--hexfriend-green);
    }

</style>