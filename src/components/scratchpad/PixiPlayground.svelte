<script lang="ts">
  import * as PIXI from 'pixi.js'

  import CanvasHolder from '../CanvasHolder.svelte'
  import { type PreviewHexInfo } from '../../helpers/iconFns'

  const hex: PreviewHexInfo = {
    hexWidth: 100,
    hexHeight: 87 * 2,
    orientation: HexOrientation.FLATTOP,
    color: '#f2f2f2',
  }

  import { getHexPath } from '../../helpers/hexHelpers'
  import { HexOrientation } from '../../types/terrain'
  const App = new PIXI.Application()

  const grph = new PIXI.Graphics()

  grph.beginFill('#f2f2f2')
  //grph.drawRect(0, 0, 100, 100);

  const cont_g = new PIXI.Container()

  App.stage.addChild(cont_g)

  const t = PIXI.Texture.from('/assets/img/scratchpad/Page 2.png')

  const p = getHexPath(hex.hexWidth, hex.hexHeight, hex.orientation, 100, 100)

  grph.drawPolygon(p)

  const spr = new PIXI.Sprite(t)
  spr.position.set(100, 100)
  spr.anchor.x = 0.5
  spr.anchor.y = 0.5

  spr.angle = 60
  spr.scale.y = 2

  App.stage.addChild(grph)
  App.stage.addChild(spr)

  //cont_g.addChild(grph);

  //cont_g.scale.x = 2;

  //grph.rotation = PIXI.DEG_TO_RAD * 10;
  //grph.anchor.x = 0.5;
</script>

<CanvasHolder app={App} />
