export const initCanvas = () => {
  globalThis.ctx = (document.getElementById('main-canvas') as HTMLCanvasElement).getContext('2d');

  ctx.strokeRect(50, 50, 200, 200);


}
