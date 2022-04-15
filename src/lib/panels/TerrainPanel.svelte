<script lang="ts">

    import type {Tile} from 'src/types/tilesets'

    import ColorInput from '../ColorInput.svelte'
    import ColorInputPixi from '../ColorInputPixi.svelte'
    import * as PIXI from 'pixi.js'
    import { getHexPath } from '../hexHelpers';

    export let loadedTilesets
    export let data_terrain

    export let tfield
    export let app
    export let L
    
    $: {

        tilePreview = generateTilePreview(data_terrain)
    }
    
    // Used for previews
    let g = new PIXI.Graphics()
    let s = new PIXI.Sprite()
    let c = new PIXI.Container()
    c.addChild(g).addChild(s)

    let tilePreview: string = generateTilePreview( data_terrain );

    function changeTile(t: Tile) {
        data_terrain.bgColor = t.bgColor
        data_terrain.symbolData = t.symbol
        tilePreview = generateTilePreview(data_terrain)
    }

    function findSymbolScale(symbolData) {
        if (tfield.hexWidth < tfield.hexHeight) {
            let s = tfield.hexWidth * symbolData.pHex / 100 / symbolData.texWidth;
            return {
                x: s,
                y: s
            }

        } else {
            let s = tfield.hexHeight * symbolData.pHex / 100 / symbolData.texHeight;
            return {
                x: s,
                y: s
            }
        }
    }

    function generateTilePreview(data_terrain) {

        g.clear()
        g.beginFill(data_terrain.bgColor)
        g.drawPolygon( getHexPath(50, 45, tfield.orientation, 0, 0) )
        g.endFill()

        if (data_terrain.symbolData) {
            s.texture = L.resources[data_terrain.symbolData.texId].texture
            s.tint = data_terrain.symbolData.color
            s.scale = findSymbolScale(data_terrain.symbolData) 
            s.anchor.set(0.5)
            
        } else {
            s.texture = null
        }

        let b64 = app.renderer.plugins.extract.base64(c) //PIXI.autoDetectRenderer().plugins.extract.base64(c)

        return b64

    }

</script>

<div class="panel">
    <div id="terrain-preview">
        <div id="preview-image-centerer">
            <img src={tilePreview} alt={"Current Tile Preview"}>
        </div>
        
        <div style="width: 25px; height: 25px">
            <ColorInputPixi bind:value={data_terrain.bgColor} />
        </div>

        {#if data_terrain.symbolData}
            <div style="width: 25px; height: 25px">
                <ColorInputPixi bind:value={data_terrain.symbolData.color} />
            </div>
        {/if}

        <button on:click={() => {data_terrain.usingEyedropper = !data_terrain.usingEyedropper}} style={data_terrain.usingEyedropper ? "border-color: red" : ""}> Eyedropper </button>

    </div>

    <div id="buttons">

        {#each Object.keys(loadedTilesets) as tilesetName}
            {#each loadedTilesets[tilesetName] as tile (tile.id)}
                <button on:click={ () => changeTile(tile) }>{tile.display}</button>
            {/each}
        {/each}

    </div>

</div>

<style>
    
    #terrain-preview {
        display: grid;
        grid-template-columns: 60px 1fr;
        grid-template-rows: 30px 30px;
        column-gap: 5px;
        padding: 10px;
        background-color: #333333;
    }
    
    #buttons {
        background-color: #555555;
        padding: 10px;
    }

    #preview-image-centerer {
        grid-row: 1/3;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #terrain-preview img {
        width: 60px;
    }

    

</style>

