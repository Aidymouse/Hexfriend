<script lang="ts">
  import * as PIXI from 'pixi.js'
  import { generate_icon_preview, generate_ordered_icon_preview } from '../../helpers/iconFns'
  import { HexOrientation } from '../../types/terrain'
  import { load_icon_texture } from '../../lib/texture_loader'
  import { type Iconset } from '../../types/icon'
  import { testIconset } from './testiconsetfaces'
  import { get_radius_from_width_height, get_width_height_from_radius } from '../../helpers/hexHelpers'
  import { ScaleMode } from '../../helpers/imageSizing'

  const app = new PIXI.Application()
  const cont = new PIXI.Container()
  const grph = new PIXI.Graphics()
  const spr = new PIXI.Sprite()
  //app.appendChild(cont)
  //cont.setParent(app)
  app.stage.addChild(cont)
  cont.addChild(grph)
  cont.addChild(spr)

  let phex: number = 100
  let rot: number = 0
  let hexInfo = { hexHeight: 45 * 2, hexWidth: 50 * 2, orientation: HexOrientation.FLATTOP, color: '#f2f2f2' }
  let imgs = []
  let dualImgs = []

  let pHor = 100
  let pVert = 100

  const genPreviews = () => {
    const previewPromises = testIconset.icons.map(
      (i) =>
        new Promise(async (res, rej) => {
          const preview = await generate_icon_preview({ ...i, pHex: phex, rotation: rot }, hexInfo, grph, spr, cont, app)
          res(preview)
        }),
    )
    Promise.allSettled(previewPromises).then((ps) => {
      imgs = []
      for (const p of ps) {
        if (p.status === 'fulfilled') {
          imgs.push(p.value)
        }
      }
      imgs = imgs
    })
    const dualPromises = testIconset.icons.map(
      (i) =>
        new Promise(async (res, rej) => {
          const preview = await generate_icon_preview(
            { ...i, scaleMode: ScaleMode.BYDIMENSION, pWidth: pHor, pHeight: pVert, rotation: rot },
            hexInfo,
	    grph,
	    spr,
	    cont,
	    app
          )
          res(preview)
        }),
    )
    Promise.allSettled(dualPromises).then((ps) => {
      dualImgs = []
      for (const p of ps) {
        if (p.status === 'fulfilled') {
          dualImgs.push(p.value)
        }
      }
      dualImgs = dualImgs
    })
  }

  const load = async () => {
    for (const icon of testIconset.icons) {
      await load_icon_texture(icon.texId, icon.base64)
    }

    genPreviews()
  }

  load()
</script>

<div style="width: 800px; height: 200px; display: flex; align-items: center; justify-content: center; gap: 50px">
  {#each imgs as i, index}
    <img src={i} />
  {/each}
</div>
<div style="width: 800px; height: 200px; display: flex; align-items: center; justify-content: center; gap: 50px">
  {#each dualImgs as i, index}
    <img src={i} />
  {/each}
</div>

<div
  style="width: 800px; display: flex; align-items: center; justify-content: center; background-color: #444444; border-radius: var(--small-radius)"
>
  <div style="width: 300px">
    <div style="display: flex">
      Rotation
      <input type="range" id="icon-rotation" min={0} max={359} bind:value={rot} on:input={genPreviews} />
      <input type="number" bind:value={rot} on:input={genPreviews} style="width: 4em" /> deg
    </div>

	<hr />

    <div style="display: flex">
      Phex
      <input type="range" id="icon-phex" min={0} max={100} bind:value={phex} on:input={genPreviews} />
      {phex}%
    </div>

    <hr />

    <div style="display: flex">
      Icon P Width
      <input
        type="range"
        id="icon-pwidth"
        min={0}
        max={100}
        bind:value={pHor}
        on:input={(e) => {
          genPreviews()
        }}
      />
      {pHor}%
    </div>

    <div style="display: flex">
      Icon P Height
      <input
        type="range"
        id="icon-pheight"
        min={0}
        max={100}
        bind:value={pVert}
        on:input={(e) => {
          genPreviews()
        }}
      />
      {pVert}%
    </div>
	<hr />

    <div style="display: flex">
      Hex Width
      <input type="range" id="icon-hexwidth" min={0} max={100} bind:value={hexInfo.hexWidth} on:input={genPreviews} />
      {hexInfo.hexWidth}
    </div>

    <div style="display: flex">
      Hex Height
      <input type="range" id="icon-hexheight" min={0} max={100} bind:value={hexInfo.hexHeight} on:input={genPreviews} />
      {hexInfo.hexHeight}
    </div>

    <button
      on:click={() => {
        hexInfo = {
          ...hexInfo,
          hexWidth: hexInfo.hexHeight,
          hexHeight: hexInfo.hexWidth,
          orientation:
            hexInfo.orientation === HexOrientation.FLATTOP ? HexOrientation.POINTYTOP : HexOrientation.FLATTOP,
        }

        genPreviews()
      }}>{hexInfo.orientation}</button
    >

    <button
      on:click={() => {
        const dims =
          hexInfo.orientation === HexOrientation.FLATTOP
            ? get_width_height_from_radius(hexInfo.hexWidth / 2, hexInfo.orientation)
            : get_width_height_from_radius(hexInfo.hexHeight / 2, hexInfo.orientation)
        hexInfo = {
          ...hexInfo,
          hexWidth: dims.width,
          hexHeight: dims.height,
        }

        genPreviews()
      }}>Turn to Perfect Hex</button
    >

  </div>
</div>
