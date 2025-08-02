<script lang="ts">
  import type { icon_data } from '../types/data'
  import type { Icon, Iconset } from '../types/icon'
  import type { terrain_field } from '../types/terrain'
  import type { PreviewHexInfo } from '../helpers/iconFns'
  import { ScaleMode } from '../helpers/imageSizing'

  import ColorInputPixi from '../components/ColorInputPixi.svelte'
  import { getHexPath } from '../helpers/hexHelpers'
  import { get_icon_texture } from '../lib/texture_loader'
  import * as PIXI from 'pixi.js'
  import { afterUpdate, onMount } from 'svelte'
  import { generate_icon_preview } from '../helpers/iconFns'

  import { tfield } from '../stores/tfield'
  import { data_icon, data_terrain } from '../stores/data'
  import { tl } from '../stores/translation'
  import Alert from '../components/Alert.svelte'

  export let loadedIconsets: Iconset[]
  export let app: PIXI.Application

  let iconPreview: string 

  let spr_preview = new PIXI.Sprite()
  let grph_preview = new PIXI.Graphics()
  let cont_preview = new PIXI.Container()
  cont_preview.addChild(grph_preview, spr_preview)

  function get_icon_preview(icon: Icon) {
    return generate_icon_preview(icon, hex_info, grph_preview, spr_preview, cont_preview, app)
  }

  let hex_info: PreviewHexInfo
  tfield.subscribe((n) => {
    hex_info = {
      color: PIXI.utils.hex2string(n.blankHexColor),
      hexHeight: n.hexHeight,
      hexWidth: n.hexWidth,
      orientation: n.orientation
    }

    get_icon_preview($data_icon.icon).then(p => iconPreview = p); // Needed?
  })

  function selectIcon(iconData: Icon) {
    $data_icon.icon = {...iconData}
    $data_icon.usingEraser = false
  }


  function iconMatchesData(icon: Icon): boolean {
    if ($data_icon.icon.color != icon.color) return false
    if ($data_icon.icon.texId != icon.texId) return false
    // TODO: rotation?
    return true
  }

  afterUpdate(() => {
    loadedIconsets = loadedIconsets
    $tfield.orientation = $tfield.orientation
    get_icon_preview($data_icon.icon).then(p => iconPreview = p)
  })

  onMount(async () => {
    //iconPreview = await getIconPreview(data_icon);
  })
</script>

<div class="panel">
  <div id="icon-preview">
    <div id="preview-image-centerer">
      <img
        src={iconPreview}
        alt={'Icon Preview'}
        class:flatTop={$tfield.orientation == 'flatTop'}
        class:pointyTop={$tfield.orientation == 'pointyTop'}
      />
    </div>

    <span class="icon-preview-control-row">
      <ColorInputPixi bind:value={$data_icon.icon.color} id={'iconPanelColor'} />
      <label for="iconPanelColor">{$tl.icon_panel.icon_color}</label>
    </span>

    <span class="icon-preview-control-row">
      {#if ($data_icon.icon.scaleMode ?? ScaleMode.RELATIVE) === ScaleMode.RELATIVE}
	<input type="range" id="iconSize" min={10} max={100} bind:value={$data_icon.icon.pHex} />
	<button class="outline-button">{$tl.general.reset}</button >
      {/if}
    </span>

    <div id="rotation-slider">
      <div style="display: flex; align-items: center;">
	<button class="img-button" style="height: 2em" on:click={() => { $data_icon.icon.rotation = (360 + $data_icon.icon.rotation-60) % 360 }}>
	  <img src={`/assets/img/ui/rotate60_left_${'ft'}.png`} alt="<-" title={$tl.icon_panel.rotate60_left}>
	</button>
      </div>
      <input type="range" id="icon-rotation" min={0} max={359} bind:value={$data_icon.icon.rotation} />
      <div style="display: flex; align-items: center;">
	<button class="img-button" style="height: 2em" on:click={() => { $data_icon.icon.rotation = ($data_icon.icon.rotation+60)%360 }}>
	  <img src={`/assets/img/ui/rotate60_right_${'ft'}.png`} alt="->" title={$tl.icon_panel.rotate60_right}>
	</button>
      </div>
      <input 
	type="number"
	id="icon-rotation-num"
	min={0}
	max={359}
	bind:value={$data_icon.icon.rotation}
	on:change={() => $data_icon.icon.rotation = $data_icon.icon.rotation % 360}
      />
    </div>
  </div>

  <div id="buttons" class="scroll-container">
    {#each loadedIconsets as iconset (iconset.id)}
      {#if loadedIconsets.length > 1 || iconset.collapsed}
        <h2 class="iconset-heading">
          {iconset.name}
          <button
            on:click={() => {
              iconset.collapsed = !iconset.collapsed
            }}
            ><img
              class:rotated={iconset.collapsed}
              alt="Toggle Iconset Visibility"
              src={'/assets/img/ui/arrow.png'}
            /></button
          >
        </h2>
      {/if}

      {#if !iconset.collapsed && iconset.supported_orientations !== 'both' && $tfield.orientation !== iconset.supported_orientations}
	<Alert severity="warn">{$tl.icon_panel.support_warnings[iconset.supported_orientations]}</Alert>
      {/if}

      <div class="button-grid" class:hidden={iconset.collapsed}>
        {#each iconset.icons as iconData}
          <button
            class="icon-button"
            class:selected={iconMatchesData(iconData)}
            on:click={() => {
              selectIcon(iconData)
            }}
            title={iconData.display}
          >
            <img src={iconData.preview} alt={iconData.display} />
          </button>
        {/each}
      </div>
    {/each}

    <!-- This keeps the selector around. Hacky but... works! -->
    <div class="hidden" />
  </div>
</div>

<style>
  .hidden {
    display: none !important;
  }

  .iconset-heading:first-of-type {
    margin-top: 0;
  }

  .iconset-heading {
    display: flex;
    position: relative;
    align-items: center;

    border-color: var(--primary-background);
    margin-bottom: 0.25em;
    margin-top: 0.25em;
  }

  .iconset-heading button {
    position: absolute;
    box-sizing: border-box;
    display: flex;
    top: 0;
    right: 0;
    height: 2em;
    width: 3em;
    justify-content: center;
    align-items: center;
    background-color: transparent;
  }

  .iconset-heading button:hover {
    background-color: var(--primary-background);
  }

  .iconset-heading button img {
    height: 100%;
    transition-duration: 0.2s;
  }

  .iconset-heading button img.rotated {
    rotate: -180deg;
  }

  .icon-preview-control-row {
    display: flex;
    align-items: center;
    gap: 0.5em;
  }

  .panel {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .scroll-container {
    min-height: 30%;
    max-height: 100%;
    height: auto;
    overflow-y: scroll;
  }

  div {
    color: var(--text);
  }

  #rotation-slider {
    width: 100%;
    grid-column: 1/3;
    display: flex;
    gap: var(--large-radius);
  }

  #icon-preview {
    display: grid;
    grid-template-columns: 4em 1fr;
    grid-template-rows: 2em 2em;
    gap: 0.5em;
    background-color: var(--primary-background);
    padding: 1em;
  }

  #preview-image-centerer {
    grid-row: 1/3;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #icon-preview img.flatTop {
    width: 100%;
  }

  #icon-preview img.pointyTop {
    height: 100%;
  }

  #buttons {
    background-color: var(--light-background);
    padding: 0.625em;
  }

  .button-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: auto;
    grid-auto-rows: auto;
    gap: 0.25em;
  }

  #buttons .icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1/1;
  }

  .icon-button img {
    width: 90%;
    height: auto;
  }
</style>
