<script lang="ts">
  import '../../styles/settings.css'

  import Checkbox from '../Checkbox.svelte'
  import ColorInputPixi from '../ColorInputPixi.svelte'
  import SelectGrid from '../SelectGrid.svelte'

  import { tfield } from '../../stores/tfield'
  import { tl } from '../../stores/translation'

  import { map_shape } from '../../types/settings'
  import { HexOrientation } from '../../types/terrain'

  import { UndoActions, type UndoAction } from '../../types/undoTypes'
  import { record_undo_action } from '../../lib/undo_handler'

  export let comp_terrainLayer
  export let comp_coordsLayer

  export let renderGrid: Function
  export let redrawEntireMap: Function
  export let retain_positions: Function
  export let save_old_resize_parameters: Function

  function toggle_grid(enabled: boolean, record_action: boolean = true) {
    $tfield.grid.shown = enabled
    comp_terrainLayer.renderGrid()

    if (record_action) {
      record_undo_action({
        type: UndoActions.ToggleGrid,
        enabled: !enabled,
      })
    }
  }

  function change_grid_thickness(thickness: number, record_action: boolean = true) {
    if (record_action) {
      record_undo_action({
        type: UndoActions.ChangeGridThickness,
        old_thickness: $tfield.grid.thickness,
        new_thickness: thickness,
      })
    }

    $tfield.grid.thickness = thickness
    renderGrid()
  }

  function change_grid_color(new_color: number, record_action: boolean = true) {
    if (record_action) {
      record_undo_action({
        type: UndoActions.ChangeGridColor,
        new_color: parseInt(`${new_color}`),
        old_color: parseInt(`${$tfield.grid.stroke}`),
      })
    }
    $tfield.grid.stroke = new_color
    renderGrid()
  }

  function change_gap(new_gap: number, record_action: boolean = true) {
    console.log('Changing Gap', new_gap)
    if (record_action) {
      record_undo_action({
        type: UndoActions.ChangeGridGap,
        new_gap: new_gap,
        old_gap: parseInt(`${$tfield.grid.gap}`),
      })
    }

    $tfield.grid.gap = new_gap

    redrawEntireMap()
    comp_coordsLayer.updateAllCoordPositions()
    retain_positions()
    save_old_resize_parameters()
  }

  function toggle_large_hexes(enabled: boolean) {}

  function lh_change_size(new_size: number) {}

  function lg_change_color(new_color: number) {}

  function lh_change_outline_thickness(new_thickness) {}

  function lh_change_offset(new_hori: number, new_vert: number) {}

  function lh_toggle_edge_encompass() {}

  export const handle_undo = (action: UndoAction) => {
    switch (action.type) {
      case UndoActions.ToggleGrid: {
        toggle_grid(action.enabled, false)
        break
      }
      case UndoActions.ChangeGridThickness: {
        change_grid_thickness(action.old_thickness, false)
        break
      }
      case UndoActions.ChangeGridColor: {
        change_grid_color(action.old_color, false)
        break
      }
      case UndoActions.ChangeGridGap: {
        change_gap(action.old_gap, false)
        break
      }
    }
  }

  export const handle_redo = (action: UndoAction) => {
    switch (action.type) {
      case UndoActions.ToggleGrid: {
        toggle_grid(!action.enabled, false)
        break
      }
      case UndoActions.ChangeGridThickness: {
        change_grid_thickness(action.new_thickness, false)
        break
      }
      case UndoActions.ChangeGridColor: {
        console.log('Redo Change Grid Color', action)
        change_grid_color(action.new_color, false)
        break
      }
      case UndoActions.ChangeGridGap: {
        change_gap(action.new_gap, false)
        break
      }
    }
  }
</script>

<div class="settings-grid">
  <label for="showGrid">{$tl.settings.grid.show}</label>
  <!-- Weird bug where the grid wont render if you turn it off then resize the hex flower map ?? -->
  <Checkbox bind:checked={$tfield.grid.shown} id={'showGrid'} on:change={() => toggle_grid($tfield.grid.shown)} />

  {#if $tfield.grid.shown}
    <label for="gridThickness">{$tl.settings.grid.thickness}</label>
    <input
      id="gridThickness"
      type="number"
      min="0"
      max="99"
      value={$tfield.grid.thickness}
      on:change={(e) => {
        change_grid_thickness(e.target.valueAsNumber)
      }}
    />

    <label for="gridColor">{$tl.settings.grid.color}</label>
    <ColorInputPixi
      value={$tfield.grid.stroke}
      on:input={(e) => {
        change_grid_color(e.detail.number)
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
    value={$tfield.grid.gap}
    on:focus={() => {}}
    on:change={(e) => {
      change_gap(e.target.valueAsNumber)
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
