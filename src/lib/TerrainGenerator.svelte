<script lang="ts">

    import {genHexId, getNeighbours } from '../helpers/hexHelpers'
    import { download } from './download2';

    function rand(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }


    function validateRuleset(rules) {
        // Rules are invalid if any hex leads to another hex with an empty domain
        // Maybe more, but I cant think of it
    }


    function pickFromWeightDomain(domain): string {
        //console.log(domain)
        if (domain.length < 1) {
            console.log("No domain! WTF!?")
            return "default_Mountains"
        }

        let cum = 0
        let totalWeight = domain.reduce( (prevValue, domainPart) => prevValue + domainPart.weight, 0 )


        let randTerrain = rand(0, totalWeight)
        console.log(randTerrain)

        for (let dI=0; dI<domain.length; dI++) {
            if (randTerrain >= cum && randTerrain < cum + domain[dI].weight) {
                //console.log(domain[dI].id)
                return domain[dI].id
            }
            cum += domain[dI].weight
        }

        //console.log("Something fucked up!")
        return "default_Dead-Tree"
    }

    function collapseWaveGen(hexes, rules) {
        
        let genHexes = {}
        
        /* Assemble the default domain */
        let defaultDomain = []
        Object.keys(rules).forEach(terrainId => {
            defaultDomain.push( {id: terrainId, weight: 1} )
        })

        // Populate data structure that will hold generated hexes
        Object.keys(hexes).forEach(hexId => {
            genHexes[genHexId(hexes[hexId].q, hexes[hexId].r, -hexes[hexId].q - hexes[hexId].r)] = { q: hexes[hexId].q, r: hexes[hexId].r, s: -hexes[hexId].q - hexes[hexId].r, terrainId: null}
        })

        let hexIds = Object.keys(genHexes)
        let firstHex = null

        while (hexIds.length > 0) {
            // Find hex with lowest weight
            let nextHex = genHexes[hexIds.pop()]
            /*
            hexIds.forEach(hexId => {
                //if (genHexes[hexId].terrainId != null) return // Id will be removed from list once used up

                if (nextHex.terrainId != null && genHexes[hexId].terrainId == null) {
                    nextHex = genHexes[hexId]
                    return
                }

                if (genHexes[hexId].domain.length < nextHex.domain.length) nextHex = genHexes[hexId]
            })

            // Remove the hex from the list of ids that need terrain
            hexIds.splice(hexIds.indexOf( genHexId(nextHex.q, nextHex.r, nextHex.s) ), 1)
            if (nextHex.domain.length == 0) {
                console.log("Domain is 0, how!?!?")
                //console.log(nextHex)
                nextHex.terrainId = "default_Mountains"
                continue
            }

            */

            /* May be fixed with proper propegation */


            let neighbourIds = getNeighbours(nextHex.q, nextHex.r, nextHex.s)

            /* Assign ID randomly from hexes domain */
            // The domain of the hex must be modified based on surrounding hexes
            
            // Assemble the domain of this hex based on surrounding hexes
            let allBlankNeighbours = true
            
            let constructedDomain = []

            neighbourIds.forEach(nId => {
                let nHex = genHexes[nId]
                if (!nHex) return
                if (nHex.terrainId == null) return

                let neighbourRule = rules[nHex.terrainId] // gives us a list of terrains and weights
                
                neighbourRule.forEach(rulePart => {
                    // Check if terrain is already in the constructed domain
                    // If it is, add the weight from this rule into the constructed domain
                    // If not, put it into the constructed domain with its weight
                    let terrain = constructedDomain.find(domainPart => domainPart.id == rulePart.id)
                    if (!terrain) {
                        constructedDomain.push( {id: rulePart.id, weight: 0} )
                        terrain = constructedDomain.find(domainPart => domainPart.id == rulePart.id)
                    }
                    
                    terrain.weight += rulePart.weight
                    
                })

                allBlankNeighbours = false


            })

            if (allBlankNeighbours) {
                // Select based on default domain
                nextHex.terrainId = pickFromWeightDomain(defaultDomain)
            } else {
                nextHex.terrainId = pickFromWeightDomain(constructedDomain)
                
            }

            // Pick a random thing
            //nextHex.terrainId = nextHex.domain[rand(0, nextHex.domain.length)];
            
            
            /* Reduce neighbouring domains
            neighbourIds.forEach(nId => {
                let nHex = genHexes[nId]
                if (!nHex) return
                if (nHex.terrainId != null) return

                // Iterate backwards through the neighbours domain
                for (let dI=nHex.domain.length-1; dI >= 0; dI--) {
                    let currentDomainStep = nHex.domain[dI]
                    let currentHexAllowedNeighbours = rules[nextHex.terrainId]

                    if ( currentHexAllowedNeighbours.find( domain => domain == currentDomainStep ) ) {
                        //console.log(currentDomainStep)
                        continue  
                    } 
                    nHex.domain.splice(dI, 1)
                    //dI--
                }

 

            }) */

            /* Add current hex to visited pile */
            //visitedHexIds.push( genHexId(nextHex.q, nextHex.r, nextHex.s) )
        }

        return genHexes
    }

    
    function getTileFromId(tileId: string) {
        let setName = tileId.split("_")[0]
        return loadedTilesets[setName].find(tile => tile.id == tileId)
    }


    function generate() {
        let generatedTerrain = collapseWaveGen(tfield.hexes, genFunction)

        //console.log(generatedTerrain)

        let c = 0;
        Object.keys(generatedTerrain).forEach(hexId => {
            let tileToPaint = getTileFromId(generatedTerrain[hexId].terrainId) //loadedTilesets['default'].find(tile => tile.id == generatedTerrain[hexId].terrainId)

            if (!tileToPaint) console.log(generatedTerrain[hexId].terrainId);

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


    export let loadedTilesets
    export let tfield
    export let comp_terrainField
    export let showTerrainGenerator
    

    let importFiles = []

    let selectedId = ""

    let slowAnimation = false

    let genFunction = {

    }
    // Populate the gen function
    Object.keys(loadedTilesets).forEach(tilesetName => {
        let tileset = loadedTilesets[tilesetName]
        tileset.forEach(tile => {
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
            {#each Object.keys(loadedTilesets) as tilesetName}
                {#each loadedTilesets[tilesetName] as tile (tile.id)}
                    <button on:click={() => { addTileToFunction(selectedId, tile.id) }}> <img src={tile.preview}> </button>
                {/each}
            {/each}
        {/if}
    </div>

    <button id="generate-button" on:click={() => { generate() }}>Generate!</button>
    <button on:click={() => { exportGenFunction() }}>Export</button>
    <button id="import-button"><input type="file" bind:files={importFiles} on:change={() => { importGenFunction() }}>Import</button>
    <button on:click={() => {showTerrainGenerator = false}} >Close Generator</button>
    <div><input type="checkbox" bind:checked={slowAnimation}> Animate Generator</div>
</main>

<style>

    main {
        width: 600px;
        height: calc(100% - 20px);
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 10px;

        display: grid;
        grid-template-columns: 1fr 115px;
        grid-template-rows: 1fr 30px;
        box-sizing: border-box;
        background-color: #333333;
    }

    #generate-button {    }

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

