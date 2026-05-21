<script lang="ts">
  import '../../styles/settings.css'

  import { map_shape } from '../../types/settings'
  import { HexOrientation } from '../../types/terrain'

  import { tfield } from '../../stores/tfield'
  import { store_has_unsaved_changes } from '../../stores/flags'
  import { tl } from '../../stores/translation'

  import TerrainLayer from '../../layers/TerrainLayer.svelte'
  import IconLayer from '../../layers/IconLayer.svelte'
  import PathLayer from '../../layers/PathLayer.svelte'
  import TextLayer from '../../layers/TextLayer.svelte'
  import { completeUndoState, startUndoState } from '../../lib'
  import { type SaveData, type UndoData } from '../../types'

  import { getShiftForSquareExpansion } from '../../helpers'
  import { getHexGridParams } from '../../helpers/hexHelpers'
  export let comp_terrainLayer: TerrainLayer
  export let comp_iconLayer: IconLayer
  export let comp_pathLayer: PathLayer
  export let comp_textLayer: TextLayer

  export let loaded_save: SaveData

  let addOrRemoveMapDimensions: 'add' | 'remove' = 'add'

  function square_expandMapDimension(direction: 'left' | 'top' | 'right' | 'bottom', amount: number) {

    let undoBefore: UndoData = {
	TerrainField: {hexes: $tfield.hexes, rows: $tfield.rows, columns: $tfield.columns},
    }
    if (direction === 'top' || direction === 'left') {
      const shift = getShiftForSquareExpansion(direction, amount, getHexGridParams($tfield))
      undoBefore.icons = loaded_save.icons
      undoBefore.paths = loaded_save.paths
      undoBefore.texts = loaded_save.texts
      comp_iconLayer.moveAllIcons(shift.x_shift, shift.y_shift)
      comp_pathLayer.moveAllPaths(shift.x_shift, shift.y_shift)
      comp_textLayer.moveAllTexts(shift.x_shift, shift.y_shift)
    }

    startUndoState(undoBefore, `Expand Square Map by ${amount}`)

    comp_terrainLayer.square_expandMapDimension(direction, amount)

    let undoAfter: UndoData = {
	TerrainField: {hexes: $tfield.hexes, rows: $tfield.rows, columns: $tfield.columns},
    }
    if (direction === 'top' || direction === 'left') {
      undoAfter.icons = loaded_save.icons
      undoAfter.paths = loaded_save.paths
      undoAfter.texts = loaded_save.texts
    }  

    completeUndoState(undoAfter)

    $store_has_unsaved_changes = true
  }

  function square_reduceMapDimension(direction, amount) {
    if (direction == 'left' || direction == 'right') {
      if ($tfield.columns <= amount) amount = $tfield.columns - 1
      if (amount == 0) return
    }

    if (direction == 'top' || direction == 'bottom') {
      if ($tfield.rows <= amount) amount = $tfield.rows - 1
      if (amount == 0) return
    }


    let xMod = 0
    let yMod = 0

    switch (direction) {
      case 'left': {
        if ($tfield.orientation == HexOrientation.FLATTOP) {
          xMod = -$tfield.hexWidth * 0.75 * amount

          if (amount % 2 == 1) {
            yMod = -$tfield.hexHeight * 0.5 * ($tfield.raised == 'odd' ? -1 : 1)
          }
        } else {
          xMod = -$tfield.hexWidth * amount
        }
        break
      }

      case 'top': {
        if ($tfield.orientation == HexOrientation.FLATTOP) {
          yMod = -$tfield.hexHeight * amount
        } else {
          yMod = -$tfield.hexHeight * 0.75 * amount

          if (amount % 2 == 1) {
            xMod = -$tfield.hexWidth * 0.5 * ($tfield.raised == 'odd' ? -1 : 1)
          }
        }
        break
      }
    }

    if (xMod !== 0 || yMod !== 0) {
      comp_iconLayer.moveAllIcons(xMod, yMod)
      comp_pathLayer.moveAllPaths(xMod, yMod)
      comp_textLayer.moveAllTexts(xMod, yMod)
    } 
    comp_terrainLayer.square_reduceMapDimension(direction, amount)

    $store_has_unsaved_changes = true
  }

  function flower_expandHexesOut(amount: number) {
    comp_terrainLayer.flower_expandHexesOut(amount)
  }

  function flower_reduceHexesOut(amount: number) {
    comp_terrainLayer.flower_reduceHexesOut(amount)
  }

  function changeMapShape() {
    // TODO: Update zoom when map shape is changed

    if (comp_terrainLayer.areAllHexesBlank()) {
      comp_terrainLayer.changeMapShape($tfield.mapShape)
    } else {
      let changeConfirm = confirm('Are you sure? Changing shape will erase all hexes.')

      if (changeConfirm) {
        comp_terrainLayer.changeMapShape($tfield.mapShape)
      }
    }

    $store_has_unsaved_changes = true
  }
