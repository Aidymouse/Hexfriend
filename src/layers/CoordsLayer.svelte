<script lang="ts">

    import * as PIXI from 'pixi.js'
    import { Container, Text } from 'svelte-pixi'
    import type { TerrainHexField } from "src/types/terrain"
    import type { coordinates_data } from 'src/types/data'
    import { coord_system } from '/src/types/cordinates'
    import { coords_cubeToWorld } from '/src/helpers/hexHelpers';
    import { coords_cubeToq, coords_cubeTor } from '/src/helpers/hexHelpers';
    import { onMount } from 'svelte';


    interface coordText {
        pixiText: PIXI.Text,
        parts: number[]
    }

    $: {
        Object.entries(texts).forEach(([hexId, text]) => {
            text.pixiText.style = data_coordinates.style
        })
    }
    

    let texts: { [key: string]: coordText } = {} // hex id: coordText

    let cont_textContainer = new PIXI.Container()

    export let tfield: TerrainHexField
    export let data_coordinates: coordinates_data

    function breakDownHexID(hexId: string) {
        let brokenId = hexId.split(":")
        return {q: Number(brokenId[0]), r: Number(brokenId[1]), s: Number(brokenId[2])}
    }

    function createTextIfNoneExists(hexId: string) {
        //texts[hexId] = { text: "", x: 0, y: 0, parts: [] }
        
        if (!textExists(hexId)) {
            texts[hexId] = {pixiText: new PIXI.Text("", data_coordinates.style), parts: []}
            texts[hexId].pixiText.anchor.x = 0.5
            texts[hexId].pixiText.anchor.y = 1
            cont_textContainer.addChild(texts[hexId].pixiText)
        }
        
    }

    async function generateCoords(system: coord_system) {

        switch(system) {
            case (coord_system.HEXID):
                Object.keys(tfield.hexes).forEach(hexId => {
                    
                    createTextIfNoneExists(hexId)

                    let idParts = breakDownHexID(hexId)

                    texts[hexId].parts = [idParts.q, idParts.r, idParts.s]
                    texts[hexId].pixiText.text = `${texts[hexId].parts[0]}${data_coordinates.seperator}${texts[hexId].parts[1]}${data_coordinates.seperator}${texts[hexId].parts[2]}`
                    
                    let newPos = coords_cubeToWorld(idParts.q, idParts.r, idParts.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight)

                    texts[hexId].pixiText.position.x = newPos.x
                    texts[hexId].pixiText.position.y = newPos.y + tfield.hexHeight/2 - 4

                }) 
                break

            case (coord_system.ROWCOL):

                Object.keys(tfield.hexes).forEach(hexId => {
                    
                    createTextIfNoneExists(hexId)

                    let cube = breakDownHexID(hexId)
                    let idParts = tfield.orientation == "flatTop" ? coords_cubeToq(tfield.raised, cube.q, cube.r, cube.s) : coords_cubeTor(tfield.raised, cube.q, cube.r, cube.s)

                    let newPos = coords_cubeToWorld(cube.q, cube.r, cube.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight)

                    texts[hexId].parts = [idParts.col, idParts.row]
                    //texts[hexId].pixiText.text = `${texts[hexId].parts[0]}${data_coordinates.seperator}${texts[hexId].parts[1]}`
                    texts[hexId].pixiText.text = `${texts[hexId].parts[0]}${data_coordinates.seperator}${texts[hexId].parts[1]}`
                    
                    texts[hexId].pixiText.position.x = newPos.x
                    texts[hexId].pixiText.position.y = newPos.y + tfield.hexHeight/2 - 4

                }) 

                break
            
            case (coord_system.AXIAL):
                Object.keys(tfield.hexes).forEach(hexId => {
                    
                    createTextIfNoneExists(hexId)

                    let cube = breakDownHexID(hexId)

                    let newPos = coords_cubeToWorld(cube.q, cube.r, cube.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight)

                    texts[hexId].parts = [cube.q, cube.r]
                    
                    texts[hexId].pixiText.text = `${texts[hexId].parts[0]}${data_coordinates.seperator}${texts[hexId].parts[1]}`
                    texts[hexId].pixiText.position.x = newPos.x
                    texts[hexId].pixiText.position.y = newPos.y + tfield.hexHeight/2 - 4

                }) 

                break

        }

    }

    function textExists(hexId: string) {
        return texts[hexId] != null
    }

    onMount(() => {
        generateCoords( data_coordinates.system )
    })

</script>


{#if data_coordinates.shown}
    <Container instance={cont_textContainer}>
    </Container>
{/if}