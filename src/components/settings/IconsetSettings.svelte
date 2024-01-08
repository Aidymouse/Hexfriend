<script lang="ts">
        
    import "../../styles/settings.css";
    
	import { LATESTDEFAULTICONSVERSION } from '../../types/savedata';

    import { store_has_unsaved_changes } from "../../stores/flags";
    
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
				alert("You've already imported this icon set :)");
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
        <div
            class="loaded-tileset"
            on:click={() => {
                console.log(iconset);
            }}
        >
            {iconset.name}

            {#if iconset.id.split(":")[0] != 'default' && iconset.version != LATESTDEFAULTICONSVERSION}
                <button
                    on:click={() => {
                        removeIconset(iconset.id);
                    }}
                >
                    <img src="/assets/img/tools/trash.png" alt={'Trash'} title={'Remove Iconset'} />
                </button>
            {/if}
        </div>
    {/each}

    <span>
        <button class="file-input-button"
            >Import {iconset_text}
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
            }}>{iconset_text} Builder</button
        >
    </span>
</div>

<style>

    #iconsets {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 30px;
		grid-auto-rows: 30px;
		row-gap: 5px;
        margin-top: var(--large-radius);
	}

	

	#iconsets span {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 5px;
	}

</style>