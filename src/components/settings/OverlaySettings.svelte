<script lang="ts">

    import "../../styles/settings.css";
    import OverlayLayer from '../../layers/OverlayLayer.svelte'

    import { Tools } from "../../types/toolData";

    import { data_overlay } from "../../stores/data";
    import { store_selected_tool } from "../../stores/tools";
    import { store_has_unsaved_changes } from "../../stores/flags";
    import { tl } from "../../stores/translation";

    import { startUndoState, completeUndoState } from "../../lib" 

    export let showSettings;
    export let comp_overlayLayer: OverlayLayer;
    export let loaded_base64: string | null;

    let overlay_files: FileList;

    function import_overlay_image() {
	if (!overlay_files[0]) return;

	let r = new FileReader();
	r.readAsDataURL(overlay_files[0]);
	r.onload = (eb) => {
	    let b64 = r.result as string;

	    const old_loaded = structuredClone(loaded_base64)
	    const old_overlay = structuredClone($data_overlay)

	    comp_overlayLayer.changeOverlayImage(b64, () => { 
	      console.log("loaded yeehaw" )
	      startUndoState({overlay_base64: old_loaded, overlay: old_overlay}, "Import Overlay Image")
	      completeUndoState({overlay_base64: b64, overlay: $data_overlay})
	    }); // loads base64 into loadedSave

	    $data_overlay.scale.x = 1;
	    $data_overlay.scale.y = 1;

	    showSettings = false;

	    store_selected_tool.update((n) => Tools.OVERLAY);

	    $store_has_unsaved_changes = true;
	};
    }


</script>

<div class="settings-grid" style={'justify-items: start;'}>
    <button class="file-input-button" style="width: 100%; grid-column: 1/3; min-height: 30px;" >
	{#if loaded_base64 === null}
	    {$tl.settings.overlay.load}
	{:else}
	    {$tl.settings.overlay.replace}
	{/if}
        <input
            type="file"
            accept="image/*"
            bind:files={overlay_files}
            on:change={() => {
                import_overlay_image();
            }}
        />
    </button>
</div>
