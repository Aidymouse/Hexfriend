<script lang="ts">
  export let control: string
  export let tip: string
  export let style: string = ''
</script>

{#if tip != ''}
  <div class="control" {style}>
    <p>{control}</p>
    <p>{tip}</p>
  </div>
{/if}

<style>
  .control {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }

  p {
    margin: 0;
    font-size: 10pt;
  }
</style>
