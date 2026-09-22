export const initCanvas = () => {
  globalThis.ctx = (document.getElementById('main-canvas') as HTMLCanvasElement).getContext('2d');

  fitCanvasToWindow()

  window.addEventListener('resize', fitCanvasToWindow)
}

/* Runs on resize event listener to make sure canvas is always the full size of the window */
const fitCanvasToWindow = () => {
  const { width, height } = document.getElementById('full-size').getBoundingClientRect();

  document.getElementById('main-canvas').setAttribute('width', `${width}`);
  document.getElementById('main-canvas').setAttribute('height', `${height}`)
}

/* Debug method */
const drawCheckerboard = (size: number) => {
  globalThis.ctx.clearRect(0, 0, 100000, 100000)

  const { width, height } = document.getElementById('main-canvas').getBoundingClientRect(); 

  for (let col=0; col<height/size; col+=1) {
    for (let row=0; row < width/size; row+=2) {

      if (col % 2 === 1 && row===0) {
	row += 1
      }

      globalThis.ctx.fillRect(row*size,col*size,size,size)
    }
  }

  // requestAnimationFrame(() => {
  //   drawCheckerboard(size-0.05)
  // }) 


}
