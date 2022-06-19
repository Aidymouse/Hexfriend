<script lang="ts">

    import { Sprite } from 'svelte-pixi'
    import { coords_worldToCube, coords_cubeToWorld } from '../helpers/hexHelpers';

    export let icons = [];

    export let L
    export let pan
    export let tfield
    export let selectedTool
    export let controls

    export let data_icon;
    
    let iconId: number = 0;
    icons.forEach(i => iconId = Math.max(iconId, i.id))
    iconId++

    $: {
        // Ideally, this would only trigger on a load. It can trigger on any update for now though...
        icons.forEach(i => iconId = Math.max(iconId, i.id))
        iconId++
    }

    function getIconScale() {
        let scale: number;
        if (tfield.hexWidth < tfield.hexHeight) {
            scale = tfield.hexWidth * (data_icon.pHex/100) / L.resources[data_icon.texId].texture.width;

        } else {
            scale = tfield.hexHeight * (data_icon.pHex/100) / L.resources[data_icon.texId].texture.height;
        
        }

        return scale

    }

    export function newIcon() {
        
        let iconX = pan.worldX
        let iconY = pan.worldY
        
        if (data_icon.snapToHex) {
            let clickedHexCoords = coords_worldToCube(pan.worldX, pan.worldY, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised); 
            let iconCoords = coords_cubeToWorld(clickedHexCoords.q, clickedHexCoords.r, clickedHexCoords.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised)
            iconX = iconCoords.x
            iconY = iconCoords.y
        } 

        icons.push({x: iconX, y: iconY, color: data_icon.color, scale: getIconScale(), id: iconId, texId: data_icon.texId})
        iconId++
        icons=icons
    }

    function deleteIcon(icon) {
        let iconIndex = icons.indexOf(icon)
        icons.splice(iconIndex, 1)
        icons = icons
    }

    export function pointerdown() {
        if (data_icon.usingEraser) {
            return
        }

        newIcon()

    }

</script>


{#each icons as icon (icon.id)}
    <Sprite 
        texture={L.resources[icon.texId].texture}
        x={icon.x}
        y={icon.y}
        tint={icon.color}
        anchor={{x: 0.5, y: 0.5}}
        scale={{x: icon.scale, y: icon.scale}}
        interactive={ selectedTool == "eraser" || data_icon.usingEraser }
        on:pointerdown={ e => { deleteIcon(icon) } }
        on:pointerover={ e => { if (controls.mouseDown[0]) deleteIcon(icon) } }
    />
{/each}