</script>

<div class="settings-grid">
  <label class="helper-text">{$tl.settings.shape.disclaimer}</label>

  <label for="mapShape">{$tl.settings.shape.mapshape}</label>

  <select
    style="min-height: 30px; width: 100%"
    bind:value={$tfield.mapShape}
    on:change={() => {
      changeMapShape()
    }}
  >
    <option value={map_shape.SQUARE}>{$tl.settings.shape.square}</option>
    <option value={map_shape.FLOWER}>{$tl.settings.shape.flower}</option>
  </select>
</div>

{#if $tfield.mapShape == map_shape.SQUARE}
  <section id="map-dimensions-container">
    <div id="map-dimensions">
      {#if addOrRemoveMapDimensions == 'add'}
        <button
          style="grid-area: left;"
          on:click={() => {
            square_expandMapDimension('left', 1)
          }}>{$tl.settings.shape.addleft}</button
        >
        <button
          style="grid-area: top;"
          on:click={() => {
            square_expandMapDimension('top', 1)
          }}>{$tl.settings.shape.addtop}</button
        >
        <button
          style="grid-area: bottom;"
          on:click={() => {
            square_expandMapDimension('bottom', 1)
          }}>{$tl.settings.shape.addbottom}</button
        >
        <button
          style="grid-area: right;"
          on:click={() => {
            square_expandMapDimension('right', 1)
          }}>{$tl.settings.shape.addright}</button
        >
        <button
          style="grid-area: center;"
          on:click={() => {
            addOrRemoveMapDimensions = 'remove'
          }}
        >
          <img
            src={`/assets/img/tools/addHex_${$tfield.orientation == HexOrientation.FLATTOP ? 'ft' : 'pt'}.png`}
            alt={$tl.settings.shape.addhex}
            title={$tl.settings.shape.addhex}
          />
        </button>
      {:else}
        <button
          style="grid-area: left;"
          on:click={() => {
            square_reduceMapDimension('left', 1)
          }}>{$tl.settings.shape.removeleft}</button
        >
        <button
          style="grid-area: top;"
          on:click={() => {
            square_reduceMapDimension('top', 1)
          }}>{$tl.settings.shape.removetop}</button
        >
        <button
          style="grid-area: bottom;"
          on:click={() => {
            square_reduceMapDimension('bottom', 1)
          }}>{$tl.settings.shape.removebottom}</button
        >
        <button
          style="grid-area: right;"
          on:click={() => {
            square_reduceMapDimension('right', 1)
          }}>{$tl.settings.shape.removeright}</button
        >
        <button
          style="grid-area: center;"
          on:click={() => {
            addOrRemoveMapDimensions = 'add'
          }}
        >
          <img
            src={`/assets/img/tools/removeHex_${$tfield.orientation == HexOrientation.FLATTOP ? 'ft' : 'pt'}.png`}
            alt={$tl.settings.shape.removehex}
            title={$tl.settings.shape.removehex}
          />
        </button>
      {/if}
    </div>
  </section>
{:else if $tfield.mapShape == map_shape.FLOWER}
  <section id="flower-dimensions-container">
    <p>{$tl.settings.shape.hexesout}</p>
    <div id="flower-dimensions-controls-grid">
      <button
        on:click={() => {
          flower_reduceHexesOut(1)
        }}
      >
        -
      </button>
      <div id="counter-container">{$tfield.hexesOut}</div>
      <button
        on:click={() => {
          flower_expandHexesOut(1)
        }}
      >
        +
      </button>
    </div>
  </section>
{/if}

<style>
  #map-dimensions-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #map-dimensions {
    display: grid;

    grid-template-columns: 60px 60px 60px;
    grid-template-rows: 60px 60px 60px;
    gap: 5px;

    grid-template-areas:
      'top-left top top-right'
      'left center right'
      'bottom-left bottom bottom-right';
  }

  #map-dimensions button {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #map-dimensions button img {
    width: 90%;
    height: auto;
  }

  #flower-dimensions-controls-grid {
    display: grid;
    grid-template-columns: 60px 1fr 60px;
    width: 100%;
  }

  #flower-dimensions-container p {
    margin-bottom: 10px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  #flower-dimensions-controls-grid button {
    height: 60px;
  }

  #flower-dimensions-controls-grid #counter-container {
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
  }
</style>
