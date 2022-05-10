<script lang="ts">
    import { Graphics, Container } from "svelte-pixi"
    import * as PIXI from 'pixi.js'
    import {coords_cubeToWorld, getHexPath, genHexId, coords_worldToCube, getNeighbours, coords_cubeToEvenq, coords_evenqToCube, coords_evenrToCube} from '../helpers/hexHelpers'

    import { onMount } from "svelte";

    let terrainGraphics = new PIXI.Graphics()
    let symbolsContainer = new PIXI.Container()
    let gridGraphics = new PIXI.Graphics()

    let terrainSprites = {}

    export let pan
    export let controls
    export let L
    export let tfield
    
    export let data_terrain


    
    export function square_expandMapDimension(direction: "left" | "right" | "top" | "bottom", amount: number) {
        
        if (direction == "right" || direction=="left") {
            // Just add new blank hexes
            if (direction == "right") console.log("Add Right")
            if (direction == "left") console.log("Add Left")

            for (let i=0; i<amount; i++){

                for (let row=0; row<tfield.rows; row++) {
                    
                    let genCoords = tfield.orientation == "flatTop" ? coords_evenqToCube(tfield.columns, row) : coords_evenrToCube(tfield.columns, row)
                    let q = genCoords.q
                    let r = genCoords.r
                    let s = genCoords.s
                    
                    tfield.hexes[genHexId(q, r, s)] = { q: q, r: r, s: s, bgColor: 0xf2f2f2, symbolId: null, symbol: null, blank: true }
                    
                    if (direction == "right") renderHex(genHexId(q, r, s))
                    
                }
                
                if (direction == "left") {
                    // Move all hexes one to the right
    
                    for (let col = tfield.columns-1; col >= 0; col--) {
                        for (let row=0; row < tfield.rows; row++) {
    
                            
                            let cHexCoords = tfield.orientation == "flatTop" ? coords_evenqToCube(col, row) : coords_evenrToCube(col, row)
                            let cHex = tfield.hexes[genHexId(cHexCoords.q, cHexCoords.r, cHexCoords.s)]
                            
                            let rightHexCoords = tfield.orientation == "flatTop" ? coords_evenqToCube(col+1, row) : coords_evenrToCube(col+1, row)
                            let rightId = genHexId(rightHexCoords.q, rightHexCoords.r, rightHexCoords.s)
    
                            tfield.hexes[rightId].bgColor = cHex.bgColor
                            tfield.hexes[rightId].blank = cHex.blank
                            tfield.hexes[rightId].symbol = cHex.symbol ? {...cHex.symbol} : null
                            
                            if (col == 0) {
                                tfield.hexes[genHexId(cHexCoords.q, cHexCoords.r, cHexCoords.s)].blank = true
                            }
    
    
                        }
                    }
    
                    if (tfield.orientation == "flatTop") {
    
                        if (tfield.raised == "odd") {
                            tfield.raised = "even"
                            pan.offsetY -= (tfield.hexHeight * 0.5 ) * pan.zoomScale
                        } else {
                            tfield.raised = "odd" // Might use this, aids the illusion of adding to the left
                            pan.offsetY += (tfield.hexHeight * 0.5 ) * pan.zoomScale
                        }
        
                        pan.offsetX -= (tfield.hexWidth * 0.75) * pan.zoomScale
                    
                    } else {
                        pan.offsetX -= (tfield.hexWidth) * pan.zoomScale
                    }
    
                    renderAllHexes()
                    
                    // Now update the map position to make it seemless
                    //pan.offsetX -= tfield.hexWidth
                }

            }
            
            tfield.columns += amount
            renderGrid()

        } else if (direction == "bottom" || direction == "top") {

            for (let col=0; col<tfield.columns; col++) {
                
                let genCoords = tfield.orientation == "flatTop" ? coords_evenqToCube(col, tfield.rows) : coords_evenrToCube(col, tfield.rows)
                let q = genCoords.q
                let r = genCoords.r
                let s = genCoords.s
                
                tfield.hexes[genHexId(q, r, s)] = { q: q, r: r, s: s, bgColor: 0xf2f2f2, symbolId: null, symbol: null, blank: true }
                
                renderHex(genHexId(q, r, s))
                
            }

            if (direction == "top") {
                // Move all hexes one down

                for (let col = 0; col < tfield.columns; col++) {
                    for (let row=tfield.rows-1; row >= 0; row--) {
                        
                        let cHexCoords = tfield.orientation == "flatTop" ? coords_evenqToCube(col, row) : coords_evenrToCube(col, row)
                        let cHex = tfield.hexes[genHexId(cHexCoords.q, cHexCoords.r, cHexCoords.s)]
                        
                        let downHexCoords = tfield.orientation == "flatTop" ? coords_evenqToCube(col, row+1) : coords_evenrToCube(col, row+1)
                        let downId = genHexId(downHexCoords.q, downHexCoords.r, downHexCoords.s)

                        tfield.hexes[downId].bgColor = cHex.bgColor
                        tfield.hexes[downId].blank = cHex.blank
                        tfield.hexes[downId].symbol = cHex.symbol ? {...cHex.symbol} : null
                        
                        if (row == 0) {
                            tfield.hexes[genHexId(cHexCoords.q, cHexCoords.r, cHexCoords.s)].blank = true
                        }


                    }
                }


                if (tfield.orientation == "flatTop") {
                    pan.offsetY -= (tfield.hexHeight) * pan.zoomScale

                } else { 

                    if (tfield.raised == "odd") {
                        tfield.raised = "even"
                        pan.offsetX -= (tfield.hexWidth * 0.5 ) * pan.zoomScale
                    } else {
                        tfield.raised = "odd" // Might use this, aids the illusion of adding to the left
                        pan.offsetX += (tfield.hexWidth * 0.5 ) * pan.zoomScale
                    }
    
                    pan.offsetY -= (tfield.hexHeight * 0.75) * pan.zoomScale
                }


                renderAllHexes()
                
                // Now update the map position to make it seemless
                //pan.offsetX -= tfield.hexWidth
            }

            renderGrid()
            tfield.rows += 1

        }

    }

    export function changeOrientation() {
        // set up new array with new hexes

        // erase all hex sprites

        let newHexes = {}

        for (let row = 0; row < tfield.rows; row++) {
            for (let col = 0; col < tfield.columns; col++) {

                let oldCubeCoords = tfield.orientation == "pointyTop" ? coords_evenqToCube(col, row) : coords_evenrToCube(col, row)
                let cubeCoords = tfield.orientation == "pointyTop" ? coords_evenrToCube(col, row) : coords_evenqToCube(col, row)
                let q = cubeCoords.q
                let r = cubeCoords.r
                let s = cubeCoords.s

                let currentHex = tfield.hexes[genHexId(oldCubeCoords.q, oldCubeCoords.r, oldCubeCoords.s)]

                newHexes[genHexId(q, r, s)] = { q: q, r: r, s: s, bgColor: currentHex.bgColor, symbolId: currentHex.symbolId, symbol: currentHex.symbol ? {...currentHex.symbol} : null, blank: currentHex.blank }
            
            }
        }

        tfield.hexes = newHexes

        for (var i = symbolsContainer.children.length - 1; i >= 0; i--) {symbolsContainer.removeChild(symbolsContainer.children[i]);};

        renderAllHexes()
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

    export function renderGrid() {
        gridGraphics.clear();
        if (!tfield.grid.shown) return

        gridGraphics.lineStyle(tfield.grid.thickness, tfield.grid.stroke)

        Object.keys(tfield.hexes).forEach(hexId => {
            let hex = tfield.hexes[hexId]
            let hexC = coords_cubeToWorld(hex.q, hex.r, hex.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised);

            gridGraphics.drawPolygon( getHexPath(tfield.hexWidth, tfield.hexHeight, tfield.orientation, hexC.x, hexC.y) )
        });
    }

    export function renderSelectiveHexes(callback: Function) {
        // Re-renders hexes that pass true
         Object.keys(tfield.hexes).forEach(hexId => {
            
            if (callback(tfield.hexes[hexId])) renderHex(hexId)
        });
    }

    export function renderAllHexes() {
        terrainGraphics.clear();
        Object.keys(tfield.hexes).forEach(hexId => {
            renderHex(hexId)
        });
        renderGrid();
    }


    export function paintFromTile(hexId, tileData) {
        tfield.hexes[hexId].bgColor = tileData.bgColor
        tfield.hexes[hexId].symbol = tileData.symbol ? {...tileData.symbol} : null
        tfield.hexes[hexId].blank = false

        renderHex(hexId)
    }

    function renderHex(hexId) {
        let hex = tfield.hexes[hexId]
        let hexC = coords_cubeToWorld(hex.q, hex.r, hex.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised);

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
            let hc = hexC //coords_cubeToWorld(hex.q, hex.r, hex.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight)
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
            let clickedCoords = coords_worldToCube(x, y, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised)

            let clickedId = genHexId( clickedCoords.q, clickedCoords.r, clickedCoords.s )

            if (!hexExists(clickedId)) return

            tfield.hexes[clickedId].bgColor = data_terrain.bgColor;
            tfield.hexes[clickedId].symbol = data_terrain.symbolData ? {...data_terrain.symbolData} : null
            tfield.hexes[clickedId].blank = false

            renderHex(clickedId)

        }
    }

    function hexExists(hexId) {
        return tfield.hexes[hexId] != undefined
    }

    function paintHex(hexId: string) {
        //data_terrain = data_terrain

        if (!hexExists(hexId)) return

        tfield.hexes[hexId].bgColor = data_terrain.bgColor;
        tfield.hexes[hexId].symbol = data_terrain.symbolData ? {...data_terrain.symbolData} : null
        tfield.hexes[hexId].blank = false

        renderHex(hexId)

    }

    function eyedrop() {
        if (controls.mouseDown[0]) {
            let x = pan.worldX
            let y = pan.worldY
            let clickedCoords = coords_worldToCube(x, y, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised)

            let clickedId = genHexId( clickedCoords.q, clickedCoords.r, clickedCoords.s )

            //if (!hexExists(clickedId)) return;

            let cHex = tfield.hexes[clickedId]

            data_terrain.bgColor = cHex.bgColor
            data_terrain.symbolData = cHex.symbol ? {...cHex.symbol} : null

            data_terrain.usingEyedropper = false

        }
    }

    export function erase() {
        let clickedCoords = coords_worldToCube(pan.worldX, pan.worldY, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised)

        let clickedId = genHexId( clickedCoords.q, clickedCoords.r, clickedCoords.s )

        if (hexExists(clickedId)) eraseHex(clickedId)
    }

    export function eraseHex(hexId: string) {

        tfield.hexes[hexId].bgColor = tfield.blankHexColor
        tfield.hexes[hexId].symbol = null
        tfield.hexes[hexId].blank = true

        renderHex(hexId)
    }

    function paintbucket() {
        let x = pan.worldX
        let y = pan.worldY
        let clickedCoords = coords_worldToCube(x, y, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised)

        let clickedId = genHexId( clickedCoords.q, clickedCoords.r, clickedCoords.s ) 
        if (!hexExists(clickedId)) return

        
        // Check is hex in data matches the clicked style. If it does, abort painting!
        // Should be done in paint terrain as well
        let cHex = tfield.hexes[clickedId]
        if (cHex.bgColor == data_terrain.bgColor) {
           if (!data_terrain.symbolData && !cHex.symbol) return

            if (data_terrain.symbolData && cHex.symbol) {
                if (data_terrain.symbolData.color == cHex.symbol.color && data_terrain.symbolData.texId == cHex.symbol.texId) return
            }
            
        }

        let baseHex = {...tfield.hexes[clickedId]} // Any neighbours with the same style (same bgColor, symbol and symbolColor) will be changed and their neighbours will be added to the list

        let seenIds = [ genHexId(baseHex.q, baseHex.r, baseHex.s) ]
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

    export function clearTerrainSprites() {
        Object.keys(terrainSprites).forEach(hexId => {

            symbolsContainer.removeChild(terrainSprites[hexId])
            terrainSprites[hexId].destroy()
            delete terrainSprites[hexId]            

        });
    }

    onMount(() => {
        renderAllHexes()
        renderGrid()
    })

</script>


<Graphics instance={terrainGraphics} draw={g=>{ /* too slow to draw here! we have to hanndle it manually. See the render methods */ }}/>
<Container instance = {symbolsContainer} />

{#if tfield.grid.shown}
    <Graphics instance={gridGraphics} draw={g=>{ /* too slow to draw here! we have to hanndle it manually. See the render methods */ }}/>
{/if}
