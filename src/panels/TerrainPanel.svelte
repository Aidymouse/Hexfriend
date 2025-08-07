<script lang="ts">
  import { getHexPath } from '../helpers/hexHelpers'
  import { tiles_match } from '../helpers/tiles'
  import { generate_tile_preview } from '../helpers/tileFns'

  import { get_symbol_texture } from '../lib/texture_loader'

  import type { terrain_data } from '../types/data'
  import type { terrain_field } from '../types/terrain'
  import { HexOrientation } from '../types/terrain'
  import type { Tile, Tileset } from '../types/tilesets'
  import type { Icon } from '../types/icon'

  import { tfield } from '../stores/tfield'
  import { data_overlay, data_terrain } from '../stores/data'
  import { tl } from '../stores/translation'

  import * as PIXI from 'pixi.js'
  import { afterUpdate, onMount } from 'svelte'

  import ColorInputPixi from '../components/ColorInputPixi.svelte'
  import { writable } from 'svelte/store'

  export let loadedTilesets: Tileset[]

  export let app: PIXI.Application

  // Used for previews
  let grph = new PIXI.Graphics()
  let spr = new PIXI.Sprite()
  let cont = new PIXI.Container()
  cont.addChild(grph, spr)

  let tilePreview: string //generateTilePreview($data_terrain);

  export function reset_tile() {
    changeTile(loadedTilesets[0].tiles[0])
  }

  async function changeTile(t: Tile) {
    $data_terrain.tile = {
      ...t,
      symbol: t.symbol ? { ...t.symbol } : null,
    }
    tilePreview = await get_tile_preview()
    $data_terrain.usingPaintbucket = false
    $data_terrain.usingEraser = false
  }

  const update_rotation = (new_rotation: number) => {
    $data_terrain.tile.symbol.rotation = new_rotation
    get_tile_preview().then((preview) => {
      tilePreview = preview
    })
  }

  // TODO: because flat topped hexes are narrower, their images are thinner, so they take up more of the button, because it scales by width. It would be nice if the previews were square images.
  const get_tile_preview = async (): Promise<string> => {
    if (!$data_terrain.tile) return ''

    return generate_tile_preview(
      $data_terrain.tile,
      {
        hexWidth: $tfield.hexWidth,
        hexHeight: $tfield.hexHeight,
        color: new PIXI.Color($data_terrain.tile.bgColor).toHex(),
        orientation: $tfield.orientation,
      },
      spr,
      grph,
      cont,
      app,
    )
  }

  $: {
    if ($data_terrain.genPreview) {
      console.log('Generate New Preview Please')
      get_tile_preview().then((p) => {
        tilePreview = p
      })
      $data_terrain.genPreview = false
    }
  }

  function styleMatchesData(tile: Tile): boolean {
    return tiles_match(tile, $data_terrain.tile)
  }

  afterUpdate(async () => {
    loadedTilesets = loadedTilesets
    $tfield.orientation = $tfield.orientation

    // tilePreview = await get_tile_previews()[$tfield.orientation]
    // console.log(tilePreview)
  })

  onMount(async () => {
    const p = await get_tile_preview()
    tilePreview = p
  })
</script>

