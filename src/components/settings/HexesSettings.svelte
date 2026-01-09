<script lang="ts">
  import '../../styles/settings.css'

  import ColorInputPixi from '../ColorInputPixi.svelte'
  import SelectGrid from '../SelectGrid.svelte'
  import ImageCheckbox from '../ImageCheckbox.svelte'

  import { HexOrientation } from '../../types/terrain'
  import { map_shape } from '../../types/settings'

  import { tfield } from '../../stores/tfield'
  import { resize_parameters } from '../../stores/resize_parameters'
  import { store_has_unsaved_changes } from '../../stores/flags'
  import { tl } from '../../stores/translation'

  import { get_radius_from_width_height, get_width_height_from_radius } from '../../helpers/hexHelpers'
  import { data_terrain } from '../../stores/data'

  import { record_undo_action } from '../../lib/undo_handler'
  import { UndoActions, type UndoAction } from '../../types/undoTypes'

  export let comp_coordsLayer
  export let comp_terrainLayer

  export let retain_positions: Function
  export let retain_positions_orientation_change: Function
  export let retain_scale: Function
  export let save_old_resize_parameters: Function
  export let renderAllHexes: Function
  export let redrawEntireMap: Function

  export let retainIconPosition: boolean
  export let retainPathPosition: boolean
  export let retainTextPosition: boolean

  export let retainIconScale: boolean


  /** Changes the orientation of hexes. Record action is optional because... */
  function changeOrientation(new_orientation: HexOrientation, record_action: boolean = true) {
    if ($tfield.orientation === new_orientation) return

    $tfield.orientation = new_orientation

    let t = $tfield.hexWidth
    $tfield.hexWidth = $tfield.hexHeight
    $tfield.hexHeight = t

    if (record_action) {
      record_undo_action({
        type: UndoActions.ChangeHexOrientation,
        new_orientation: $tfield.orientation,
      })
    }

    comp_terrainLayer.changeOrientation()

    $data_terrain.genPreview = true

    comp_coordsLayer.cullUnusedCoordinates()
    comp_coordsLayer.updateAllCoordPositions()
    comp_coordsLayer.updateAllCoordsText()
    comp_coordsLayer.populateBlankHexes()

    retain_positions_orientation_change()
    retain_scale()

    // Width and Height flip so we save the old params
    save_old_resize_parameters()

    $store_has_unsaved_changes = true

    //redrawEntireMap()
  }

  export const change_hex_dimensions = (new_width: number, new_height: number, record_action: boolean = true) => {
    if (record_action) {
      record_undo_action({
        type: UndoActions.ChangeHexDimensions,
        old_width: $tfield.hexWidth,
        old_height: $tfield.hexHeight,
        new_width: new_width,
        new_height: new_height,
      })
    }

    $tfield.hexWidth = new_width
    $tfield.hexHeight = new_height

    redrawEntireMap()
    comp_coordsLayer.updateAllCoordPositions()
    retain_positions() // How is undo gonna work with retaining icon position?
    retain_scale()
    save_old_resize_parameters()
  }

  /** Undo */
  export const handle_undo = (action: UndoAction) => {
    switch (action.type) {
      case UndoActions.ChangeHexOrientation: {
        const revert_orientation =
          action.new_orientation === HexOrientation.FLATTOP ? HexOrientation.POINTYTOP : HexOrientation.FLATTOP
        changeOrientation(revert_orientation, false)
        break
      }
      case UndoActions.ChangeHexDimensions: {
        change_hex_dimensions(action.old_width, action.old_height, false)
      }
    }
  }

  export const handle_redo = (action: UndoAction) => {
    switch (action.type) {
      case UndoActions.ChangeHexOrientation: {
        changeOrientation(action.new_orientation, false)
        break
      }
      case UndoActions.ChangeHexDimensions: {
        change_hex_dimensions(action.new_width, action.new_height, false)
      }
    }
  }
</script>

