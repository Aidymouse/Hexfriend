<script lang="ts">
    import type { TerrainHex, TerrainHexField } from 'src/types/terrain';
    import type { Tile, Tileset } from "/src/types/tilesets"

    import {genHexId, getNeighbours } from '../helpers/hexHelpers'
    import { download } from './download2';


    function rand(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }


    function validateRuleset(rules) {
        // Rules are valid if you can't have a space that has to be ignored because the rules forbid all hexes
    }


    function pickFromWeightDomain(domain): string {
        //console.log(domain)
        if (domain.length < 1) {
            console.log("No domain! WTF!?")
            return "!!BLANK!!" // should be something else
        }

        let cum = 0
        let totalWeight = domain.reduce( (prevValue, domainPart) => prevValue + domainPart.weight, 0 )


        let randTerrain = rand(0, totalWeight)
        //console.log(randTerrain)

        for (let dI=0; dI<domain.length; dI++) {
            if (randTerrain >= cum && randTerrain < cum + domain[dI].weight) {
                //console.log(domain[dI].id)
                return domain[dI].id
            }
            cum += domain[dI].weight
        }

        //console.log("Something fucked up!")
        return "!!BLANK!!"
    }

    function collapseWaveGen(hexes, rules) {
        
        let genHexes = {}
        
        /* Assemble the default domain */
        let defaultDomain = []
        Object.keys(rules).forEach(terrainId => {
            if (rules[terrainId].length < 1) return
            defaultDomain.push( {id: terrainId, weight: 1} )
        })

        // Populate data structure that will hold generated hexes
        Object.keys(hexes).forEach(hexId => {
            genHexes[genHexId(hexes[hexId].q, hexes[hexId].r, -hexes[hexId].q - hexes[hexId].r)] = { q: hexes[hexId].q, r: hexes[hexId].r, s: -hexes[hexId].q - hexes[hexId].r, terrainId: null}
        })

        let hexIds = Object.keys(genHexes)
        let firstHex = null
        let paintOrder = []

        while (hexIds.length > 0) {
            // Find hex with lowest weight
            let h = hexIds.pop()
            let nextHex = genHexes[h]

            let neighbourIds = getNeighbours(nextHex.q, nextHex.r, nextHex.s)

            /* Assign ID randomly from hexes domain */
            // The domain of the hex must be modified based on surrounding hexes
            
            // Assemble the domain of this hex based on surrounding hexes
            let allBlankNeighbours = true
            
            // Full domain but with all 0 weights
            let constructedDomain = []
            defaultDomain.forEach(ddp => {
                constructedDomain.push( {id: ddp.id, weight: 0} ) 
            })


            neighbourIds.forEach(nId => {
                let nHex = genHexes[nId]
                if (!nHex) return
                if (nHex.terrainId == null) return
                if (nHex.terrainId == "!!BLANK!!") return

                let neighbourRule = rules[nHex.terrainId] // gives us a list of terrain ids and weights
                

                constructedDomain.forEach(cdp => {
                    // Ignore if this option has already been ruled out
                    if (cdp.weight == -1) return

                    // Try to find the current tile is allowed to connect to this neighbour
                    let pertainingRule = neighbourRule.find(nrp => nrp.id == cdp.id)
                    //console.log(pertainingRule)

                    if (!pertainingRule) {
                        // If it isnt, mark the tile as ruled out
                        cdp.weight = -1
                    
                    } else {

                        // If it is, add this tiles weight to the tile in the constructed domain
                        cdp.weight += pertainingRule.weight
                    }

                })
                    

                allBlankNeighbours = false


            })


            if (allBlankNeighbours) {
                // Select based on default domain
                nextHex.terrainId = pickFromWeightDomain(defaultDomain)
            } else {

                // Reduce the constructed domain to only what is allowed
                let whittledDomain = []
                constructedDomain.forEach(cdp => {
                    if (cdp.weight > 0) whittledDomain.push( {id: cdp.id, weight: cdp.weight} ) 
                })

                nextHex.terrainId = pickFromWeightDomain(whittledDomain)
                
            }

            paintOrder.push(h)

        }

        return {gen: genHexes, order: paintOrder}
    }

    
    function getTileFromId(tileId: string) {
        
        let setId = tileId.split("_")[0]
        
        let tileset = loadedTilesets.find((tileset: Tileset) => tileset.id == setId)
        
        return tileset.tiles.find((tile: Tile) => tile.id == tileId)
    }


    function generate() {
        let g = collapseWaveGen(tfield.hexes, genFunction)
        let generatedTerrain = g.gen
        let o = g.order

        //console.log(generatedTerrain)

        let c = 0;
        o.forEach(hexId => {

            if (generatedTerrain[hexId].terrainId == "!!BLANK!!") {
                comp_terrainField.eraseHex(hexId)
                return
            }

            let tileToPaint = getTileFromId(generatedTerrain[hexId].terrainId) //loadedTilesets['default'].find(tile => tile.id == generatedTerrain[hexId].terrainId)

            if (!tileToPaint) console.log(generatedTerrain[hexId].terrainId); // shouldnt happen

            if (slowAnimation) { 
                setTimeout(() => { comp_terrainField.paintFromTile(hexId, tileToPaint) }, c*5)
                c++
            } else {
                comp_terrainField.paintFromTile(hexId, tileToPaint)
            }
        })
    }


    function exportGenFunction() {
        download( JSON.stringify(genFunction), "genFunction.hfgf" )
    }


    function importGenFunction() {
        if (!importFiles[0]) return

        let r = new FileReader();
        r.onload = eb => {
            genFunction = {...JSON.parse(eb.target.result)}
        }

        r.readAsText(importFiles[0])
    }


    function removeTileFromFunction(tileId, IdToRemove) {

        let terrain = genFunction[tileId].find(rulePart => rulePart.id == IdToRemove)
        terrain.weight -= 1

        if (terrain.weight < 1) genFunction[tileId].splice(genFunction[tileId].indexOf(terrain), 1)

        genFunction[tileId] = genFunction[tileId]
    }


    function addTileToFunction(tileId, IdToAdd) {

        let rule = genFunction[tileId]

        let rulePart = rule.find(rp => rp.id == IdToAdd)
        if (!rulePart) {
            rule.push( {id: IdToAdd, weight: 0} )
            rulePart = rule.find(rp => rp.id == IdToAdd)
        }
        rulePart.weight += 1

        genFunction = genFunction

    }


    export let loadedTilesets: Tileset[]
    export let tfield: TerrainHexField
    export let comp_terrainField
    export let showTerrainGenerator: boolean
    

    let importFiles = []

    let selectedId = ""

    let slowAnimation = false

    let genFunction = {

    }
    // Populate the gen function
    loadedTilesets.forEach( (tileset: Tileset) => {
        tileset.tiles.forEach( (tile: Tile) => {
            genFunction[tile.id] = [ {id: tile.id, weight: 1} ]
        })
    })


