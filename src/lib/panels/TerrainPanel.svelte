<script lang="ts">

    import type {Tile} from 'src/types/tilesets'
    import type {terrain_data} from 'src/types/data'
    import type { TerrainHexField } from 'src/types/terrain';

    import ColorInputPixi from '../../components/ColorInputPixi.svelte'
    import * as PIXI from 'pixi.js'
    import { getHexPath } from '../../helpers/hexHelpers';

    export let loadedTilesets
    export let data_terrain: terrain_data

    export let tfield: TerrainHexField
    export let app: PIXI.Application
    export let L: PIXI.Loader
    
    $: {
        tilePreview = generateTilePreview(data_terrain)
        loadedTilesets = loadedTilesets

        tfield.orientation = tfield.orientation
    }
    
    // Used for previews
    let g = new PIXI.Graphics()
    let s = new PIXI.Sprite()
    let c = new PIXI.Container()
    c.addChild(g).addChild(s)

    let tilePreview: string = generateTilePreview( data_terrain );

    function changeTile(t: Tile) {
        data_terrain.bgColor = t.bgColor
        data_terrain.symbol = t.symbol ? {...t.symbol} : null
        tilePreview = generateTilePreview(data_terrain)
        data_terrain.usingPaintbucket = false
        data_terrain.usingEraser = false
    }

    function findSymbolScale(symbol) {
        if (tfield.hexWidth < tfield.hexHeight) {
            let s = tfield.hexWidth * symbol.pHex / 100 / symbol.texWidth;
            return {
                x: s,
                y: s
            }

        } else {
            let s = tfield.hexHeight * symbol.pHex / 100 / symbol.texHeight;
            return {
                x: s,
                y: s
            }
        }
    }

    function generateTilePreview(data_terrain: terrain_data) {

        g.clear()
        g.beginFill(data_terrain.bgColor)

        let hW = 50
        let hH = 45

        if (tfield.orientation == "pointyTop") {
            hW = 45
            hH = 50
        }


        g.drawPolygon( getHexPath(hW, hH, tfield.orientation, 0, 0) )
        g.endFill()

        if (data_terrain.symbol) {
            s.texture = L.resources[data_terrain.symbol.texId].texture
            s.tint = data_terrain.symbol.color
            s.scale = findSymbolScale(data_terrain.symbol) 
            s.anchor.set(0.5)
            
        } else {
            s.texture = null
        }

        let b64 = app.renderer.plugins.extract.base64(c) //PIXI.autoDetectRenderer().plugins.extract.base64(c)

        return b64

    }

    function styleMatchesData(tile: Tile): boolean {
        
        if (data_terrain.usingEraser) return false

        if (data_terrain.bgColor != tile.bgColor) return false
        if (!tile.symbol && data_terrain.symbol) return false
        if (tile.symbol && !data_terrain.symbol) return false

        if (tile.symbol && data_terrain.symbol) {
            if (tile.symbol.color != data_terrain.symbol.color) return false
            if (tile.symbol.texId != data_terrain.symbol.texId) return false
        }

        return true
    }

</script>

<div class="panel">

    <div id="terrain-preview">
        <div id="preview-image-centerer" >
            <img src={tilePreview} alt={"Current Tile Preview"} class:flatTop={tfield.orientation == "flatTop"} class:pointyTop={tfield.orientation == "pointyTop"}>
        </div>
        
        <ColorInputPixi bind:value={data_terrain.bgColor} name={"terrainColor"} label={"Terrain Color"}/>
        
        {#if data_terrain.symbol}

            <ColorInputPixi bind:value={data_terrain.symbol.color} name={"symbolColor"} label={"Symbol Color"} />

        {/if}

        <button id="eyedropper" class="small-panel-button" title={"Hex Eyedropper"} on:click={() => {data_terrain.usingEyedropper = !data_terrain.usingEyedropper}} class:selected={data_terrain.usingEyedropper} > <img src="/assets/img/tools/eyedropper.png" alt={"Eyedropper"}> </button>
        <button id="paintbucket" class="small-panel-button" title={"Hex Paintbucket"} on:click={() => {data_terrain.usingPaintbucket = !data_terrain.usingPaintbucket}} class:selected={data_terrain.usingPaintbucket} > <img src="/assets/img/tools/paintbucket.png" alt={"Paint Bucket"}> </button>
        <button id="eraser" class="small-panel-button" title={"Hex Eraser"} on:click={() => {data_terrain.usingEraser = !data_terrain.usingEraser}} class:selected={data_terrain.usingEraser} > <img src="/assets/img/tools/eraser.png" alt={"Eraser"}> </button>
    
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
    
    .small-panel-button {
        position: absolute;
        width: 25px;
        height: 25px;
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;

    }

    .small-panel-button img {
        width: 80% !important;

    }

    #eyedropper {
        right: 10px;
    }


    #paintbucket {
        right: 10px;
        top: 45px;
    }

    #eraser {
        right: 45px;

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

    #terrain-preview img.flatTop {
        width: 60px;
    }

    #terrain-preview img.pointyTop {
        height: 60px;
    }

    .selected {
        outline-style: solid;
        outline-color: #8cc63f;
        outline-width: 1px;
        border-color: #8cc63f;
    }
    

</style>

