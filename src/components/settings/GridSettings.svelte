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
    bind:checked={$tfield.grid.shown}
    id={'showGrid'}
    on:change={() => {
      push_undo_state({ TerrainField: { grid: $tfield.grid } }, "Toggle Grid")
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
      bind:value={$tfield.grid.thickness}
      on:change={() => {
	push_undo_state({ TerrainField: { grid: $tfield.grid } }, "Change Grid Thickness")
        renderGrid()
      }}
    />

    <label for="gridColor">{$tl.settings.grid.color}</label>
    <ColorInputPixi
      bind:value={$tfield.grid.stroke}
      on:input={() => {
	push_undo_state({ TerrainField: { grid: $tfield.grid } }, "Grid Stroke Color")
      }}
      on:change={() => {
        renderGrid()
      }}
      id={'gridColor'}
    />
  {/if}

  <label for="gridGap">{$tl.settings.grid.gap}</label>
  <input
    id="gap"
    type="number"
    min="0"
    max="99"
    bind:value={$tfield.grid.gap}
    on:focus={() => {}}
    on:change={() => {
      redrawEntireMap()
      comp_coordsLayer.updateAllCoordPositions()
      retain_positions()

      // TODO: handle updated icons
      push_undo_state({ TerrainField: { grid: $tfield.grid } }, "Change Grid Gap")

      save_old_resize_parameters()
    }}
  />

  <!-- LARGE HEXES -->
  <label for="showOverlay">{$tl.settings.grid.large_hexes.title}</label>
  <Checkbox bind:checked={$tfield.largehexes.shown} on:change={e => {
      push_undo_state({ TerrainField: { largehexes: $tfield.largehexes } }, "Toggle Large Hexes")
  }} id="showOverlay" />

  {#if $tfield.largehexes.shown}
    <label for="overlayDiameter">{$tl.settings.grid.large_hexes.size}</label>
    <input type="number" id="overlayDiameter" min={2} bind:value={$tfield.largehexes.diameterInHexes} on:change={() => { 
      push_undo_state({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex Size")
    }} />

    <label for="overlayColor">{$tl.settings.grid.large_hexes.color}</label>
    <ColorInputPixi id={'overlayColor'} bind:value={$tfield.largehexes.style.color} on:input={() => {
      push_undo_state({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex Color")
    }} />

    <label for="overlayThickness">{$tl.settings.grid.large_hexes.outline_thickness}</label>
    <input type="number" id={'overlayThickness'} bind:value={$tfield.largehexes.style.width} on:change={() => {
      push_undo_state({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex Outline Thickness")
    }}/>

    <label for="overlayOffsetX" title={$tl.settings.grid.large_hexes.horizontal_offset_tooltip}>
      {$tl.settings.grid.large_hexes.horizontal_offset}
    </label>
    <input type="number" bind:value={$tfield.largehexes.offset.x} min={0} step={0.25} on:change={() => {
      push_undo_state({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex X Offset")
    }} />

    <label for="overlayOffsetY" title={$tl.settings.grid.large_hexes.vertical_offset_tooltip}>
      {$tl.settings.grid.large_hexes.vertical_offset}
    </label>
    <input type="number" bind:value={$tfield.largehexes.offset.y} min={0} step={0.25} on:change={() => {
      push_undo_state({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex Y Offset")
    }} />

    <label for="overlayEncompass">{$tl.settings.grid.large_hexes.encompasedges}</label>
    <Checkbox bind:checked={$tfield.largehexes.encompassEdges} id="overlayEncompass" on:change={() => {
      push_undo_state({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex Edge Encompass")
    }} />

    {#if $tfield.mapShape == map_shape.SQUARE}
      <label
        >{$tfield.orientation == HexOrientation.FLATTOP
          ? $tl.settings.grid.large_hexes.large_raised_column
          : $tl.settings.grid.large_hexes.large_indented_row}</label
      >
      <span style={'height: 100%; display: flex; align-items: center;'}>
        <SelectGrid
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
          bind:value={$tfield.largehexes.raised}
	  on:change={() => {
	    push_undo_state({ TerrainField: { largehexes: $tfield.largehexes } }, "Change Large Hex Raised")
	  }}
        />
      </span>
    {/if}
  {/if}
</div>
