<script lang="ts">

    import type {Tile} from 'src/types/tilesets'

    import ColorInputPixi from '../../components/ColorInputPixi.svelte'
    import * as PIXI from 'pixi.js'
    import { getHexPath } from '../../helpers/hexHelpers';
import { TextStyle } from 'pixi.js';

    export let loadedTilesets
    export let data_terrain

    export let tfield
    export let app
    export let L
    
    $: {
        tilePreview = generateTilePreview(data_terrain)
        loadedTilesets = loadedTilesets
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
        data_terrain.usingPaintbucket = false
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

    function styleMatchesData(tile: Tile): boolean {
        
        if (data_terrain.bgColor != tile.bgColor) return false
        if (!tile.symbol && data_terrain.symbolData) return false
        if (tile.symbol && !data_terrain.symbolData) return false

        if (tile.symbol && data_terrain.symbolData) {
            if (tile.symbol.color != data_terrain.symbolData.color) return false
            if (tile.symbol.texId != data_terrain.symbolData.texId) return false
        }

        return true
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

        <button id="eyedropper" title={"Hex Eyedropper"} on:click={() => {data_terrain.usingEyedropper = !data_terrain.usingEyedropper}} class:selected={data_terrain.usingEyedropper} > <img src="public/assets/img/tools/eyedropper.png" alt={"Eyedropper"}> </button>
        <button id="paintbucket" title={"Hex Paintbucket"} on:click={() => {data_terrain.usingPaintbucket = !data_terrain.usingPaintbucket}} class:selected={data_terrain.usingPaintbucket} > <img src="public/assets/img/tools/paintbucket.png" alt={"Paint Bucket"}> </button>

    </div>

    <div id="buttons">

        {#each Object.keys(loadedTilesets) as tilesetName} 
            {#each loadedTilesets[tilesetName] as tile (tile.id)}
                <button title={tile.display} on:click={ () => changeTile(tile) } class:selected={ styleMatchesData(tile) } ><img src={tile.preview} alt={tile.display}  ></button>
            {/each}
        {/each}

    </div>

</div>

<style>
    
    #eyedropper {
        position: absolute;
        width: 25px;
        height: 25px;
        right: 10px;
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
    }

    #eyedropper img {
        width: 80% !important;
    }

    #paintbucket {
        position: absolute;
        width: 25px;
        height: 25px;
        right: 10px;
        top: 45px;
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
    }

    #paintbucket img {
        width: 80% !important;
    }

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

        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        grid-template-rows: 50px;
        grid-auto-rows: 50px;
        gap: 5px;
    }

    #buttons button {
        box-sizing: border-box;
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #buttons button img {
        width: 90%;
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

    .selected {
        outline-style: solid;
        outline-color: #8cc63f;
        outline-width: 1px;
        border-color: #8cc63f;
    }
    

</style>

