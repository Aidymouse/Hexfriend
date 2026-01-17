<script lang="ts">
  import { store_undo } from '../stores/undo'
  import { UndoActions, type UndoAction } from '../types/undoTypes'

  const format_undo_action = (action: UndoAction): string => {
    switch (action.type) {
      case UndoActions.ToggleGridLargeHexes: {
	return `${action.enabled ? 'On' : 'Off'}`
      }
    }
  }
</script>

<div class="panel">
  {#each $store_undo.stack as undo_action, i}
    <p>
      {#if i === $store_undo.undo_pointer} > {/if}
      {undo_action.type}: {format_undo_action(undo_action)}
    </p>
  {/each}
</div>
