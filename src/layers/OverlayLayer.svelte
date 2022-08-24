<script lang="ts">
    import { getHexPath } from '../helpers/hexHelpers';

    import { hex_orientation, hex_raised, terrain_field } from '../types/terrain';

    import { Graphics } from 'svelte-pixi';
    import * as store_tfield from '../stores/tfield';
    import * as store_panning from '../stores/panning';
    import type { pan_state } from 'src/types/panning';
    
    let tfield: terrain_field;
	store_tfield.store.subscribe(newTField => {
        tfield = newTField
	})

    
    let panning: pan_state;
    store_panning.store.subscribe(newPanning => {
        panning = newPanning
    })


</script>

{#if tfield.overlay.shown}

    <Graphics draw={(g) => {

        g.clear()

        let ratio;
        let bigHeight;
        let bigWidth;

        if (tfield.orientation == hex_orientation.FLATTOP) {
            ratio = tfield.hexWidth / tfield.hexHeight

            bigHeight = tfield.hexHeight * tfield.overlay.diameterInHexes
            bigWidth = bigHeight * ratio
        
            
        } else {
            ratio = tfield.hexHeight / tfield.hexWidth
            bigWidth = tfield.hexWidth * tfield.overlay.diameterInHexes
            bigHeight = bigWidth * ratio

        }

        let bigRows = Math.round(tfield.rows/tfield.overlay.diameterInHexes)
        
        let span = bigWidth / tfield.hexWidth
        let bigCols = Math.round( tfield.columns / span )

        if (bigRows < 1) bigRows = 1;
        if (bigCols < 1) bigCols = 1;

        let zeroOffsetX = tfield.overlay.offset.x * tfield.hexWidth //+ store_panning.curWorldX()
        let zeroOffsetY = tfield.overlay.offset.y * tfield.hexHeight //+ store_panning.curWorldY()
        

        g.lineStyle(tfield.overlay.style.width, tfield.overlay.style.color);

        let encompassMod = tfield.overlay.encompassEdges ? 1 : 0

        for (let bigRow = 0 - encompassMod; bigRow < bigRows + encompassMod; bigRow++) {
            for (let bigCol = 0 - encompassMod; bigCol < bigCols + encompassMod; bigCol++){

                let bigHexX, bigHexY;
                let raisedMod = tfield.overlay.raised == hex_raised.EVEN ? -1 : 1

                if (tfield.orientation == hex_orientation.FLATTOP) {
                    
                    bigHexX = bigCol*bigWidth*0.75+zeroOffsetX
                    bigHexY = bigRow*bigHeight + ((Math.abs(bigCol%2)==1 ? bigHeight/2 : 0) * raisedMod) + zeroOffsetY
                    
                } else {

                    bigHexX = bigCol*bigWidth + ((Math.abs(bigRow%2)==1 ? bigWidth/2 : 0) * raisedMod) + zeroOffsetX
                    bigHexY = bigRow*bigHeight*0.75 + zeroOffsetY

                }


                let bigHexPath = getHexPath( bigWidth, bigHeight, tfield.orientation, bigHexX, bigHexY )
                g.drawPolygon(bigHexPath);

            }

        }


    }} />

{/if}


