<script lang="ts">

    import * as PIXI from 'pixi.js'
    import ColorInputPixi from '../../components/ColorInputPixi.svelte'
    import Checkbox from '../../components/Checkbox.svelte';
    
    import type { icon_data} from 'src/types/data';
    import type { Icon, Iconset } from '../../types/icon'
import IconsetCreator from '../IconsetCreator.svelte';


    export let loadedIconsets: Iconset[]
    export let L
    export let app

    export let data_icon: icon_data
    
    let selectedData = loadedIconsets[0].icons[0];

    let iconPreview = "";
    $: {
        iconPreview = getIconPreview(data_icon)
        loadedIconsets = loadedIconsets
    }

    function selectIcon(iconData: Icon) {
        selectedData = iconData

        data_icon.texId = iconData.texId
        data_icon.color = iconData.color
        data_icon.pHex = iconData.pHex

        data_icon.usingEraser = false
    }

    let s = new PIXI.Sprite()

    function getIconPreview(iconData: icon_data): string {
        s.texture = L.resources[iconData.texId].texture
        s.tint = iconData.color
        
        let b64 = app.renderer.plugins.extract.base64(s) //PIXI.autoDetectRenderer().plugins.extract.base64(c)

        return b64
    }

    function iconMatchesData(icon: Icon): boolean {
        if (data_icon.color != icon.color) return false
        if (data_icon.texId != icon.texId) return false
        return true
    }

</script>

<div class="panel">
    <div id="icon-preview">
    
        <img src={iconPreview} alt={"Icon Preview"}>

        <ColorInputPixi bind:value={data_icon.color} w={25} h={25} label={"Icon Color"} name={"iconPanelColor"} />

        <Checkbox name={"cb_snapIcon"} label="Snap To Hex Center" bind:checked = {data_icon.snapToHex} />

        <button id="eraser" title={"Icon Eraser"} on:click={() => {data_icon.usingEraser = !data_icon.usingEraser}} class:selected={data_icon.usingEraser} > <img src="/assets/img/tools/eraser.png" alt={"Eyedropper"}> </button>

    </div>
    

    <div id="buttons">
        {#each loadedIconsets as iconset (iconset.id)}

            {#if iconset.id != "default"}
                <h2>{iconset.name}</h2>
            {/if}

            <div class="button-grid">
                {#each iconset.icons as iconData}
                    <button class:selected={ iconMatchesData(iconData) } on:click={() => {selectIcon(iconData)}} title={iconData.display}> <img src={iconData.preview} alt={iconData.display}> </button>
                {/each}
            </div>
        {/each}
    </div>

</div>

<style>
    img {
        height: 60px;
        grid-row: 1/3;
    }

    div {
        color: white;
    }

    .selected {
        outline-style: solid;
        outline-width: 1px;
        outline-color: #8cc63f;
        border-color: #8cc63f;
    }

    #icon-preview {
        display: grid;
        grid-template-rows: 30px 30px;
        grid-template-columns: 60px 1fr;
        column-gap: 5px;
        background-color: #333333;
        padding: 10px;
    }
    
    #buttons {
        background-color: #555555;
        padding: 10px;
        

    }

    .button-grid {
        display: grid;
        grid-template-columns: repeat(5, 51px);
        grid-template-rows: 51px;
        grid-auto-rows: 51px;
        gap: 5px;
    }

    #buttons h2 {
        border-color: #333333;
        margin-bottom: 5px;
        margin-top: 10px;
    }

    #buttons button {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    button img {
        width: 90%;
        height: auto;
    }

    #eraser {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 25px;
        height: 25px;
        padding: 2px;
    }

    #eraser img {
        width: 100%;
        height: 100%;
        margin: 0;
    }


</style>