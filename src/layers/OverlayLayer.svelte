<script lang="ts">
    import { getHexPath } from '../helpers/hexHelpers';

    import { hex_orientation, terrain_field } from '../types/terrain';

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
    
    
    let orientation: hex_orientation = hex_orientation.FLATTOP


</script>

{#if tfield.overlay.shown}

    <Graphics draw={(g) => {

        g.clear()

        let ratio;
        let bigHeight;
        let bigWidth;
        let horizonalSpan;
        let verticalSpan;

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
        
        let horizontalSpan = bigWidth / tfield.hexWidth
        let bigCols = Math.round( tfield.columns / horizontalSpan )

        let zeroOffsetX = tfield.overlay.offset.x * tfield.hexWidth //+ store_panning.curWorldX()
        let zeroOffsetY = tfield.overlay.offset.y * tfield.hexHeight //+ store_panning.curWorldY()
        

        g.lineStyle(tfield.overlay.style.width, tfield.overlay.style.color);

        for (let bigRow = 0; bigRow < bigRows; bigRow++) {
            for (let bigCol = 0; bigCol < bigCols; bigCol++){

                let bigHexX, bigHexY;

                if (tfield.orientation == hex_orientation.FLATTOP) {
                    bigHexX = bigCol*bigWidth*0.75+zeroOffsetX
                    bigHexY = bigRow*bigHeight - (bigCol%2==1 ? bigHeight/2 : 0) + zeroOffsetY

                } else {

                    bigHexX = bigCol*bigWidth - (bigRow%2==1 ? bigWidth/2 : 0) + zeroOffsetX
                    bigHexY = bigRow*bigHeight*0.75 + zeroOffsetY

                }


                let bigHexPath = getHexPath( bigWidth, bigHeight, tfield.orientation, bigHexX, bigHexY )
                g.drawPolygon(bigHexPath);

            }

        }


    }} />

{/if}