</script>

<main>
    <div id="buttons">
        {#each Object.keys(genFunction) as tileId}

            <div class="terrain-category">
                <button on:click={() => {selectedId = tileId} } class:selected={selectedId == tileId} > <img src={getTileFromId(tileId).preview} alt={getTileFromId(tileId).display} ></button>
                
                    <div class="added-ids">
                        {#each genFunction[tileId] as allowedData}
                            <div class="added-tile" on:click={() => {  removeTileFromFunction(tileId, allowedData.id) } }>
                                <img src={getTileFromId(allowedData.id).preview} alt={allowedData.id}>
                                <div class="weight-container"> <p>{allowedData.weight}</p> </div> <!-- Weight has to absolute but also float in middle, hence the container -->
                            </div>
                        {/each}
                    </div>

            </div>

        {/each}
    </div>

    <div id="add-tiles">
        {#if selectedId != ""}
            {#each loadedTilesets as tileset}
                {#each tileset.tiles as tile (tile.id)}
                    <button on:click={() => { addTileToFunction(selectedId, tile.id) }}> <img src={tile.preview} alt={tile.id} title={`Add ${tile.display} to generation ruleset`}> </button>
                {/each}
            {/each}
        {/if}
    </div>

    <div id="generator-controls">

        <button id="generate-button" on:click={() => { generate() }}>Generate!</button>
        <button on:click={() => { exportGenFunction() }}>Export</button>
        <button id="import-button"><input type="file" bind:files={importFiles} on:change={() => { importGenFunction() }}>Import</button>
        <button on:click={() => {showTerrainGenerator = false}} >Close Generator</button>
        <div><input type="checkbox" bind:checked={slowAnimation}> Animate Generator</div>

    </div>
</main>

<style>

    main {
        width: 600px;
        height: 80%;
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 10px;

        display: grid;
        gap: 5px;
        grid-template-columns: 1fr 115px;
        grid-template-rows: 1fr auto;
        box-sizing: border-box;
        background-color: #333333;
    }

    #buttons {
        display: flex;
        flex-direction: column;
        gap: 5px;

        overflow-y: scroll;
        height: 100%;
    }

    #add-tiles {
        display: grid;
        grid-template-columns: 50px 50px;
        grid-template-rows: 50px;
        grid-auto-rows: 50px;
        gap: 5px;
        padding: 5px;
        background-color: #555555;
        overflow: scroll;
    }

    #add-tiles button {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #add-tiles button img {
        width: 100%;
    }

    .added-ids {
        display: flex;
        flex-wrap: wrap;
        font-size: 10pt;
        box-sizing: border-box;
        gap: 5px;
    }

    .added-ids img {
        height: 25px;
    }


    .added-ids .added-tile {
        position: relative;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .added-tile .weight-container {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .added-tile:hover {
        outline: #8cc63f solid 2px;
        border-radius: 4px;
        transition-duration: 0.2s;
        transition-property: outline-color;
    }

    .terrain-category {
        display: flex;
        gap: 5px;
    }

    .selected {
        border: solid 1px #8cc63f;
        outline: #8cc63f solid 1px;
    }

    #import-button {
        position: relative;
    }

    #import-button input {
        position: absolute;
        opacity: 0;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

</style>

