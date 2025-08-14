<!-- Wrapper for controls that handle a preview hex controls -->

<script lang="ts">
  import { type PreviewHexInfo } from '../helpers/iconFns'
  import ColorInput from './ColorInput.svelte'
  import * as PIXI from 'pixi.js'
  import { DEFAULT_BLANK_HEX_COLOR } from '../types/defaults'
  import { tl } from '../stores/translation'

  export let preview_hex_info: PreviewHexInfo

  console.log($tl.preview_hex_controls)
  // TODO: add set by radius
</script>

<label for="hex-width">{$tl.settings.hexes.width}</label>
<input id="hex-width" type="number" bind:value={preview_hex_info.hexWidth} />
<label for="hex-height">{$tl.settings.hexes.height}</label>
<input id="hex-height" type="number" bind:value={preview_hex_info.hexHeight} />
<label for="hex-color">{$tl.preview_hex_controls.color}</label>
<div style="display: flex; gap: 0.5em">
  <ColorInput name="hex-color" bind:value={preview_hex_info.color} />
  <button
    on:click={() => {
      preview_hex_info.color = new PIXI.Color(DEFAULT_BLANK_HEX_COLOR).toHex()
    }}
  >
    Reset
  </button>
</div>

<style>
  input {
    height: 2em;
    border-radius: var(--small-radius);
  }

  label {
    height: 100%;
    display: flex;
    align-items: center;
  }
</style>