<div class="settings-grid">
  <label for="blankHexColor">{$tl.settings.hexes.blank_color}</label>
  <div style="display: flex; gap: 0.25em; align-items: center;">
    <ColorInputPixi
      bind:value={$tfield.blankHexColor}
      on:change={() => {
        renderAllHexes()
      }}
      id={'blankHexColor'}
    />

    <button
      style={'height: fit-content;'}
      on:click={() => {
        $tfield.blankHexColor = 0xf2f2f2
      }}>{$tl.settings.hexes.blank_color_reset}</button
    >
  </div>

  <label>{$tl.settings.hexes.orientation}</label>
  <div style={'height: 100%; display: flex; align-items: center;'}>
    <SelectGrid
      options={[
        { title: 'Flat Top', value: HexOrientation.FLATTOP, filename: 'flatTop' },
        { title: 'Pointy Top', value: HexOrientation.POINTYTOP, filename: 'pointyTop' },
      ]}
      value={$tfield.orientation}
      on:change={() => {
        changeOrientation(
          $tfield.orientation === HexOrientation.FLATTOP ? HexOrientation.POINTYTOP : HexOrientation.FLATTOP,
        )
      }}
    />
  </div>

  {#if $tfield.mapShape == map_shape.SQUARE}
    <label>
      {$tfield.orientation == HexOrientation.FLATTOP
        ? $tl.settings.hexes.raised_column
        : $tl.settings.hexes.indented_row}
    </label>
    <span style={'height: 100%; display: flex; align-items: center;'}>
      <SelectGrid
        options={[
          {
            title: $tl.general.even,
            value: 'even',
            filename: `${$tfield.orientation == HexOrientation.FLATTOP ? 'raisedcolumn' : 'indentedrow'}even`,
          },
          {
            title: $tl.general.odd,
            value: 'odd',
            filename: `${$tfield.orientation == HexOrientation.FLATTOP ? 'raisedcolumn' : 'indentedrow'}odd`,
          },
        ]}
        bind:value={$tfield.raised}
        on:change={() => {
          if ($tfield.orientation == HexOrientation.FLATTOP) {
            comp_terrainLayer.square_updateRaisedColumn()
          } else {
            comp_terrainLayer.square_changeIndentedRow()
          }
          comp_coordsLayer.cullUnusedCoordinates()
        }}
      />
    </span>
  {/if}

  <label for="hexWidth">{$tl.settings.hexes.width}</label>
  <input
    id="hexWidth"
    type="number"
    min={1}
    value={$tfield.hexWidth}
    on:change={(e) => {
      if (Number.isNaN(e.currentTarget.valueAsNumber)) {
        return
      }

      change_hex_dimensions(e.currentTarget.valueAsNumber, $tfield.hexHeight)
    }}
  />

  <label for="hexHeight">{$tl.settings.hexes.height}</label>
  <input
    id="hexHeight"
    type="number"
    min={1}
    bind:value={$tfield.hexHeight}
    on:change={(e) => {
      if (Number.isNaN(e.currentTarget.valueAsNumber)) {
        return
      }
      change_hex_dimensions($tfield.hexHeight, e.currentTarget.valueAsNumber)
    }}
  />

  <label for="hex-radius">{$tl.settings.hexes.size_by_radius}</label>
  <span>
    <button
      on:click={() => {
        let currentRadius = get_radius_from_width_height($tfield.hexWidth, $tfield.hexHeight, $tfield.orientation)

        let radius = +prompt('Enter hex radius', currentRadius.toString())
        console.log(radius)
        if (Number.isNaN(radius) || radius < 1) return

        let new_dims = get_width_height_from_radius(radius, $tfield.orientation)

	change_hex_dimensions(new_dims.width, new_dims.height, true);

        redrawEntireMap()

        retain_positions()
        retain_scale()
        save_old_resize_parameters()

        comp_coordsLayer.updateAllCoordPositions()
      }}>Set</button
    >
  </span>

  <!--
    <label for="mapShape">Map Type</label>
    <select id="mapShape" bind:value={$tfield.mapShape}>
        <option value={map_shape.SQUARE}>Square</option>
        <option value={map_shape.RADIAL}>Radial</option>
    </select>
    -->

  <label title={$tl.settings.hexes.retain_position_explanation}>
    {$tl.settings.hexes.retain_position}
    <sup id="retain-position-tip" title={$tl.settings.hexes.retain_position_explanation}>?</sup>
  </label>
  <div id="retain-position-container">
    <div id="retain-position-grid">
      <ImageCheckbox
        image_filename={'/assets/img/tools/icon.svg'}
        title={$tl.settings.hexes.retain_icons}
        bind:checked={retainIconPosition}
      />
      <ImageCheckbox
        image_filename={'/assets/img/tools/path.svg'}
        title={$tl.settings.hexes.retain_paths}
        bind:checked={retainPathPosition}
      />
      <ImageCheckbox
        image_filename={'/assets/img/tools/text.svg'}
        title={$tl.settings.hexes.retain_text}
        bind:checked={retainTextPosition}
      />
    </div>
  </div>
  <label title={$tl.settings.hexes.retain_position_explanation}>
    {$tl.settings.hexes.update_icon_scale}
    <sup id="retain-position-tip" title={$tl.settings.hexes.update_icon_scale_explanation}>?</sup>
  </label>
  <div id="retain-position-container">
    <div id="retain-position-grid">
      <ImageCheckbox
        image_filename={'/assets/img/tools/icon.svg'}
        title={$tl.settings.hexes.retain_icons}
        bind:checked={retainIconScale}
      />
    </div>
  </div>
</div>

<style>
  #retain-position-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #retain-position-grid {
    height: 2em;
    display: flex;
    border-radius: var(--small-radius);
    overflow: hidden;
  }

  #retain-position-tip {
    color: var(--hexfriend-green);
  }
</style>
