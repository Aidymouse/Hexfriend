<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  let dispatch = createEventDispatcher()

  export let type: string;

  export let value;
  let oldValue: string = value

  $: {
    if (value !== oldValue) {
      dispatch('change', { new: value, old: oldValue, change_location: 'internal'})
      oldValue = value
    } else {
      dispatch('change', { new: value, old: oldValue, change_location: 'external'})
      oldValue = value
    }
  }


</script>

<input type={type} bind:value >
