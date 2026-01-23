<script lang="ts">
  import { store_undo } from '../stores/undo'
  import * as PIXI from 'pixi.js'
  import { UndoActions, type UndoAction } from '../types/undoTypes'

  import { HexOrientation, HexRaised } from '../types/terrain'

  const undo_action_formatters: Partial<{ [k in UndoActions]: (k) => string }> = {
    [UndoActions.ChangeHexBlankColor]: (a) => `${new PIXI.Color(a.new_color).toHex()}`,
    [UndoActions.ChangeHexDimensions]: (a) => `${a.new_width} x ${a.new_height}`,
    [UndoActions.ChangeHexOrientation]: (a) =>
      `${a.new_orientation === HexOrientation.FLATTOP ? 'Flat Top' : 'Pointy Top'}`,
    [UndoActions.ChangeHexRaisedIndented]: (a) => `${a.raised === HexRaised.ODD ? 'Odd' : 'Even'}`,
    [UndoActions.ToggleGridLargeHexes]: (a) => `${a.enabled ? 'On' : 'Off'}`,
    [UndoActions.PlaceTerrain]: (a) => `${a.placed_terrain.hex_ids.length} x ${a.placed_terrain.tile.display}`,
  }

  const format_undo_action = (action: UndoAction): string => {
    const formatter = undo_action_formatters[action.type]
    const defaultFormatter = (a) => 'TODO'
    return (formatter ?? defaultFormatter)(action)
  }
</script>

<div class="panel">
  {#each $store_undo.stack as undo_action, i}
    <p>
      {#if i === $store_undo.undo_pointer}
        >
      {/if}
      {undo_action.type}: {format_undo_action(undo_action)}
    </p>
  {/each}
</div>
