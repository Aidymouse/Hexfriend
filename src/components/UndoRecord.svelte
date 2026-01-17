<script lang="ts">
	import {} from '../lib/undo_handler.ts'
	import { store_undo } from '../stores/undo.ts'
	import { UndoActions } from '../types/undoTypes.ts'

	const format_undo_action = (action: UndoActions): string => {
		switch (action.type) {
			case UndoActions.ToggleGridLargeHexes: {
				return `${action.enabled}`
			}
		}
	}
</script>

<div class="panel">
	{#each $store_undo.stack as undo_action, i}
		<p>
		{#if i === $store_undo.undo_pointer}>{/if}
		{undo_action.type}: {format_undo_action(undo_action)}
		</p>
	{/each}
</div>
