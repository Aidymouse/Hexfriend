<script lang="ts">
    import Checkbox from "../components/Checkbox.svelte";
    import OverlayLayer from "../layers/OverlayLayer.svelte";
    import { store_selected_tool } from "../stores/tools";

    import { store_has_unsaved_changes } from "../stores/flags";
    import { loading_texture } from "../stores"
    import { tl } from "../stores/translation";

    import type { OverlayData } from "../types/data";
    import { Tools } from "../types/toolData";

    import { data_overlay } from "../stores/data";
    import { completeUndoState, startUndoState } from "../lib"

    export let comp_overlayLayer: OverlayLayer
    export let loaded_base64: string | null

    function remove_overlay() {
        if (confirm($tl.overlay_panel.remove_confirmation)) {
	    startUndoState({overlay_base64: loaded_base64}, "Remove Overlay")
            comp_overlayLayer.panelControl_changeOverlayImage(null)
            store_selected_tool.update((n) => Tools.TERRAIN);
            $store_has_unsaved_changes = true;
	    // don't need to await changeOverlayImage since changing to null doesn't do anything async
	    completeUndoState({overlay_base64: loaded_base64})
        }
    }

    let old_opacity: number | null = null

    function resetScale() {
	startUndoState({overlay: $data_overlay}, "Reset Overlay Scale")
        $data_overlay.scale.x = 1;
        $data_overlay.scale.y = 1;
        $store_has_unsaved_changes = true;
	completeUndoState({overlay: $data_overlay})
    }

    function resetPosition() {
	startUndoState({overlay: $data_overlay}, "Reset Overlay Position")
        $data_overlay.x = 0;
        $data_overlay.y = 0;
        $store_has_unsaved_changes = true;
	completeUndoState({overlay: $data_overlay})
    }
</script>

<div class="panel panel-grid">
    {#if $loading_texture}
      <p>Loading...</p>
    {:else}
      <label for="ov_shown">{$tl.overlay_panel.show}</label>
      <Checkbox id={"ov_shown"} bind:checked={$data_overlay.shown} />

      <label for="ov_opacity">{$tl.overlay_panel.opacity}</label><input
	  id="ov_opacity"
	  type="range"
	  min={0.05}
	  max={1}
	  step={0.05}
	  value={$data_overlay.opacity}
	  on:input={e => {
	    if (old_opacity === null) { old_opacity = $data_overlay.opacity }
	    $data_overlay.opacity = e.target.valueAsNumber
	  }}
	  on:change={e => {
	    if (e.target.valueAsNumber !== old_opacity) {
	      startUndoState({overlay: {...$data_overlay, opacity: old_opacity}}, "Change overlay opacity")
	      $data_overlay.opacity = e.target.valueAsNumber
	      completeUndoState({overlay: $data_overlay})
	    }
	    old_opacity=null
	  }}
      />
      <span class="col-span">
	  <button class="outline-button" on:click={resetScale}>
	      {$tl.overlay_panel.reset_scale}
	  </button>
      </span>
      <span class="col-span">
	  <button class="outline-button" on:click={resetPosition}>
	      {$tl.overlay_panel.reset_position}
	  </button>
      </span>
      <span class="col-span">
	  <button class="evil" on:click={remove_overlay}>
	      {$tl.overlay_panel.remove}
	  </button>
      </span>
    {/if}
</div>

<style>
    .panel {
        padding: 0.625em;
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

