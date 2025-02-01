<script lang="ts">
    import { store_has_unsaved_changes } from "../stores/flags";
    import { tl } from "../stores/translation";

    export let loaded_save;

    function erase_all_icons() {
        if (!confirm($tl.eraser_panel.erase_icons_confirmation)) return;
        loaded_save.icons = [];
        $store_has_unsaved_changes = true;
    }

    function erase_all_paths() {
        if (!confirm($tl.eraser_panel.erase_paths_confirmation)) return;
        loaded_save.paths = [];
        $store_has_unsaved_changes = true;
    }

    function erase_all_text() {
        if (!confirm($tl.eraser_panel.erase_text_confirmation)) return;
        loaded_save.texts = [];
        $store_has_unsaved_changes = true;
    }
</script>

<div class="panel panel-grid">
    <button class="outline-button" on:click={erase_all_icons}
        >{$tl.eraser_panel.erase_all_icons}</button
    >
    <button class="outline-button" on:click={erase_all_paths}
        >{$tl.eraser_panel.erase_all_paths}</button
    >
    <button class="outline-button" on:click={erase_all_text}
        >{$tl.eraser_panel.erase_all_text}</button
    >
</div>

<style>
    .panel {
        padding: 0.625em;
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

