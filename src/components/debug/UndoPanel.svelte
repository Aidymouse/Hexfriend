<script lang="ts">
  import { store_undo } from '../../stores'

</script>

<div class="panel" style="right: 21em; padding: 0.5em;">
  <h2>Debug Panel</h2>

  Len: {$store_undo.undo_stack.length}
  Pointer: {$store_undo.undo_pointer}

</div>
