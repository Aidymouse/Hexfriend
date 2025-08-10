import type { pan_state } from '../types/panning';
import { map_shape } from '../types/settings';
import type { terrain_field } from '../types/terrain';

import { tfield } from './tfield';

import * as PIXI from 'pixi.js';
import { get, writable } from 'svelte/store';

export let store = writable({
	panning: false,

	oldX: 0,
	oldY: 0,

	offsetX: window.innerWidth / 2,
	offsetY: window.innerHeight / 2,

	screenX: 0,
	screenY: 0,

	zoomScale: 1,
});

function worldX(state: pan_state): number {
	return (state.screenX - state.offsetX) / state.zoomScale;
}

function worldY(state: pan_state): number {
	return (state.screenY - state.offsetY) / state.zoomScale;
}

export function curWorldX(): number {
	return worldX(get(store));
}

export function curWorldY(): number {
	return worldY(get(store));
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

			// Cap Zoom
			let max_zoom_out = 0.1;
			let max_zoom_in = 500;

			pan.zoomScale = Math.max(pan.zoomScale, max_zoom_out);
			pan.zoomScale = Math.min(pan.zoomScale, max_zoom_in);			

			// Move the screen
			let xAfterZoom = worldX(pan);
			let yAfterZoom = worldY(pan);

			let dx = (xAfterZoom - xBeforeZoom) * pan.zoomScale;
			let dy = (yAfterZoom - yBeforeZoom) * pan.zoomScale;

			pan.offsetX += dx;
			pan.offsetY += dy;

			return pan;
		});
	},
};



/*

// Control max zoom with different map shapes
let calcColumns;
let calcRows;

if (get(tfield).mapShape == map_shape.SQUARE) {
	calcColumns = get(tfield).columns;
	calcRows = get(tfield).rows;
} else if (get(tfield).mapShape == map_shape.FLOWER) {
	calcColumns = get(tfield).hexesOut * 2;
	calcRows = get(tfield).hexesOut * 2;
}

// controls how far you can zoom out (smaller number is farther out)
let minZoom = (window.innerWidth + window.innerHeight) / 2;
minZoom /= ((get(tfield).hexWidth + get(tfield).hexHeight + get(tfield).grid.gap) / 2) * ((calcColumns + calcRows) / 2) * 2;
maxZoom = 0.01;
if (pan.zoomScale < minZoom) {
	pan.zoomScale = minZoom;
}
// controls how far you can zoom in (bigger number is closer in)
let maxZoom = (window.innerWidth + window.innerHeight) / 2;
// maxZoom /= 100 * 2;
maxZoom /= ((get(tfield).hexWidth + get(tfield).hexHeight + get(tfield).grid.gap) / 2) * 4;

maxZoom = 0.1;

if (maxZoom < pan.zoomScale) {
	pan.zoomScale = maxZoom;
}

*/
