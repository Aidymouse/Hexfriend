export interface pan_state {
	panning: boolean;

	oldX: number;
	oldY: number;

	offsetX: number; //window.innerWidth / 2,
	offsetY: number; //window.innerHeight / 2,

	screenX: number;
	screenY: number;

	zoomScale: number;
}
