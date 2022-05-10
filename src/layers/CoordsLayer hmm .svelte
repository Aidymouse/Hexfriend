<script lang="ts">

    import type { coordinates_data } from 'src/types/data';
    
    import * as PIXI from 'pixi.js'
    import { Container, Text } from 'svelte-pixi'
    import { onMount } from 'svelte';
    import { coords_cubeToWorld } from '../helpers/hexHelpers'

    export let data_coordinates: coordinates_data;
    export let tfield;
    export let app;

    // Needs some serious optimization. Render each letter and then join them seperately. This is gonna be... weird.


    let coordOffsetX = 0
    let coordOffsetY = 0
    let oldSeperator = data_coordinates.seperator

    let texts = {} // hex id: text object
    let coordValues = {} // hex id: list of ordered co-ord values, used for seperators

    // Would be faster during runtime to generate all coord systems in advance and switch between them easily, but eats a lot of load time for something unlikely to be used that often during actual use.


    let cont_coords = new PIXI.Container()

    let renderHelper = new PIXI.Container() 

    let alphabet = {
        "0": null,
        "1": null,
        "2": null,
        "3": null,
        "4": null,
        "5": null,
        "6": null,
        "7": null,
        "8": null,
        "9": null,
        "-": null
    }

    

    //let style = new PIXI.TextStyle(data_coordinates.style)

    let style = new PIXI.TextStyle(data_coordinates.style)
    
    function generateTextSprites() {
        Object.keys(alphabet).forEach(character => {

            let t = new PIXI.Text(character, style)
            let b = app.renderer.plugins.extract.base64(t)
            alphabet[character] = PIXI.Texture.from(b)
            t.destroy()

        })   
        
        let t = new PIXI.Text(data_coordinates.seperator, style)
        let b = app.renderer.plugins.extract.base64(t)
        alphabet[data_coordinates.seperator] = PIXI.Texture.from(b)
        t.destroy()

        console.log(alphabet)
    }

    function assembleTextSprites() {
        Object.keys(coordValues).forEach(hexId => {

            let cs = coordValues[hexId].split("")

            let letterContainer = new PIXI.Container()
            let cumWidth = 0
            cs.forEach(character => {
                let s = new PIXI.Sprite(alphabet[character])
                s.x = cumWidth
                cumWidth += alphabet[character].width-2
                letterContainer.addChild(s)
            })

            let position = getTextPosition(hexId)
            //letterContainer.position.x = position.x
            //letterContainer.position.y = position.y
            let letterTexture = PIXI.Texture.from( app.renderer.plugins.extract.base64(letterContainer) )
            

            let lS = new PIXI.Sprite(letterTexture)

            lS.position.x = position.x
            lS.position.y = position.y
            lS.anchor.set(0.5, 1)

            cont_coords.addChild(lS)

        })
    }

    /*
    $: {
        Object.keys(data_coordinates.style).forEach(styleTag => {
            style[styleTag] = data_coordinates.style[styleTag]
        })

        
        if (oldSeperator != data_coordinates.seperator) {
            updateSeperator()
            
        }
    }
    */


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
        
                    s = [c, r]
                    break
                
                case "cubeId":
                    s = hexId.split(":")
                    break

            }

            // Put into right format
            let coord = ""
            for (let c=0; c<s.length-1; c++) {
                coord += s[c]
                coord += data_coordinates.seperator
            }
            coord += s[s.length-1]

            coordValues[hexId] = coord //Array.from(coord)

            //updateSeperator() 
        })

    }

    function breakDownId(hexId: string): {q: number, r: number, s: number} {
        let s = hexId.split(":")
        return {q: Number(s[0]), r: Number(s[1]), s: Number(s[2])}
    }

    export function updateSeperator() {

        Object.keys(texts).forEach(textId => {
            let s = ""
            coordValues[textId].forEach( (cv, index) => {
                s += cv
                if (index != coordValues[textId].length-1) s += data_coordinates.seperator
            })

            texts[textId].text = s
            
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
        let coords = coords_cubeToWorld(brokenId.q, brokenId.r, brokenId.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised)
        return {x: coords.x, y: coords.y + tfield.hexHeight/2 - 2}
    }

    export function eraseAllCoordinates() {
        Object.keys(texts).forEach(textId => {
            texts[textId].destroy()
        })

        texts = []
        coordValues = []
        //cont_coords = new PIXI.Container()
    }

    onMount(() => {
        //generateCoords()
        generateTextSprites()
        generateCoords()
        assembleTextSprites()
    })

</script>

{#if data_coordinates.shown}
<Container
    instance = {cont_coords}
/>
{/if}



<style></style>