<script lang="ts">
    
    import * as PIXI from 'pixi.js';
	import { afterUpdate } from 'svelte';
    
    import { store_selected_tool } from '../stores/tools';
	import * as store_panning from '../stores/panning';
	
    import type { shortcut_data } from '../types/inputs';
	import type { overlay_data } from '../types/data';
	import type { pan_state } from '../types/panning';
	import { tools } from '../types/toolData';

    export let data_overlay: overlay_data;

    export let cont_overlay: PIXI.Container;
    
    // Stores
    let selected_tool: tools;
    store_selected_tool.subscribe(n => selected_tool = n)
    $: { selected_tool = selected_tool }
    
    let pan: pan_state;
    store_panning.store.subscribe((newPan) => {
		pan = newPan;
	});
    
    // Local
    let current_base64 = "";
    let oldX = -1
    let oldY = -1
    let moving_image = false

    let spr_overlay_image = new PIXI.Sprite();
    spr_overlay_image.anchor.x = 0.5
    spr_overlay_image.anchor.y = 0.5
    spr_overlay_image.on("pointerdown", () => { 
        console.log("Overlay Down")
        oldX = store_panning.curWorldX()
        oldY = store_panning.curWorldY()
        moving_image = true
    } )
    spr_overlay_image.on("pointerup", () => {
        moving_image = false
    })
    cont_overlay.addChild(spr_overlay_image);

    export function pointermove() {
        if (moving_image) {
            let dX = store_panning.curWorldX() - oldX
            let dY = store_panning.curWorldY() - oldY
            
            data_overlay.x += dX
            data_overlay.y += dY
            
            oldX = store_panning.curWorldX()
            oldY = store_panning.curWorldY()
        }

    }
    

    afterUpdate(async () => {
        if (current_base64 != data_overlay.base64) {
            let new_texture = await PIXI.Texture.from(data_overlay.base64)
            spr_overlay_image.texture = new_texture
            current_base64 = data_overlay.base64
        }

        //console.log(data_overlay)

        spr_overlay_image.visible = data_overlay.shown
        spr_overlay_image.alpha = data_overlay.opacity
        spr_overlay_image.x = data_overlay.x
        spr_overlay_image.y = data_overlay.y
        spr_overlay_image.scale.x = data_overlay.scale
        spr_overlay_image.scale.y = data_overlay.scale

        spr_overlay_image.interactive = (selected_tool == tools.OVERLAY)
        
    })

</script>