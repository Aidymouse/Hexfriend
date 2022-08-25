import * as PIXI from 'pixi.js';
import type { terrain_field } from '../types/terrain';
import { map_shape } from '../types/settings';
import { get, writable } from 'svelte/store';

import * as store_tfield from './tfield';

import type { pan_state } from '../types/panning';

let tfield: terrain_field;
store_tfield.store.subscribe(newTField => {
    tfield = newTField;
})

export let store = writable({
    panning: false,
    
    oldX: 0,
    oldY: 0,
    
    offsetX: window.innerWidth / 2,
    offsetY: window.innerHeight / 2,
    
    screenX: 0,
    screenY: 0,
    
    zoomScale: 1
})


function worldX(state: pan_state): number {
    return (state.screenX - state.offsetX) / state.zoomScale;
}

function worldY(state: pan_state): number {
    return (state.screenY - state.offsetY) / state.zoomScale;
}

export function curWorldX(): number {
    return (worldX(get(store)));
}

export function curWorldY(): number {
    return (worldY(get(store)));
}

export const handlers = {
    startPan: function (e: PointerEvent) {
        store.update((pan: pan_state): pan_state => {
            pan.panning = true;
            pan.oldX = e.clientX;
            pan.oldY = e.clientY;

            return pan;
        });
    },
    
    handle: function (e: PointerEvent) {
        store.update((pan: pan_state): pan_state => {
            pan.screenX = e.clientX;
            pan.screenY = e.clientY;
        
            if (pan.panning) {
                pan.offsetX += e.clientX - pan.oldX;
                pan.offsetY += e.clientY - pan.oldY;
        
                pan.oldX = e.clientX;
                pan.oldY = e.clientY;
            }

            return pan;
        });
    },
    
    endPan: function () {
        store.update((pan: pan_state): pan_state => {
            pan.panning = false;
            
            return pan;
        });
    },
    
    zoom: function (e: WheelEvent) {
        store.update((pan: pan_state): pan_state => {
            
            let xBeforeZoom = worldX(pan);
            let yBeforeZoom = worldY(pan);
        
            let zoomFactor = 1.15;
            if (e.deltaY < 0) {
                pan.zoomScale *= zoomFactor;
            } else {
                pan.zoomScale /= zoomFactor;
            }
        
            // Control max zoom with different map shapes
            let calcColumns
            let calcRows

            if (tfield.mapShape == map_shape.SQUARE) {
                calcColumns = tfield.columns;
                calcRows = tfield.rows;
            } else if (tfield.mapShape == map_shape.FLOWER) {
                calcColumns = tfield.hexesOut*2
                calcRows = tfield.hexesOut*2
            }

            // controls how far you can zoom out (smaller number is farther out)
            let minZoom = (window.innerWidth + window.innerHeight) / 2;
            minZoom /= ((tfield.hexWidth + tfield.hexHeight) / 2) * ((calcColumns + calcRows) / 2) * 2;
            if (pan.zoomScale < minZoom) {
                pan.zoomScale = minZoom;
            }
            // controls how far you can zoom in (bigger number is closer in)
            let maxZoom = (window.innerWidth + window.innerHeight) / 2;
            // TODO: use tile size
            // maxZoom /= 100 * 2;
            maxZoom /= ((tfield.hexWidth + tfield.hexHeight) / 2) * 4;
            if (maxZoom < pan.zoomScale) {
                pan.zoomScale = maxZoom;
            }
        
            // Move the screen
            let xAfterZoom = worldX(pan);
            let yAfterZoom = worldY(pan);
        
            let dx = (xAfterZoom - xBeforeZoom) * pan.zoomScale;
            let dy = (yAfterZoom - yBeforeZoom) * pan.zoomScale;
        
            pan.offsetX += dx;
            pan.offsetY += dy;

            return pan;
        });
    }
}
