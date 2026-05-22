<script lang="ts">
  import '../../styles/settings.css'

  import { coord_system } from '../../types/coordinates'

  import { data_coordinates } from '../../stores/data'
  import { tl } from '../../stores/translation'

  import Checkbox from '../Checkbox.svelte'
  import ColorInputPixi from '../ColorInputPixi.svelte'
  import CoordsLayer from '../../layers/CoordsLayer.svelte'

  import { startUndoState, completeUndoState } from '../../lib'

  export let comp_coordsLayer: CoordsLayer
</script>

<div class="settings-grid">
  <label class="helper-text">{$tl.settings.coordinates.disclaimer}</label>

  <label for="showCoords">{$tl.settings.coordinates.show}</label>
  <Checkbox
    id={'showCoords'}
    checked={$data_coordinates.shown}
    on:change={(e) => {
      startUndoState({ coords: { shown: $data_coordinates.shown } }, 'Toggle Coordinates')
      $data_coordinates.shown = !$data_coordinates.shown
      completeUndoState({ coords: { shown: $data_coordinates.shown } })
    }}
  />

  {#if $data_coordinates.shown}
    <label for="coordsSystem">
      {$tl.settings.coordinates.system}
      <sup>
        <a
          href="https://www.redblobgames.com/grids/hexagons/#coordinates"
          target="_blank"
          title="Hex Coordinate Systems Explanation"
        >
          ?
        </a>
      </sup>
    </label>
    <select
      id="coordsSystem"
      value={$data_coordinates.system}
      on:change={(e) => {
        startUndoState({ coords: $data_coordinates }, 'Change Coordinate System')

        $data_coordinates.system = parseInt(e.target.value)
        comp_coordsLayer.updateAllCoordsText()

        completeUndoState({ coords: $data_coordinates })
      }}
    >
      <option value={coord_system.ROWCOL}>{$tl.settings.coordinates.systems.colrow}</option>
      <option value={coord_system.AXIAL}>{$tl.settings.coordinates.systems.axial}</option>
      <option value={coord_system.CUBE}>{$tl.settings.coordinates.systems.cube}</option>
      <option value={coord_system.LETTERNUMBER}>{$tl.settings.coordinates.systems.letternumber}</option>
    </select>

    <label for="coordsFill">{$tl.settings.coordinates.text_labels.color}</label>
    <ColorInputPixi
      id={'coordsFill'}
      value={$data_coordinates.style.fill}
      on:change={(e) => {
        startUndoState({ coords: { style: $data_coordinates.style } }, 'Change Coordinate Fill')
        $data_coordinates.style.fill = e.detail.string
        completeUndoState({ coords: { style: $data_coordinates.style } })
        //comp_coordsLayer.updateAllCoordsText()
      }}
    />

    <label for="coordFontSize">{$tl.settings.coordinates.text_labels.size}</label>
    <input
      id="coordFontSize"
      type="number"
      value={$data_coordinates.style.fontSize}
      on:change={(e) => {
        startUndoState({ coords: { style: $data_coordinates.style } }, 'Change Coordinate Font Size')
        $data_coordinates.style.fontSize = e.target.valueAsNumber
        completeUndoState({ coords: { style: $data_coordinates.style } })
      }}
    />

    <label for="coordsOutline">{$tl.settings.coordinates.text_labels.outline_color}</label>
    <ColorInputPixi 
      value={$data_coordinates.style.stroke}
      on:change={e => {
	startUndoState({coords: {style: $data_coordinates.style}}, "Change Coordinates Outline Color")
	$data_coordinates.style.stroke = e.detail.string
	completeUndoState({coords: {style: $data_coordinates.style}})
      }}
      id={'coordsOutline'}
    />

    <label for="coordsStrokeThickness">{$tl.settings.coordinates.text_labels.outline_thickness}</label>
    <input
      id="coordsStrokeThickness"
      type="number"
      value={$data_coordinates.style.strokeThickness}
      on:change={e => {
	startUndoState({coords: {style: $data_coordinates.style}}, "Change Coord Stroke Width")
	$data_coordinates.style.strokeThickness = e.target.valueAsNumber
	completeUndoState({coords: {style: $data_coordinates.style}})
      }}
    />

    <label for="coordSeperator">{$tl.settings.coordinates.separator}</label>
    <input
      id="coordSeperator"
      type="text"
      value={$data_coordinates.seperator}
      on:change={(e) => {
	startUndoState({coords: {seperator: $data_coordinates.seperator}}, "Change Coord Seperator")
	$data_coordinates.seperator = e.target.value
        comp_coordsLayer.updateAllCoordsText()
	completeUndoState({coords: {seperator: $data_coordinates.seperator}})
      }}
    />

    <label for="coordGap">{$tl.settings.coordinates.space}</label>
    <input
      id="coordGap"
      type="number"
      value={$data_coordinates.gap}
      on:change={(e) => {
	startUndoState({coords: {gap: $data_coordinates.gap}}, "Change Coord Gap")
	$data_coordinates.gap = e.target.valueAsNumber
        comp_coordsLayer.updateAllCoordPositions()
	completeUndoState({coords: {gap: $data_coordinates.gap}})
      }}
    />

    {#if $data_coordinates.system == coord_system.ROWCOL || $data_coordinates.system == coord_system.LETTERNUMBER}
      <label for="coord-offset-rowcol-row">{$tl.settings.coordinates.offset.row}</label>
      <input
        id="coord-offset-rowcol-row"
        type="number"
        value={$data_coordinates.offsets.row_col.row}
        on:change={(e) => {
	  startUndoState({coords: {offsets: $data_coordinates.offsets}}, "Change Coord Offset - Row")
	  $data_coordinates.offsets.row_col.row = e.target.valueAsNumber
          comp_coordsLayer.updateAllCoordsText()
	  completeUndoState({coords: {offsets: $data_coordinates.offsets}})
        }}
      />

      <label for="coord-offset-rowcol-col">{$tl.settings.coordinates.offset.column}</label>
      <input
        id="coord-offset-rowcol-col"
        type="number"
        value={$data_coordinates.offsets.row_col.col}
        on:change={(e) => {
	  startUndoState({coords: {offsets: $data_coordinates.offsets}}, "Change Coord Offset - Col")
	  $data_coordinates.offsets.row_col.col = e.target.valueAsNumber
          comp_coordsLayer.updateAllCoordsText()
	  completeUndoState({coords: {offsets: $data_coordinates.offsets}})
        }}
      />
    {/if}

    {#if $data_coordinates.system == coord_system.AXIAL || $data_coordinates.system == coord_system.CUBE}
      <label for="coord-offset-cube-q">{$tl.settings.coordinates.offset.q}</label>
      <input
        id="coord-offset-cube-q"
        type="number"
        value={$data_coordinates.offsets.cube.q}
        on:change={(e) => {
	  startUndoState({coords: {offsets: $data_coordinates.offsets}}, "Change Coord Offset - Q")
	  $data_coordinates.offsets.cube.q = e.target.valueAsNumber
	  comp_coordsLayer.updateAllCoordsText()
	  completeUndoState({coords: {offsets: $data_coordinates.offsets}})
        }}
      />

      <label for="coord-offset-cube-r">{$tl.settings.coordinates.offset.r}</label>
      <input
        id="coord-offset-cube-r"
        type="number"
        value={$data_coordinates.offsets.cube.r}
        on:change={(e) => {
	  startUndoState({coords: {offsets: $data_coordinates.offsets}}, "Change Coord Offset - R")
	  $data_coordinates.offsets.cube.r = e.target.valueAsNumber
          comp_coordsLayer.updateAllCoordsText()
	  completeUndoState({coords: {offsets: $data_coordinates.offsets}})
        }}
      />
    {/if}

    {#if $data_coordinates.system == coord_system.CUBE}
      <label for="coord-offset-cube-s">{$tl.settings.coordinates.offset.s}</label>
      <input
        id="coord-offset-cube-s"
        type="number"
        value={$data_coordinates.offsets.cube.s}
        on:change={(e) => {
	  startUndoState({coords: {offsets: $data_coordinates.offsets}}, "Change Coord Offset - S")
	  $data_coordinates.offsets.cube.s = e.target.valueAsNumber
          comp_coordsLayer.updateAllCoordsText()
	  completeUndoState({coords: {offsets: $data_coordinates.offsets}})
        }}
      />
    {/if}
  {/if}
</div>

<style>
</style>
