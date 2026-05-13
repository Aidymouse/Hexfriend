<script lang="ts">
  import { store_undo, tfield } from '../../stores'
</script>

<div class="panel" style="right: 21em; padding: 0.5em;">
  <h2>Debug Panel</h2>

  Len: {$store_undo.undo_stack.length}
  Pointer: {$store_undo.undo_pointer}
  Prospective: {$store_undo.prospective_state?.label ?? '-'}

  <button on:click={(e) => console.log($store_undo)}>Log Undo Stack</button>

  <hr />

  {#each $store_undo.undo_stack as undo_state, idx}
    <div>{idx}: {undo_state.label} {$store_undo.undo_pointer === idx ? '<-' : ''}</div>
  {/each}
</div>
