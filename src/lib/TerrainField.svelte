<script lang="ts">
    import { Graphics, Container } from "svelte-pixi"
    import * as PIXI from 'pixi.js'
    import {coords_cubeToWorld, getHexPath, genHexId, coords_worldToCube, getNeighbours, coords_qToCube, coords_rToCube, genHexId_cordsObj} from '../helpers/hexHelpers'

    import { onMount } from "svelte";
    
    import { map_type } from "/src/types/settings";
    import type { TerrainHex, TerrainHexField } from "src/types/terrain";
import { collapseWaveGen } from "./terrainGenerator";

    let terrainGraphics = new PIXI.Graphics()
    let symbolsContainer = new PIXI.Container()
    let gridGraphics = new PIXI.Graphics()

    let terrainSprites = {}

    export let pan
    export let controls
    export let L
    export let tfield: TerrainHexField
    
    export let data_terrain

    export function copyHex(from: TerrainHex, to: TerrainHex) {

        to.bgColor = from.bgColor
        to.blank = from.blank
        to.symbol = from.symbol ? {...from.symbol} : null

    }

    /* SQUARE SHAPED MAPS */
    export function updateRaisedColumn() {

        // the labels look backwards, but thats cos the value is bound to the thing that triggers this function

        if (tfield.raised == "odd") {

            for (let col = 1; col < tfield.columns; col+=2) {

                // Create hex at bottom of column
                let newHexCoords = coords_qToCube("odd", col, tfield.rows-1)
                let newId = genHexId_cordsObj(newHexCoords)
                tfield.hexes[newId] = { q: newHexCoords.q, r: newHexCoords.r, s: newHexCoords.s, bgColor: 0xf2f2f2, symbolId: null, symbol: null, blank: true, renderable: true }
                
                // Move all hexes one down
                for (let row=tfield.rows-1; row >= 0; row--) {
                    let destinationCoords = coords_qToCube("odd", col, row)
                    let destinationHex = tfield.hexes[genHexId_cordsObj(destinationCoords)]

                    let sourceId = coords_qToCube("odd", col, row-1)
                    let sourceHex = tfield.hexes[genHexId_cordsObj(sourceId)]

                    copyHex(sourceHex, destinationHex)
                }

                let oldHexCoords = coords_qToCube("even", col, 0)
                eraseHex(genHexId_cordsObj(oldHexCoords))
                delete(tfield.hexes[genHexId_cordsObj(oldHexCoords)])
            }

        }
        
        else if (tfield.raised == "even") {

            for (let col = 1; col < tfield.columns; col+=2) {
                // Create hex at top of column
                let newHexCoords = coords_qToCube("even", col, 0)
                let newId = genHexId_cordsObj(newHexCoords)
                tfield.hexes[newId] = { q: newHexCoords.q, r: newHexCoords.r, s: newHexCoords.s, bgColor: 0xf2f2f2, symbolId: null, symbol: null, blank: true, renderable: true }
                
                // Move all hexes one up
                for (let row=0; row < tfield.rows; row++) {
                    let destinationCoords = coords_qToCube("even", col, row)
                    let destinationHex = tfield.hexes[genHexId_cordsObj(destinationCoords)]

                    let sourceId = coords_qToCube("even", col, row+1)
                    let sourceHex = tfield.hexes[genHexId_cordsObj(sourceId)]

                    copyHex(sourceHex, destinationHex)
                }

                let oldHexCoords = coords_qToCube("odd", col, tfield.rows-1)
                eraseHex(genHexId_cordsObj(oldHexCoords))
                delete(tfield.hexes[genHexId_cordsObj(oldHexCoords)])
            }
            
        }

        renderAllHexes()
    }


    export function changeIndentedRow() {
        if (tfield.raised == "odd") {

            for (let row = 1; row < tfield.rows; row+=2) {

                // Create hex at right of row
                let newHexCoords = coords_rToCube("odd", tfield.columns-1, row)
                let newId = genHexId_cordsObj(newHexCoords)
                tfield.hexes[newId] = { q: newHexCoords.q, r: newHexCoords.r, s: newHexCoords.s, bgColor: 0xf2f2f2, symbolId: null, symbol: null, blank: true, renderable: true }
                
                // Move all hexes one right
                for (let col=tfield.columns-1; col >= 0; col--) {
                    let destinationCoords = coords_rToCube("odd", col, row)
                    let destinationHex = tfield.hexes[genHexId_cordsObj(destinationCoords)]

                    let sourceId = coords_rToCube("odd", col-1, row)
                    let sourceHex = tfield.hexes[genHexId_cordsObj(sourceId)]

                    copyHex(sourceHex, destinationHex)
                }

                let oldHexCoords = coords_rToCube("even", 0, row)
                eraseHex(genHexId_cordsObj(oldHexCoords))
                delete(tfield.hexes[genHexId_cordsObj(oldHexCoords)])
            }

        }
        
        else if (tfield.raised == "even") {

            for (let row = 1; row < tfield.rows; row+=2) {
                // Create hex at top of column
                let newHexCoords = coords_rToCube("even", 0, row)
                let newId = genHexId_cordsObj(newHexCoords)
                tfield.hexes[newId] = { q: newHexCoords.q, r: newHexCoords.r, s: newHexCoords.s, bgColor: 0xf2f2f2, symbolId: null, symbol: null, blank: true, renderable: true }
                
                // Move all hexes one up
                for (let col=0; col < tfield.columns; col++) {
                    let destinationCoords = coords_rToCube("even", col, row)
                    let destinationHex = tfield.hexes[genHexId_cordsObj(destinationCoords)]

                    let sourceId = coords_rToCube("even", col+1, row)
                    let sourceHex = tfield.hexes[genHexId_cordsObj(sourceId)]

                    copyHex(sourceHex, destinationHex)
                }

                let oldHexCoords = coords_rToCube("odd", tfield.columns-1, row)
                eraseHex(genHexId_cordsObj(oldHexCoords))
                delete(tfield.hexes[genHexId_cordsObj(oldHexCoords)])
            }
            
        }

        renderAllHexes()
    }

    
    export function square_expandMapDimension(direction: "left" | "right" | "top" | "bottom", amount: number) {
        
        // Will come back here later...
        switch (direction) {
            case "right": 
                square_expandRight(amount)
                renderAllHexes()
                break
            
            case "left":
                square_expandRight(amount)
                square_moveAllHexesRight(amount)

                if (tfield.orientation == "flatTop") {
                    tfield.raised = tfield.raised == "odd" ? "even" : "odd"
                    updateRaisedColumn()

                    pan.offsetX -= tfield.hexWidth * 0.75 * pan.zoomScale
                    pan.offsetY += tfield.hexHeight * 0.5 * (tfield.raised == "odd" ? -1 : 1) * pan.zoomScale
                } else {

                    pan.offsetX -= tfield.hexWidth * pan.zoomScale

                }
                
                renderAllHexes()

                break

            case "bottom":
                square_expandDown(amount)
                renderAllHexes()
                break
            
            case "top":
                square_expandDown(amount)
                
                square_moveAllHexesDown(amount)

                if (tfield.orientation == "flatTop") {
                    pan.offsetY -= tfield.hexHeight * pan.zoomScale
                
                } else {
                    tfield.raised = tfield.raised == "odd" ? "even" : "odd"
                    changeIndentedRow()

                    pan.offsetY -= tfield.hexHeight * 0.75 * pan.zoomScale
                    pan.offsetX += tfield.hexWidth * 0.5 * (tfield.raised == "odd" ? -1 : 1) * pan.zoomScale    
                    
                }

                renderAllHexes()
                break
        }

    }

    function square_expandRight(amount: number) {
        for (let col=0; col<amount; col++) {
            for (let row=0; row < tfield.rows; row++) {

                let newHexCoords = tfield.orientation == "flatTop" ? coords_qToCube(tfield.raised, tfield.columns + col, row) : coords_rToCube(tfield.raised, tfield.columns + col, row)
                
                tfield.hexes[ genHexId_cordsObj(newHexCoords) ] = { q: newHexCoords.q, r: newHexCoords.r, s: newHexCoords.s, bgColor: 0xf2f2f2, symbolId: null, symbol: null, blank: true, renderable: true }
            
            }

            tfield.columns += 1
        }

        
    }

    function square_moveAllHexesRight(amount: number) {
        for (let col = tfield.columns-1; col >= amount; col--) {
            for (let row=0; row<tfield.rows; row++) {

                let destinationCoords = tfield.orientation == "flatTop" ? coords_qToCube(tfield.raised, col, row) : coords_rToCube(tfield.raised, col, row)
                let destinationHex = tfield.hexes[genHexId_cordsObj(destinationCoords)]

                let sourceColumn = col-amount
                

                let sourceCoords = tfield.orientation == "flatTop" ? coords_qToCube(tfield.raised, sourceColumn, row) : coords_rToCube(tfield.raised, sourceColumn, row)
                let sourceHex = tfield.hexes[genHexId_cordsObj(sourceCoords)]

                copyHex(sourceHex, destinationHex)
                
                if (sourceColumn < amount) {
                    sourceHex.blank = true
                }
            }
        }
    }

    function square_expandDown(amount: number) {
        for (let col=0; col<tfield.columns; col++) {
            for (let row=0; row < amount; row++) {
                

                let newHexCoords = tfield.orientation == "flatTop" ? coords_qToCube(tfield.raised, col, tfield.rows + row) : coords_rToCube(tfield.raised, col, tfield.rows + row)
                
                tfield.hexes[ genHexId_cordsObj(newHexCoords) ] = { q: newHexCoords.q, r: newHexCoords.r, s: newHexCoords.s, bgColor: 0xf2f2f2, symbolId: null, symbol: null, blank: true, renderable: true }
            
            }
            
        }
        tfield.rows += amount

    }

    function square_moveAllHexesDown(amount: number) {
        for (let col = 0; col < tfield.columns; col++) {
            for (let row=tfield.rows-1; row>=amount; row--) {

                let destinationCoords = tfield.orientation == "flatTop" ? coords_qToCube(tfield.raised, col, row) : coords_rToCube(tfield.raised, col, row)
                let destinationHex = tfield.hexes[genHexId_cordsObj(destinationCoords)]

                let sourceRow = row-amount
                
                let sourceCoords = tfield.orientation == "flatTop" ? coords_qToCube(tfield.raised, col, sourceRow) : coords_rToCube(tfield.raised, col, sourceRow)
                let sourceHex = tfield.hexes[genHexId_cordsObj(sourceCoords)]

                copyHex(sourceHex, destinationHex)
                
                if (sourceRow < amount) {
                    sourceHex.blank = true
                }
            }
        }
    }

    function square_changeOrientation() {
     
        let newHexes = {}
        
        for (let col=0; col < tfield.columns; col++) {
            for (let row=0; row < tfield.rows; row++) {

                
                let newHexCoords = tfield.orientation == "flatTop" ? coords_qToCube(tfield.raised, col, row) : coords_rToCube(tfield.raised, col, row)

                let sourceHexCoords = tfield.orientation == "flatTop" ? coords_rToCube(tfield.raised, col, row) : coords_qToCube(tfield.raised, col, row)
                let sourceHex: TerrainHex = tfield.hexes[genHexId_cordsObj(sourceHexCoords)]

                let newHex = {...sourceHex, q: newHexCoords.q, r: newHexCoords.r, s: newHexCoords.s}

                newHexes[genHexId_cordsObj(newHexCoords)] = newHex

            }
        }

        tfield.hexes = newHexes
        //for (var i = symbolsContainer.children.length - 1; i >= 0; i--) {symbolsContainer.removeChild(symbolsContainer.children[i]);};
        clearTerrainSprites()

        renderAllHexes()

    }


    /* RADIAL SHAPES MAPS */
    function radial_changeOrientation() {
        console.log("Radial Change Orientation!")
    }




    /* FUNCTIONS THAT APPLY TO ALL MAP TYPES */
    export function changeOrientation() {
        if (tfield.mapType == map_type.SQUARE) square_changeOrientation()
        else if (tfield.mapType == map_type.RADIAL) radial_changeOrientation()

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


    /* RENDER FUNCTIONS */
    export function renderGrid() {
        gridGraphics.clear();
        if (!tfield.grid.shown) return

        gridGraphics.lineStyle(tfield.grid.thickness, tfield.grid.stroke)

        Object.keys(tfield.hexes).forEach(hexId => {
            let hex = tfield.hexes[hexId]
            if (!hex.renderable) return

            let hexC = coords_cubeToWorld(hex.q, hex.r, hex.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised);

            //if (tfield.mapType == map_type.SQUARE) hexC = computeSquareBasedOffset(hexC, hex.q, hex.r)

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

    function renderHex(hexId) {
        let hex = tfield.hexes[hexId]

        if (!hex.renderable) {
            if (terrainSprites[hexId]) { 
                symbolsContainer.removeChild(terrainSprites[hexId])
                terrainSprites[hexId].destroy();
                delete terrainSprites[hexId];
            }
            return
        }

        let hexC = coords_cubeToWorld(hex.q, hex.r, hex.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised);

        //if (tfield.mapType == map_type.SQUARE) hexC = computeSquareBasedOffset(hexC, hex.q, hex.r)

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


    /* PAINT */
    export function paintFromTile(hexId, tileData) {
        tfield.hexes[hexId].bgColor = tileData.bgColor
        tfield.hexes[hexId].symbol = tileData.symbol ? {...tileData.symbol} : null
        tfield.hexes[hexId].blank = false

        renderHex(hexId)
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
            tfield.hexes[clickedId].symbol = data_terrain.symbol ? {...data_terrain.symbol} : null
            tfield.hexes[clickedId].blank = false

            renderHex(clickedId)

        }
    }

    function paintHex(hexId: string) {
        //data_terrain = data_terrain

        if (!hexExists(hexId)) return

        tfield.hexes[hexId].bgColor = data_terrain.bgColor;
        tfield.hexes[hexId].symbol = data_terrain.symbol ? {...data_terrain.symbol} : null
        tfield.hexes[hexId].blank = false

        renderHex(hexId)

    }

    /* TESTS? */
    function hexExists(hexId) {

        // If the hex is not rendereable, it doesnt exist.
        return tfield.hexes[hexId] != undefined ? tfield.hexes[hexId].renderable : false

    }

    
    /* ACTIONS */
    function eyedrop() {
        if (controls.mouseDown[0]) {
            let x = pan.worldX
            let y = pan.worldY
            let clickedCoords = coords_worldToCube(x, y, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised)

            let clickedId = genHexId( clickedCoords.q, clickedCoords.r, clickedCoords.s )

            if (!hexExists(clickedId)) return;

            let cHex = tfield.hexes[clickedId]

            data_terrain.bgColor = cHex.bgColor
            data_terrain.symbol = cHex.symbol ? {...cHex.symbol} : null

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

        let clickedId = genHexId_cordsObj(clickedCoords)
        if (!hexExists(clickedId)) return

        
        // Check if hex in data matches the clicked style. If it does, abort painting!
        // Should be done in paint terrain as well
        let cHex = tfield.hexes[clickedId]
        if (cHex.bgColor == data_terrain.bgColor) {
           if (!data_terrain.symbol && !cHex.symbol) return

            if (data_terrain.symbol && cHex.symbol) {
                if (data_terrain.symbol.color == cHex.symbol.color && data_terrain.symbol.texId == cHex.symbol.texId) return
            }
            
        }

        getContiguousHexIdsOfSameType(clickedId).forEach(hexId => {
            paintHex(hexId)
        })        

    }

    function erasePaintbucket() {
        // Find all like hexes, much like a paintbucket, and perform a specific operation on them, passing in hex id as a parameter

        let clickedId = genHexId_cordsObj( coords_worldToCube(pan.worldX, pan.worldY, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised) )
        
        if (!hexExists(clickedId)) return
        if (tfield.hexes[clickedId].blank) return

        let hexes = getContiguousHexIdsOfSameType(clickedId)
        hexes.forEach(hexId => {
            eraseHex(hexId)
        })

    }

    /* UNCATEGORIZED */
    function getContiguousHexIdsOfSameType(hexId: string): string[] {

        /*
        let x = pan.worldX
        let y = pan.worldY

        let clickedCoords = coords_worldToCube(x, y, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised)

        let clickedId = genHexId( clickedCoords.q, clickedCoords.r, clickedCoords.s ) 
        if (!hexExists(clickedId)) return
        */

        let baseHex = {...tfield.hexes[hexId]} // Any neighbours with the same style (same bgColor, symbol and symbolColor) will be changed and their neighbours will be added to the list

        let seenIds = [ genHexId(baseHex.q, baseHex.r, baseHex.s) ]
        let changedIds = []
        let hexStack = [ hexId ]
        
        while (hexStack.length > 0) {
            let cHex = tfield.hexes[hexStack.pop()]

            // Perform operation on current hex
            //operation( genHexId(cHex.q, cHex.r, cHex.s) )

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

        return changedIds
    }

    export function pointerdown() {

        if (data_terrain.usingEyedropper) {

            eyedrop()

        } else if (data_terrain.usingPaintbucket && data_terrain.usingEraser) {
            //console.log("Paintbucket Erase!")
            erasePaintbucket()

        } else if (data_terrain.usingPaintbucket) {
            paintbucket()

        } else if (data_terrain.usingEraser) {
            erase()
        
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
