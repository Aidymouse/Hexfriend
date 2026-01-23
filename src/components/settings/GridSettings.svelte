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
        enabled: enabled,
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

  function toggle_large_hexes(enabled: boolean, record_action: boolean = true) {
    if (record_action) {
      record_undo_action({
        type: UndoActions.ToggleGridLargeHexes,
        enabled,
      })
    }

    $tfield.largehexes.shown = enabled
  }

  function lh_change_size(new_size: number, record_action: boolean = true) {
    if (record_action) {
      record_undo_action({
        type: UndoActions.ChangeGridLargeHexSize,
        old_size: $tfield.largehexes.diameterInHexes,
        new_size,
      })
    }

    $tfield.largehexes.diameterInHexes = new_size
  }

  function lh_change_color(new_color: number, record_action: boolean = true) {
    if (record_action) {
      record_undo_action({
        type: UndoActions.ChangeGridLargeHexColor,
        new_color: parseInt(`${new_color}`),
        old_color: parseInt(`${$tfield.largehexes.style.color}`),
      })
    }

    console.log('Changing LH color', new_color)

    $tfield.largehexes.style.color = new_color
  }

  function lh_change_outline_thickness(new_thickness: number, record_action: boolean = true) {
    if (record_action) {
      record_undo_action({
        type: UndoActions.ChangeGridLargeHexWidth,
        new_width: parseInt(`${new_thickness}`),
        old_width: parseInt(`${$tfield.largehexes.style.width}`),
      })
    }

    $tfield.largehexes.style.width = new_thickness
  }

  function lh_change_offset(new_hori: number, new_vert: number, record_action: boolean = true) {
    if (record_action) {
      record_undo_action({
        type: UndoActions.ChangeGridLargeHexOffset,
        old_horizontal: $tfield.largehexes.offset.x,
        old_vertical: $tfield.largehexes.offset.y,
        new_horizontal: new_hori,
        new_vertical: new_vert,
      })
    }

    $tfield.largehexes.offset.x = new_hori
    $tfield.largehexes.offset.y = new_vert
  }

  function lh_toggle_edge_encompass(enabled: boolean, record_action: boolean = true) {
    if (record_action) {
      record_undo_action({
        type: UndoActions.ToggleGridLargeHexEdgeEncompass,
        enabled,
      })
    }

    $tfield.largehexes.encompassEdges = enabled
  }

  export const handle_undo = (action: UndoAction) => {
    switch (action.type) {
      case UndoActions.ToggleGrid: {
        toggle_grid(!action.enabled, false)
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
      case UndoActions.ToggleGridLargeHexes: {
        toggle_large_hexes(!action.enabled, false)
        break
      }
      case UndoActions.ChangeGridLargeHexSize: {
        lh_change_size(action.old_size, false)
        break
      }
      case UndoActions.ChangeGridLargeHexColor: {
        lh_change_color(action.old_color, false)
        break
      }
      case UndoActions.ChangeGridLargeHexWidth: {
        lh_change_outline_thickness(action.old_width, false)
        break
      }
      case UndoActions.ChangeGridLargeHexOffset: {
        lh_change_offset(action.old_horizontal, action.old_vertical, false)
        break
      }
      case UndoActions.ToggleGridLargeHexEdgeEncompass: {
        lh_toggle_edge_encompass(!action.enabled, false)
        break
      }
    }
  }

  export const handle_redo = (action: UndoAction) => {
    switch (action.type) {
      case UndoActions.ToggleGrid: {
        toggle_grid(action.enabled, false)
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
      case UndoActions.ToggleGridLargeHexes: {
        toggle_large_hexes(action.enabled, false)
        break
      }
      case UndoActions.ChangeGridLargeHexSize: {
        lh_change_size(action.new_size, false)
        break
      }
      case UndoActions.ChangeGridLargeHexColor: {
        lh_change_color(action.new_color, false)
        break
      }
      case UndoActions.ChangeGridLargeHexWidth: {
        lh_change_outline_thickness(action.new_width, false)
        break
      }
      case UndoActions.ChangeGridLargeHexOffset: {
        lh_change_offset(action.new_horizontal, action.new_vertical, false)
        break
      }
      case UndoActions.ToggleGridLargeHexEdgeEncompass: {
        lh_toggle_edge_encompass(action.enabled, false)
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
  <Checkbox
    checked={$tfield.largehexes.shown}
    id="showOverlay"
    on:change={() => {
      toggle_large_hexes(!$tfield.largehexes.shown)
    }}
  />

  {#if $tfield.largehexes.shown}
    <label for="overlayDiameter">{$tl.settings.grid.large_hexes.size}</label>
    <input
      type="number"
      id="overlayDiameter"
      min={2}
      value={$tfield.largehexes.diameterInHexes}
      on:change={(e) => {
        lh_change_size(e.target.valueAsNumber)
      }}
    />

    <label for="overlayColor">{$tl.settings.grid.large_hexes.color}</label>
    <ColorInputPixi
      id={'overlayColor'}
      value={$tfield.largehexes.style.color}
      on:input={(e) => {
        lh_change_color(e.detail.number)
      }}
    />

    <label for="overlayThickness">{$tl.settings.grid.large_hexes.outline_thickness}</label>
    <input
      type="number"
      id={'overlayThickness'}
      value={$tfield.largehexes.style.width}
      on:change={(e) => {
        lh_change_outline_thickness(e.target.valueAsNumber)
      }}
    />

    <label for="overlayOffsetX" title={$tl.settings.grid.large_hexes.horizontal_offset_tooltip}>
      {$tl.settings.grid.large_hexes.horizontal_offset}
    </label>
    <input
      type="number"
      value={$tfield.largehexes.offset.x}
      min={0}
      step={0.25}
      on:change={(e) => {
        lh_change_offset(e.target.valueAsNumber, $tfield.largehexes.offset.y)
      }}
    />

    <label for="overlayOffsetY" title={$tl.settings.grid.large_hexes.vertical_offset_tooltip}>
      {$tl.settings.grid.large_hexes.vertical_offset}
    </label>
    <input
      type="number"
      value={$tfield.largehexes.offset.y}
      min={0}
      step={0.25}
      on:change={(e) => {
        lh_change_offset($tfield.largehexes.offset.x, e.target.valueAsNumber)
      }}
    />

    <label for="overlayEncompass">{$tl.settings.grid.large_hexes.encompasedges}</label>
    <Checkbox
      checked={$tfield.largehexes.encompassEdges}
      id="overlayEncompass"
      on:change={(e) => {
        lh_toggle_edge_encompass(!$tfield.largehexes.encompassEdges)
      }}
    />

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
