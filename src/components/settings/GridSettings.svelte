<script lang="ts">
  import '../../styles/settings.css'

  import Checkbox from '../Checkbox.svelte'
  import ColorInputPixi from '../ColorInputPixi.svelte'
  import SelectGrid from '../SelectGrid.svelte'

  import { tfield } from '../../stores/tfield'
  import { tl } from '../../stores/translation'

  import { map_shape } from '../../types/settings'
  import { HexOrientation } from '../../types/terrain'
  import { push_undo_state } from '../../lib'

  import { completeUndoState, startUndoState } from '../../lib/undoManager'
  import type { IconLayerIcon } from '../../types'
  export let comp_terrainLayer
  export let comp_coordsLayer

  export let renderGrid: Function
  export let redrawEntireMap: Function
  export let retain_positions: Function
  export let save_old_resize_parameters: Function


</script>

<div class="settings-grid">
  <label for="showGrid">{$tl.settings.grid.show}</label>
  <!-- Weird bug where the grid wont render if you turn it off then resize the hex flower map ?? -->
  <Checkbox
    checked={$tfield.grid.shown}
    id={'showGrid'}
    on:change={() => {
      startUndoState({TerrainField: { grid: $tfield.grid } }, "Toggle Grid")
      $tfield.grid.shown = !$tfield.grid.shown
      completeUndoState({TerrainField: { grid: $tfield.grid } }, "Toggle Grid")
      comp_terrainLayer.renderGrid()
    }}
  />
  {#if $tfield.grid.shown}
    <label for="gridThickness">{$tl.settings.grid.thickness}</label>
    <input
      id="gridThickness"
      type="number"
      min="0"
      max="99"
      value={$tfield.grid.thickness}
      on:change={(e) => {
	startUndoState({TerrainField: { grid: $tfield.grid } }, `Change Grid Thickness ${$tfield.grid.thickness} -> ${e.target.valueAsNumber}`)
	$tfield.grid.thickness = e.target.valueAsNumber
	completeUndoState({TerrainField: { grid: $tfield.grid } })
        renderGrid()
      }}
    />

    <label for="gridColor">{$tl.settings.grid.color}</label>
    <ColorInputPixi
      value={$tfield.grid.stroke}
      on:input={(e) => {
	startUndoState({TerrainField: { grid: $tfield.grid } }, `Change Grid Stroke`, {bounce: true})
	$tfield.grid.stroke = e.detail.number
        renderGrid()
      }}
      on:change={() => {
	completeUndoState({TerrainField: { grid: $tfield.grid } })
      }}
      id={'gridColor'}
    />
  {/if}

  <!-- LARGE HEXES -->
  <label for="showOverlay">{$tl.settings.grid.large_hexes.title}</label>
  <Checkbox checked={$tfield.largehexes.shown} on:change={e => {
      startUndoState({ TerrainField: { largehexes: $tfield.largehexes } }, "Toggle Large Hexes")
      $tfield.largehexes.shown = !$tfield.largehexes.shown
      completeUndoState({ TerrainField: { largehexes: $tfield.largehexes } })
  }} id="showOverlay" />

  {#if $tfield.largehexes.shown}
    <label for="overlayDiameter">{$tl.settings.grid.large_hexes.size}</label>
    <input type="number" id="overlayDiameter" min={2} value={$tfield.largehexes.diameterInHexes} on:change={(e) => { 
      startUndoState({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex Size")
      $tfield.largehexes.diameterInHexes = e.target.valueAsNumber
      completeUndoState({ TerrainField: { largehexes: $tfield.largehexes } })
    }} />

    <label for="largeHexStroke">{$tl.settings.grid.large_hexes.color}</label>
    <ColorInputPixi
      id={'largeHexStroke'}
      value={$tfield.largehexes.style.color}
      on:input={(e) => {
	startUndoState({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex Color", {bounce: true})
	$tfield.largehexes.style.color = e.detail.number
      }} 
      on:change={e => {
	completeUndoState({ TerrainField: { largehexes: $tfield.largehexes } })
      }}
    />

    <label for="overlayThickness">{$tl.settings.grid.large_hexes.outline_thickness}</label>
    <input type="number" id={'overlayThickness'} value={$tfield.largehexes.style.width} on:change={(e) => {
      startUndoState({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex Outline Thickness")
      $tfield.largehexes.style.width = e.target.valueAsNumber
      completeUndoState({ TerrainField: { largehexes: $tfield.largehexes } })
    }}/>

    <label for="overlayOffsetX" title={$tl.settings.grid.large_hexes.horizontal_offset_tooltip}>
      {$tl.settings.grid.large_hexes.horizontal_offset}
    </label>
    <input type="number" value={$tfield.largehexes.offset.x} min={0} step={0.25} on:change={(e) => {
      startUndoState({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex X Offset")
      $tfield.largehexes.offset.x = e.target.valueAsNumber
      completeUndoState({ TerrainField: { largehexes: $tfield.largehexes } })
    }} />

    <label for="overlayOffsetY" title={$tl.settings.grid.large_hexes.vertical_offset_tooltip}>
      {$tl.settings.grid.large_hexes.vertical_offset}
    </label>
    <input type="number" value={$tfield.largehexes.offset.y} min={0} step={0.25} on:change={(e) => {
      startUndoState({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex Y Offset")
      $tfield.largehexes.offset.y = e.target.valueAsNumber
      completeUndoState({ TerrainField: { largehexes: $tfield.largehexes } })
    }} />

    <label for="overlayEncompass">{$tl.settings.grid.large_hexes.encompasedges}</label>
    <Checkbox checked={$tfield.largehexes.encompassEdges} id="overlayEncompass" on:change={() => {
      startUndoState({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex Edge Encompass")
      $tfield.largehexes.encompassEdges = !$tfield.largehexes.encompassEdges
      completeUndoState({ TerrainField: { largehexes: $tfield.largehexes } })
    }} />

    {#if $tfield.mapShape == map_shape.SQUARE}
      <label for="big-raised-select-grid">
	{$tfield.orientation == HexOrientation.FLATTOP
          ? $tl.settings.grid.large_hexes.large_raised_column
          : $tl.settings.grid.large_hexes.large_indented_row}
      </label>
      <span style={'height: 100%; display: flex; align-items: center;'}>
        <SelectGrid
	  id="big-raised-select-grid"
          options={[
            {
              title: $tl.general.even,
              value: 'even',
              filename: `${$tfield.orientation == HexOrientation.FLATTOP ? 'bigraisedcolumn' : 'bigindentedrow'}even`,
            },
            {
              title: $tl.general.odd,
              value: 'odd',
              filename: `${$tfield.orientation == HexOrientation.FLATTOP ? 'bigraisedcolumn' : 'bigindentedrow'}odd`,
            },
          ]}
          value={$tfield.largehexes.raised}
	  on:change={(e) => {
	    startUndoState({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex Raised")
            $tfield.largehexes.raised = e.detail.value
	    completeUndoState({ TerrainField: { largehexes: $tfield.largehexes } })
	  }}
        />
      </span>
    {/if}
  {/if}
</div>
