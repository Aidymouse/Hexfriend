<script lang="ts">
	import Checkbox from "../components/Checkbox.svelte";
    import { store_selected_tool } from "../stores/tools";
    
    import { store_has_unsaved_changes } from '../stores/flags';

    import type { overlay_data } from "../types/data";
	import { tools } from "../types/toolData";

    import { data_overlay } from '../stores/data'

    function remove_overlay() {
        
        if (confirm("Remove overlay?")) {
            $data_overlay.base64 = ""
            store_selected_tool.update(n => tools.TERRAIN)
            $store_has_unsaved_changes = true
        }

    }

    function reset_scale() {
        $data_overlay.scale.x = 1
        $data_overlay.scale.y = 1
        $store_has_unsaved_changes = true;
    }

    function reset_positon() {
        $data_overlay.x = 0
        $data_overlay.y = 0
        $store_has_unsaved_changes = true;
    }

</script>

<div class="panel panel-grid">

    <label for="ov_shown">Show</label><Checkbox id={"ov_shown"} bind:checked={$data_overlay.shown} />
    <label for="ov_opacity">Opacity</label><input id="ov_opacity" type="range" min={0.05} max={1} step={0.05} bind:value={$data_overlay.opacity} />
    <span class="col-span"><button class="outline-button" on:click={reset_scale}>Reset Scale</button></span>
    <span class="col-span"><button class="outline-button" on:click={reset_positon}>Reset Position</button></span>
    <span class="col-span"><button class="evil" on:click={remove_overlay}>Remove Overlay</button></span>

</div>

<style>
    .panel {
        padding: 0.625em;;
    }

    .panel-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 0.25em;
    }

    label {
        display: flex;
        align-items: center;
    }

    span.col-span {
        grid-column: 1/3;
    }

    span.col-span button {
        width: 100%;
    }
</style>