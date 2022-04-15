<script lang="ts">
    import { Graphics, Container } from "svelte-pixi"
    import * as PIXI from 'pixi.js'
    import {cubeToWorld, getHexPath, genHexId, worldToCube} from './hexHelpers'

    import type {TerrainHex} from '../types/terrain'
    import type { Tile } from "src/types/tilesets"

    let terrainGraphics = new PIXI.Graphics()
    let symbolsContainer = new PIXI.Container()
    let gridGraphics = new PIXI.Graphics()

    let terrainSprites = {}

    export let pan
    export let controls
    export let L
    export let tfield
    
    export let data_terrain


    /* TERRAINFIELD METHODS */
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

    function renderGrid() {
        gridGraphics.clear();
        gridGraphics.lineStyle(tfield.grid.thickness, tfield.grid.stroke)

        Object.keys(tfield.hexes).forEach(hexId => {
            let hex = tfield.hexes[hexId]
            let hexC = cubeToWorld(hex.q, hex.r, hex.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight);

            gridGraphics.drawPolygon( getHexPath(tfield.hexWidth, tfield.hexHeight, tfield.orientation, hexC.x, hexC.y) )
        });
    }

    export function renderAllHexes() {
        terrainGraphics.clear();
        Object.keys(tfield.hexes).forEach(hexId => {
            renderHex(hexId)
        });
        renderGrid();
    }

    function renderHex(hexId) {
        let hex = tfield.hexes[hexId]
        let hexC = cubeToWorld(hex.q, hex.r, hex.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight);

        terrainGraphics.beginFill(hex.bgColor);
        terrainGraphics.drawPolygon( getHexPath(tfield.hexWidth, tfield.hexHeight, tfield.orientation, hexC.x, hexC.y) )
        terrainGraphics.endFill();

        if (hex.symbol) {
        
        // Optimize here - only update icon if it needs updating

            if (terrainSprites[hexId]) {
                symbolsContainer.removeChild(terrainSprites[hexId])
                terrainSprites[hexId].destroy();
                delete terrainSprites[hexId];
            }

            let ns = new PIXI.Sprite()
            ns.texture = L.resources[hex.symbol.texId].texture
            let hc = cubeToWorld(hex.q, hex.r, hex.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight)
            ns.position.set(hc.x, hc.y)
            ns.anchor.set(0.5)
            ns.tint = hex.symbol.color
            ns.scale = findSymbolScale(hex.symbol) 

            symbolsContainer.addChild(ns);

            terrainSprites[hexId] = ns;
  
            
        } else {
            if (terrainSprites[hexId]) { 
                symbolsContainer.removeChild(terrainSprites[hexId])
                terrainSprites[hexId].destroy();
                delete terrainSprites[hexId];
            }
        
        }

    }

    export function placeTerrain() {
        data_terrain = data_terrain
        // Needs checking if terrain matches what we're trying to place already
        if (controls.mouseDown[0]) {
            let x = pan.worldX
            let y = pan.worldY
            let clickedCoords = worldToCube(x, y, tfield.orientation, tfield.hexWidth, tfield.hexHeight)

            let clickedId = genHexId( clickedCoords.q, clickedCoords.r, clickedCoords.s )

            //if (!hexExists(clickedId)) return;

            tfield.hexes[clickedId].bgColor = data_terrain.bgColor;
            tfield.hexes[clickedId].symbol = data_terrain.symbolData ? {...data_terrain.symbolData} : null;

            renderHex(clickedId)

        }
    }

    function eyedrop() {
        if (controls.mouseDown[0]) {
            let x = pan.worldX
            let y = pan.worldY
            let clickedCoords = worldToCube(x, y, tfield.orientation, tfield.hexWidth, tfield.hexHeight)

            let clickedId = genHexId( clickedCoords.q, clickedCoords.r, clickedCoords.s )

            //if (!hexExists(clickedId)) return;

            let cHex = tfield.hexes[clickedId]

            data_terrain.bgColor = cHex.bgColor
            data_terrain.symbolData = cHex.symbol ? {...cHex.symbol} : null

            data_terrain.usingEyedropper = false

        }
    }

    export function erase() {
        let clickedCoords = worldToCube(pan.worldX, pan.worldY, tfield.orientation, tfield.hexWidth, tfield.hexHeight)

        let clickedId = genHexId( clickedCoords.q, clickedCoords.r, clickedCoords.s )

        tfield.hexes[clickedId].bgColor = tfield.blankHexColor
        tfield.hexes[clickedId].symbol = null

        renderHex(clickedId)
    }

    export function pointerdown() {
        if (data_terrain.usingEyedropper) {

            eyedrop()

        } else {
            placeTerrain()
        }

    }

    renderAllHexes()
    renderGrid()

</script>


<Graphics instance={terrainGraphics} draw={g=>{ /* too slow to draw here! we have to hanndle it manually. See the render methods */ }}/>
<Container instance = {symbolsContainer} />

{#if tfield.grid.shown}
    <Graphics instance={gridGraphics} draw={g=>{ /* too slow to draw here! we have to hanndle it manually. See the render methods */ }}/>
{/if}
