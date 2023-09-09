<script lang="ts">

    import { store_has_unsaved_changes } from "../stores/flags";
    
    export let loaded_save;

    function erase_all_icons() {
        if (!confirm("Really erase all icons?")) return;
        loaded_save.icons = [];
        $store_has_unsaved_changes = true;
    }
    
    function erase_all_paths() {
        if (!confirm("Really erase all paths?")) return;
        loaded_save.paths = [];
        $store_has_unsaved_changes = true;
    }
    
    function erase_all_text() {
        if (!confirm("Really erase all text?")) return;
        loaded_save.texts = [];
        $store_has_unsaved_changes = true;

    }

</script>

<div class="panel panel-grid">

    <button class="outline-button" on:click={erase_all_icons} >Erase All Icons</button>
    <button class="outline-button" on:click={erase_all_paths}>Erase All Paths</button>
    <button class="outline-button" on:click={erase_all_text}>Erase All Text</button>

</div>

<style>
    .panel {
        padding: 0.625em;;
    }

    .panel-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 0.25em;
    }

    button {
        width: 100%;
    }
</style>