<script lang="ts">

    import * as PIXI from 'pixi.js'
    import ColorInputPixi from '../../components/ColorInputPixi.svelte'
    
    import type { icon_data } from 'src/types/data';
    import type { icon_set_data } from '../../types/icon'

    export let loadedIconsets
    export let L
    export let app

    export let data_icon: icon_data
    
    let selectedData = loadedIconsets['default'][0];

    let iconPreview = "";
    $: {
        iconPreview = getIconPreview(data_icon)
    }

    function selectIcon(iconData: icon_set_data) {
        selectedData = iconData

        data_icon.texId = iconData.texId
        data_icon.color = iconData.color
        data_icon.pHex = iconData.pHex
    }

    let s = new PIXI.Sprite()

    function getIconPreview(iconData) {
        s.texture = L.resources[iconData.texId].texture
        s.tint = iconData.color
        
        let b64 = app.renderer.plugins.extract.base64(s) //PIXI.autoDetectRenderer().plugins.extract.base64(c)

        return b64
    }

    function selectedIconMatchesData(icon: icon_set_data): boolean {
        if (data_icon.color != icon.color) return false
        if (data_icon.texId != icon.texId) return false
        return true
    }

</script>

<div class="panel">
    <div id="icon-preview">
    
        <img src={iconPreview} alt={"Icon Preview"}>
        <ColorInputPixi bind:value={data_icon.color} />
        <div>  <input type="checkbox" bind:checked={data_icon.snapToHex}> Snap to Hex </div>
    
    </div>

    <div id="buttons">
        {#each Object.keys(loadedIconsets) as setName}
            {#each loadedIconsets[setName] as iconData}
                <button class:selected={iconData == selectedData} on:click={() => {selectIcon(iconData)}} >{iconData.display}</button>
            {/each}
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
</style>