<script lang="ts">
import { getHexPath } from '../helpers/hexHelpers';

    import { hex_orientation, terrain_field } from '../types/terrain';

    import { Graphics } from 'svelte-pixi';
    import * as store_tfield from '../stores/tfield';
    import * as PIXI from 'pixi.js';

    
    let tfield: terrain_field;
	store_tfield.store.subscribe(newTField => {
        tfield = newTField
	})
    
    let orientation: hex_orientation = hex_orientation.FLATTOP

    let diameterInHexes = 3

    let style = new PIXI.LineStyle()

</script>

{#if tfield.grid.overlay}

    <Graphics draw={(g) => {

        g.clear()

        let ratio = tfield.hexWidth / tfield.hexHeight

        let bigHeight = tfield.hexHeight * diameterInHexes
        let bigWidth = bigHeight * ratio

        let bigHexPath = getHexPath( bigWidth, bigHeight, orientation, 0, 0 )

        g.lineStyle(2, 0xff0000);
        g.drawPolygon(bigHexPath);

    }} />

{/if}


