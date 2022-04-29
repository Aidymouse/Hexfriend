<script lang="ts">

    import type { coordinates_data } from 'src/types/data';
    
    import * as PIXI from 'pixi.js'
    import { Container, Text } from 'svelte-pixi'
    import { onMount } from 'svelte';
    import { cubeToWorld } from '../helpers/hexHelpers'

    export let data_coordinates: coordinates_data;
    export let tfield;



    let coordOffsetX = 0
    let coordOffsetY = 0
    let oldSeperator = data_coordinates.seperator

    let texts = {} // hex id: text object


    let cont_coords = new PIXI.Container()

    //let style = new PIXI.TextStyle(data_coordinates.style)




    let style = new PIXI.TextStyle(data_coordinates.style)
    $: {
        Object.keys(data_coordinates.style).forEach(styleTag => {
            style[styleTag] = data_coordinates.style[styleTag]
        })

        
        if (oldSeperator != data_coordinates.seperator) {
            updateSeperator()
            
        }
    }


    /* COORDINATE TRANSFORMATIONS */
    function translate_cubeToEvenQ(q, r, s) {
        let col = q
        let row = r + (q + (q&1)) / 2
        return {col: col, row: row}
    }



    function calculateOffset() {
        // Based on the coord system and dimensions of the map

        switch (data_coordinates.system) {
            case "evenq":
                let lowestCol = Infinity
                let lowestRow = Infinity
                Object.keys(tfield.hexes).forEach(hexId => {
                    let brokenCoords = breakDownId(hexId)
                    lowestCol = Math.min(brokenCoords.q, lowestCol)
                    lowestRow = Math.min(brokenCoords.r + (brokenCoords.q + (brokenCoords.q&1)) / 2, lowestRow)
                })
        
                coordOffsetX = lowestCol
                coordOffsetY = lowestRow
                return

            case "cubeId":
                coordOffsetX = 0
                coordOffsetY = 0
                return

            default:
                coordOffsetX = 0
                coordOffsetY = 0
        }


    }

    export function generateCoords() {

        calculateOffset()

        Object.keys(tfield.hexes).forEach(hexId => {

            // Find Translation
            let s: string
            switch (data_coordinates.system) {
                case "evenq":
                    let brokenId = breakDownId(hexId)
        
                    let coordTranslation = translate_cubeToEvenQ(brokenId.q, brokenId.r, brokenId.s)
        
                    let c: string | number = coordTranslation.col-coordOffsetX
                    c = c < 10 ? "0" + c : c
                    let r: string | number = coordTranslation.row-coordOffsetY
                    r = r < 10 ? "0" + r : r
        
                    s = c + data_coordinates.seperator + r
                    break
                
                case "cubeId":
                    s = hexId
                    break

            }

            if (!texts[hexId]) {
                texts[hexId] = new PIXI.Text(s, style)

                let p = getTextPosition(hexId)
                texts[hexId].position.x = p.x
                texts[hexId].position.y = p.y
                
                texts[hexId].anchor = {x: 0.5, y: 1}
                
                cont_coords.addChild(texts[hexId])
                
            } else {
                texts[hexId].text = s

                let p = getTextPosition(hexId)
                texts[hexId].position.x = p.x
                texts[hexId].position.y = p.y

            }
        })

    }

    function breakDownId(hexId: string): {q: number, r: number, s: number} {
        let s = hexId.split(":")
        return {q: Number(s[0]), r: Number(s[1]), s: Number(s[2])}
    }

    export function updateSeperator() {

        if (oldSeperator == "") {
            generateCoords()
            return
        }


        Object.keys(texts).forEach(textId => {
            texts[textId].text = texts[textId].text.replace(oldSeperator, data_coordinates.seperator)
            
        })
        oldSeperator = data_coordinates.seperator
    } 

    export function updateSystem() {

    }

    export function updateTextPositions() {
        Object.keys(tfield.hexes).forEach(hexId => {
            
            let p = getTextPosition(hexId)
            texts[hexId].position.x = p.x
            texts[hexId].position.y = p.y

            
        })
    }

    function getTextPosition(hexId) {
        let brokenId = breakDownId(hexId)
        let coords = cubeToWorld(brokenId.q, brokenId.r, brokenId.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight)
        return {x: coords.x, y: coords.y + tfield.hexHeight/2 - 2}
    }

    onMount(() => {
        generateCoords()
    })

</script>

{#if data_coordinates.shown}
<Container
    instance = {cont_coords}
/>
{/if}



<style></style>