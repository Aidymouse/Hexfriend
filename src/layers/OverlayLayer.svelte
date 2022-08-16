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

        let ratio = tfield.hexWidth / tfield.hexHeight

        let bigHeight = tfield.hexHeight * tfield.overlay.diameterInHexes
        let bigWidth = bigHeight * ratio

        let bigRows = Math.round(tfield.rows/tfield.overlay.diameterInHexes)
        
        let horizontalSpan = bigWidth / tfield.hexWidth
        let bigCols = Math.round( tfield.columns / horizontalSpan )

        let zeroOffsetX = tfield.overlay.offset.x * tfield.hexWidth //+ store_panning.curWorldX()
        let zeroOffsetY = tfield.overlay.offset.y * tfield.hexHeight //+ store_panning.curWorldY()
        

        g.lineStyle(tfield.overlay.style.width, tfield.overlay.style.color);

        for (let bigRow = 0; bigRow < bigRows; bigRow++) {
            for (let bigCol = 0; bigCol < bigCols; bigCol++){

                let bigHexX = bigCol*bigWidth*0.75+zeroOffsetX
                let bigHexY = bigRow*bigHeight - (bigCol%2==1 ? bigHeight/2 : 0) + zeroOffsetY

                let bigHexPath = getHexPath( bigWidth, bigHeight, orientation, bigHexX, bigHexY )
                g.drawPolygon(bigHexPath);

            }

        }


    }} />

{/if}


