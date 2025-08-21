<script lang="ts">
  import '../../styles/settings.css'

  import Checkbox from '../Checkbox.svelte'
  import ColorInputPixi from '../ColorInputPixi.svelte'
  import SelectGrid from '../SelectGrid.svelte'

  import { tfield } from '../../stores/tfield'
  import { tl } from '../../stores/translation'

  import { map_shape } from '../../types/settings'
  import { HexOrientation } from '../../types/terrain'

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
  <Checkbox bind:checked={$tfield.grid.shown} id={'showGrid'} on:change={comp_terrainLayer.renderGrid} />
  {#if $tfield.grid.shown}
    <label for="gridThickness">{$tl.settings.grid.thickness}</label>
    <input
      id="gridThickness"
      type="number"
      min="0"
      max="99"
      bind:value={$tfield.grid.thickness}
      on:change={() => {
        renderGrid()
      }}
    />

    <label for="gridColor">{$tl.settings.grid.color}</label>
    <ColorInputPixi
      bind:value={$tfield.grid.stroke}
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
      save_old_resize_parameters()
    }}
  />

  <!-- LARGE HEXES -->
  <label for="showOverlay">{$tl.settings.grid.large_hexes.title}</label>
  <Checkbox bind:checked={$tfield.largehexes.shown} id="showOverlay" />

  {#if $tfield.largehexes.shown}
    <label for="overlayDiameter">{$tl.settings.grid.large_hexes.size}</label>
    <input type="number" id="overlayDiameter" min={2} bind:value={$tfield.largehexes.diameterInHexes} />

    <label for="overlayColor">{$tl.settings.grid.large_hexes.color}</label>
    <ColorInputPixi id={'overlayColor'} bind:value={$tfield.largehexes.style.color} />

    <label for="overlayThickness">{$tl.settings.grid.large_hexes.outline_thickness}</label>
    <input type="number" id={'overlayThickness'} bind:value={$tfield.largehexes.style.width} />

    <label for="overlayOffsetX" title={$tl.settings.grid.large_hexes.horizontal_offset_tooltip}
      >{$tl.settings.grid.large_hexes.horizontal_offset}</label
    >
    <input type="number" bind:value={$tfield.largehexes.offset.x} min={0} step={0.25} />

    <label for="overlayOffsetY" title={$tl.settings.grid.large_hexes.vertical_offset_tooltip}
      >{$tl.settings.grid.large_hexes.vertical_offset}</label
    >
    <input type="number" bind:value={$tfield.largehexes.offset.y} min={0} step={0.25} />

    <label for="overlayEncompass">{$tl.settings.grid.large_hexes.encompasedges}</label>
    <Checkbox bind:checked={$tfield.largehexes.encompassEdges} id="overlayEncompass" />

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
        />
      </span>
    {/if}
  {/if}
</div>
