<script lang="ts">
  import IconPreviewer from './IconPreviewer.svelte'
  import PixiPlayground from './PixiPlayground.svelte'
</script>

<main>
  <details style="display: flex; flex-direction: column; gap: 1em;">
    <summary>Icon Previewer</summary>
    <IconPreviewer />
  </details>

  <details>
    <summary>Pixi Playground</summary>
    <PixiPlayground />
  </details>
</main>
