<script lang="ts">
  import '../../styles/settings.css'
  import { tl } from '../../stores/translation'

  export let showTerrainGenerator: boolean
  export let show_icon_generator: boolean
  export let showSettings: boolean
</script>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: var(--small-radius)">
  <button
    on:click={() => {
      showTerrainGenerator = true
      show_icon_generator = false
      showSettings = false
    }}
    title={$tl.settings.generators.terrain}
  >
    {$tl.settings.generators.terrain}
  </button>

  <button
    on:click={() => {
      show_icon_generator = true
      showTerrainGenerator = false
      showSettings = false
    }}
    title={$tl.settings.generators.icon}
  >
    {$tl.settings.generators.icon}
  </button>
</div>