<div class="panel">
  <div id="terrain-preview">
    <div id="preview-image-centerer">
      <!-- TODO: throbber -->
      <img
        src={tilePreview}
        alt={'Current Tile Preview'}
        class:flatTop={$tfield.orientation == 'flatTop'}
        class:pointyTop={$tfield.orientation == 'pointyTop'}
      />
    </div>

    <span class="terrain-preview-control-row">
      <ColorInputPixi
        bind:value={$data_terrain.tile.bgColor}
        on:input={() =>
          get_tile_preview().then((previews) => {
            tilePreview = previews
          })}
        id={'terrainColor'}
      />
      <label for="terrainColor">{$tl.terrain_panel.terrain_color}</label>
    </span>

    {#if $data_terrain.tile.symbol}
      <span class="terrain-preview-control-row">
        <ColorInputPixi
          bind:value={$data_terrain.tile.symbol.color}
          on:input={() =>
            get_tile_preview().then((previews) => {
              tilePreview = previews
            })}
          id={'symbolColor'}
        />
        <label for="symbolColor">{$tl.terrain_panel.symbol_color}</label>
      </span>

      <div id="rotation-slider">
        <div style="display: flex; align-items: center;">
          <button
            class="img-button"
            style="height: 2em"
            on:click={() => {
              update_rotation((360 + $data_terrain.tile.symbol.rotation - 60) % 360)
            }}
          >
            <img
              src={`/assets/img/ui/rotate60_left_${$tfield.orientation}.png`}
              alt={$tl.terrain_panel.rotate60_left}
              title={$tl.terrain_panel.rotate60_left}
            />
          </button>
        </div>
        <input
          type="range"
          id="symbol-rotation"
          min={0}
          max={359}
          bind:value={$data_terrain.tile.symbol.rotation}
          on:input={(e) => update_rotation(e.currentTarget.valueAsNumber)}
        />
        <div style="display: flex; align-items: center;">
          <button
            class="img-button"
            style="height: 2em"
            on:click={() => {
              update_rotation(($data_terrain.tile.symbol.rotation + 60) % 360)
            }}
          >
            <img
              src={`/assets/img/ui/rotate60_right_${$tfield.orientation}.png`}
              alt={$tl.terrain_panel.rotate60_right}
              title={$tl.terrain_panel.rotate60_right}
            />
          </button>
        </div>

        <input
          type="number"
          id="symbol-rotation-num"
          min={0}
          max={359}
          bind:value={$data_terrain.tile.symbol.rotation}
          on:input={(e) => update_rotation(e.currentTarget.valueAsNumber)}
        />
      </div>
    {/if}
  </div>

  <div id="buttons" class="scroll-container">
    {#each loadedTilesets as tileset (tileset.id)}
      {#if loadedTilesets.length > 1 || tileset.collapsed}
        <h2 class="tileset-heading">
          {tileset.name}
          <button
            on:click={() => {
              tileset.collapsed = !tileset.collapsed
            }}
            ><img alt="Toggle Tileset Visibility" src={'/assets/img/ui/arrow.png'} class:rotated={tileset.collapsed} />
          </button>
        </h2>
      {/if}
      <div class="button-grid" class:hidden={tileset.collapsed}>
        {#each tileset.tiles as tile (tile.id)}
          <button
            class="tile-button"
            title={tile.display}
            on:click={async () => {
              await changeTile(tile)
            }}
            class:selected={styleMatchesData(tile)}
            ><img src={tile[`preview_${$tfield.orientation}`]} alt={tile.display} /></button
          >
        {/each}
      </div>
    {/each}
  </div>

  <!-- This keeps the selector around. Hacky but... works! -->
  <div class="hidden" />
</div>

<style>
  .terrain-preview-control-row {
    display: flex;
    align-items: center;
    gap: 0.5em;
  }

  .hidden {
    display: none !important;
  }

  .tileset-heading {
    display: flex;
    position: relative;
  }

  .tileset-heading button {
    position: absolute;
    margin: 0.25em;
    margin-bottom: calc(0.25em + 5px);
    box-sizing: border-box;
    right: 0;
    display: flex;
    height: 80%;
    top: 0;
    width: 3em;
    justify-content: center;
    align-items: center;
  }

  .tileset-heading button img {
    height: 100%;
    transition-duration: 0.2s;
  }

  .tileset-heading button img.rotated {
    rotate: -180deg;
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

  #terrain-preview {
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

  #rotation-slider {
    display: flex;
    gap: var(--large-radius);
    grid-column: 1/3;
  }

  #terrain-preview img.flatTop {
    width: 100%;
  }

  #terrain-preview img.pointyTop {
    height: 100%;
  }

  .button-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: auto;
    grid-auto-rows: auto;
    gap: 0.25em;
  }

  #buttons h2 {
    border-color: var(--primary-background);
    margin-bottom: 0.3125em;
    margin-top: 0.625em;
  }

  #buttons {
    background-color: var(--light-background);
    padding: 0.625em;
  }

  #buttons .tile-button {
    aspect-ratio: 1/1;
    box-sizing: border-box;
    padding: 0.3125em;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #buttons .tile-button img {
    width: 90%;
  }
</style>
