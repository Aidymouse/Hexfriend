<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  let dispatch = createEventDispatcher()

  export let value: string = '#000000'

  export let width: string = '2em'
  export let height: string = '2em'

  export let label: string = null
  export let name: string = null

  $: {
    value = value
    dispatch('change', {})
  }
</script>

<main style="width: {width}; height: {height};">
  <div style="--user-input-color: {value};">
    <input type="color" id={name} bind:value />
  </div>

  {#if label}
    <label for={name}> {label} </label>
  {/if}
</main>

<style>
  main {
    display: flex;
    color: var(--text);
    align-items: center;
    justify-content: center;
  }

  div {
    border-radius: 50%;
    overflow: none;
    border: solid 0.125em var(--text);
    box-sizing: border-box;
    background-color: var(--user-input-color);

    width: 90%;
    height: 90%;
  }

  div:hover {
    border-color: var(--dark-background);
  }

  input {
    width: 100%;
    height: 100%;
    opacity: 0;
  }
</style>
