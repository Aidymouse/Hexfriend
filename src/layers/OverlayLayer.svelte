<script lang="ts">
import { getHexPath } from '../helpers/hexHelpers';

    import { hex_orientation, terrain_field } from '../types/terrain';

    import { Graphics } from 'svelte-pixi';
    import * as store_tfield from '../stores/tfield';

    
    let tfield: terrain_field;
	store_tfield.store.subscribe(newTField => {
        tfield = newTField
	})
    
    let orientation: hex_orientation = hex_orientation.FLATTOP

    let diameterInHexes = 3

</script>

{#if tfield.grid.overlay}

    <Graphics draw={(g) => {

        g.clear()

        let ratio = tfield.hexWidth / tfield.hexHeight

        let bigHeight = tfield.hexHeight * diameterInHexes
        let bigWidth = bigHeight * ratio

        
        g.lineStyle(tfield.grid.overlayStyle.width, tfield.grid.overlayStyle.color);
        for (let i = 0; i<Math.round(tfield.rows/diameterInHexes); i++) {
            let bigHexPath = getHexPath( bigWidth, bigHeight, orientation, 0, i*bigHeight )

            g.drawPolygon(bigHexPath);
        }


    }} />

{/if}


