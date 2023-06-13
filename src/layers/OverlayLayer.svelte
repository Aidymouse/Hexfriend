<script lang="ts">
    
    import * as PIXI from 'pixi.js';
	import { afterUpdate, onMount } from 'svelte';
    
    import { store_selected_tool } from '../stores/tools';
	import * as store_panning from '../stores/panning';
	import * as store_inputs from '../stores/inputs';
	
    import { store_has_unsaved_changes } from '../stores/flags';

    import type { input_state } from '../types/inputs';
	import type { overlay_data } from '../types/data';
	import type { pan_state } from '../types/panning';
	import { tools } from '../types/toolData';

    export let data_overlay: overlay_data;

    export let cont_overlay: PIXI.Container;

    export let app: PIXI.Application;
    
    // Stores
    let selected_tool: tools;
    store_selected_tool.subscribe(n => selected_tool = n)
    $: { selected_tool = selected_tool }
    
    let pan: pan_state;
    store_panning.store.subscribe((newPan) => {
		pan = newPan;
	});
    
    let controls: input_state;
	store_inputs.store.subscribe((newInputState) => {
		controls = newInputState;
	});

    // Local
    let current_base64 = "";
    let oldX = -1
    let oldY = -1
    let moving_image = false

    let grabbed_handle = null;
    let old_handle_x = -1
    let old_handle_y = -1
    let OG_width = -1
    let OG_height = -1
    let tex_overlay: PIXI.Texture;

    let spr_overlay_image: PIXI.Sprite;    
    let grph_resizer: PIXI.Graphics;
    
    // Initialized in onMount
    let handles = [
        { sprite: null, x: 0, y: 0 },
        { sprite: null, x: 0.5, y: 0 },
        { sprite: null, x: 1, y: 0 },
        { sprite: null, x: 1, y: 0.5 },
        { sprite: null, x: 1, y: 1 },
        { sprite: null, x: 0.5, y: 1 },
        { sprite: null, x: 0, y: 1 },
        { sprite: null, x: 0, y: 0.5 },
    ]

    export function pointermove() {
        if (moving_image) {
            let dX = store_panning.curWorldX() - oldX
            let dY = store_panning.curWorldY() - oldY
            
            data_overlay.x += dX
            data_overlay.y += dY
            
            oldX = store_panning.curWorldX()
            oldY = store_panning.curWorldY()

            $store_has_unsaved_changes = true;
        }

        if (grabbed_handle) {
            let dX = store_panning.curWorldX() - old_handle_x
            let dY = store_panning.curWorldY() - old_handle_y

            let cur_width = spr_overlay_image.width
            let cur_height = spr_overlay_image.height

            let grabbed_corner = grabbed_handle.x % 1 == 0 && grabbed_handle.y % 1 == 0

            let new_width, new_height

            let old_scale = {
                x: spr_overlay_image.width,
                y: spr_overlay_image.height,
            }

            let old_ratio = old_scale.x / old_scale.y
            if (grabbed_handle.x != grabbed_handle.y) old_ratio = old_scale.x / -old_scale.y; // Honestly have no idea why this works, i just randomly negated y and its fine now

            // Ensure ratio stays the same when resizing overlay.
            // Could use a little bit of work to make a bit more responsive (more like how illustrator behaves), but I honestly dont think anyone cares
            if (grabbed_corner) {
                
                if (Math.abs(dX) > Math.abs(dY)) {
                    dY = dX/old_ratio
                } else {
                    dX = dY*old_ratio
                }
            }
            
            // X Transform
            if (grabbed_handle.x != 0.5) {
                new_width = cur_width + (dX * (grabbed_handle.x == 0 ? -1 : 1))
                let new_x_scale = new_width / OG_width           
                data_overlay.scale.x = new_x_scale
                data_overlay.x += dX/2
            }
            // Y Transform
            if (grabbed_handle.y != 0.5) {
                new_height = cur_height + (dY * (grabbed_handle.y == 0 ? -1 : 1))
                let new_y_scale = new_height / OG_height
                data_overlay.scale.y = new_y_scale
                data_overlay.y += dY/2
            }            

            old_handle_x = store_panning.curWorldX();
            old_handle_y = store_panning.curWorldY();
            
            data_overlay = data_overlay

            $store_has_unsaved_changes = true;
        } 


    }

    export function pointerup() {
        handle_released()
    }

    function handle_grabbed(handle) {
        grabbed_handle = handle
        old_handle_x = store_panning.curWorldX()
        old_handle_y = store_panning.curWorldY()
    }

    function handle_released() {
        grabbed_handle = null
        old_handle_x = 0
        old_handle_y = 0
    }
    
    $: { pan = pan }

    afterUpdate(() => {

        if (current_base64 != data_overlay.base64) {

            if (data_overlay.base64 == "") {
                tex_overlay = null
                OG_width = -1
                OG_height = -1

            } else {
                tex_overlay = PIXI.Texture.from(data_overlay.base64)
                OG_width = tex_overlay.width
                OG_height = tex_overlay.height
            }
            
            
            spr_overlay_image.texture = tex_overlay
            current_base64 = data_overlay.base64
        }

        // Update texture width and height
        if (tex_overlay && OG_width != tex_overlay.width) {
            OG_width = tex_overlay.width
            OG_height = tex_overlay.height
        }

        
        spr_overlay_image.visible = data_overlay.shown
        spr_overlay_image.alpha = data_overlay.opacity
        spr_overlay_image.x = data_overlay.x
        spr_overlay_image.y = data_overlay.y        
        spr_overlay_image.scale.x = data_overlay.scale.x
        spr_overlay_image.scale.y = data_overlay.scale.y
        spr_overlay_image.interactive = (selected_tool == tools.OVERLAY)


        // Resizer
        grph_resizer.clear();
        grph_resizer.visible = data_overlay.shown && selected_tool == tools.OVERLAY
        
        grph_resizer.lineStyle(3/pan.zoomScale, 0x333333, 1)
        let resizer_width = spr_overlay_image.width + 10
        let resizer_height = spr_overlay_image.height + 10
        grph_resizer.drawRect(data_overlay.x - resizer_width/2, data_overlay.y - resizer_height/2, resizer_width, resizer_height);
        
        // Resizer Handles
        handles.forEach(handle => {
            
            handle.sprite.visible = selected_tool == tools.OVERLAY && data_overlay.shown
            handle.sprite.x = data_overlay.x - resizer_width/2 + handle.x*resizer_width
            handle.sprite.y = data_overlay.y - resizer_height/2 + handle.y*resizer_height
            handle.sprite.scale.x = 1/pan.zoomScale
            handle.sprite.scale.y = 1/pan.zoomScale
            
        
        })
    })
    
    onMount(() => {
        

        console.log(cont_overlay.children.length)
        cont_overlay.removeChildren(0)
        console.log(cont_overlay.children.length)

        spr_overlay_image = new PIXI.Sprite();
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

        cont_overlay.addChild(spr_overlay_image)
        
        grph_resizer = new PIXI.Graphics();
        cont_overlay.addChild(grph_resizer)

        // Generate handle texture
        let handle_texture = PIXI.Texture.from("/assets/img/ui/resize_handle.png")

        // Update handle sprites
        handles.forEach(handle => {
            
            handle.sprite = new PIXI.Sprite();
            cont_overlay.addChild(handle.sprite)
            handle.sprite.texture = handle_texture;
            handle.sprite.anchor.x = 0.5
            handle.sprite.anchor.y = 0.5
            handle.sprite.interactive = true
            handle.sprite.visible = false
            handle.sprite.on("pointerdown", () => { handle_grabbed(handle) } )
        
        })
        console.log(cont_overlay.children.length)
    })

</script>