<script lang="ts">
	import type { overlay_data } from "../types/data";


    export let data_overlay: overlay_data;

</script>

<div class="panel">

    <input type="range" min={0.05} max={1} step={0.05} bind:value={data_overlay.opacity} />

</div>

<style>
    .panel {
        padding: 10px;
    }
</style>