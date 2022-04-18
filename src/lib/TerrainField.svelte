<script lang="ts">
    import { Graphics, Container } from "svelte-pixi"
    import * as PIXI from 'pixi.js'
    import {cubeToWorld, getHexPath, genHexId, worldToCube, getNeighbours} from '../helpers/hexHelpers'

    import type { TerrainHex } from '../types/terrain'
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

        if (hex.blank) {
            hex.bgColor = tfield.blankHexColor /* Update color here, as it may not be updated. Just have to remember to call render hex when we change the blank hex color */
            terrainGraphics.beginFill(tfield.blankHexColor)
            terrainGraphics.drawPolygon( getHexPath(tfield.hexWidth, tfield.hexHeight, tfield.orientation, hexC.x, hexC.y) )
            terrainGraphics.endFill()

            if (terrainSprites[hexId]) { 
                symbolsContainer.removeChild(terrainSprites[hexId])
                terrainSprites[hexId].destroy();
                delete terrainSprites[hexId];
            }
            
            return
        }

        terrainGraphics.beginFill(hex.bgColor);
        terrainGraphics.drawPolygon( getHexPath(tfield.hexWidth, tfield.hexHeight, tfield.orientation, hexC.x, hexC.y) )
        terrainGraphics.endFill()

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
            tfield.hexes[clickedId].symbol = data_terrain.symbolData ? {...data_terrain.symbolData} : null
            tfield.hexes[clickedId].blank = false

            renderHex(clickedId)

        }
    }

    function paintHex(hexId: string) {
        //data_terrain = data_terrain

        tfield.hexes[hexId].bgColor = data_terrain.bgColor;
        tfield.hexes[hexId].symbol = data_terrain.symbolData ? {...data_terrain.symbolData} : null
        tfield.hexes[hexId].blank = false

        renderHex(hexId)

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
        tfield.hexes[clickedId].blank = true

        renderHex(clickedId)
    }

    function paintbucket() {
        let x = pan.worldX
        let y = pan.worldY
        let clickedCoords = worldToCube(x, y, tfield.orientation, tfield.hexWidth, tfield.hexHeight)

        let clickedId = genHexId( clickedCoords.q, clickedCoords.r, clickedCoords.s ) 

        let baseHex = {...tfield.hexes[clickedId]} // Any neighbours with the same style (same bgColor, symbol and symbolColor) will be changed and their neighbours will be added to the list

        let seenIds = [ genHexId(baseHex.q, baseHex.r, baseHex.s) ] // [id : hex] pairs
        let changedIds = []
        let hexStack = [ clickedId ]
        
        while (hexStack.length > 0) {
            let cHex = tfield.hexes[hexStack.pop()]

            // Color current hex
            paintHex( genHexId(cHex.q, cHex.r, cHex.s) )

            // Add neighbour to hexStack
            let neighbourIds = getNeighbours(cHex.q, cHex.r, cHex.s)
            neighbourIds.forEach(nId => {
                if (seenIds.find(sId => sId == nId)) return
                if (!tfield.hexes[nId]) return

                let nHex = tfield.hexes[nId]
                if (nHex.bgColor != baseHex.bgColor) return
                
                if ( (nHex.symbol && !baseHex.symbol) || (!nHex.symbol && baseHex.symbol) ) return
                if (nHex.symbol && baseHex.symbol) {
                    if (nHex.symbol.texId != baseHex.symbol.texId) return
                    if (nHex.symbol.color != baseHex.symbol.color) return
                }

                seenIds.push(nId)
                hexStack.push(nId)

            })

            changedIds.push( genHexId(cHex.q, cHex.r, cHex.s) )

        }
        

    }

    export function pointerdown() {
        if (data_terrain.usingEyedropper) {

            eyedrop()

        } else if (data_terrain.usingPaintbucket) {
            paintbucket()

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
