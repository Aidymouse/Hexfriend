<script lang="ts">
        
    import "../../styles/settings.css";
    
    import { LATESTDEFAULTICONSVERSION } from '../../types/savedata';
    import { type Iconset } from "../../types/icon";

    import { store_has_unsaved_changes } from "../../stores/flags";
    import { tl } from "../../stores/translation";
    
    import * as texture_loader from '../../lib/texture_loader';

    export let loadedSave;
    export let loadedIconsets;
    export let iconset_text;

    export let appState;

    function removeIconset(setId: string) {
		loadedIconsets = loadedIconsets.filter((is: Iconset) => is.id != setId);
		loadedSave.iconsets = loadedIconsets;

		$store_has_unsaved_changes = true;
	}

	let iconsetFiles: FileList;

	function importIconset() {
		let importFile = iconsetFiles[0];

		if (!importFile) return;

		let r = new FileReader();
		r.readAsText(importFile);
		r.onload = (eb) => {
		    /* Read the file */
		    let setToImport = JSON.parse(eb.target.result as string);

		    /* Check that set hasn't already been imported */
		    if (loadedIconsets.find((is: Iconset) => is.id == setToImport.id) != null) {
			alert($tl.settings.icon_sets.already_loaded);
			return;
		    }

		    loadedIconsets.push(setToImport);
		    loadedIconsets = loadedIconsets;

		    /* We also have to load all of these textures */
		    //addIconsetTextures(setToImport, L);
		    texture_loader.load_iconset_textures(setToImport);

		    $store_has_unsaved_changes = true;
		};
	}

</script>


<div id="iconsets">
    {#each loadedIconsets as iconset (iconset.id)}
        <div class="loaded-tileset">{iconset.name}

            {#if iconset.id.split(":")[0] != 'default' && iconset.version != LATESTDEFAULTICONSVERSION}
                <button on:click={() => { removeIconset(iconset.id); }}>
                    <img src="/assets/img/tools/trash.png" alt={'Trash'} title={'Remove Iconset'} />
                </button>
            {/if}
        </div>
    {/each}

    <span>
	<button class="file-input-button">{$tl.settings.icon_sets.import}
            <input
                type="file"
                accept=".hfis"
                bind:files={iconsetFiles}
                on:change={() => {
                    importIconset();
                }}
            /></button
        >
        <button
            on:click={() => {
                appState = 'iconsetCreator';
	    }}>{$tl.settings.icon_sets.builder}</button
        >
    </span>
</div>

<style>
    button {
	min-height: 30px;
    }

    #iconsets {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 30px;
	grid-auto-rows: auto;
	row-gap: 5px;
	margin-top: var(--large-radius);
    }

    

    #iconsets span {
	display: grid;
	grid-template-columns: 1fr 1fr;
	column-gap: 5px;
    }

</style>
