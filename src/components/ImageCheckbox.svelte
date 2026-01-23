<script lang="ts">
  import { capitialize } from '../helpers/string'

  export let image_filename: string

  export let checked: boolean = false
  export let title: string
</script>

<div
  class="image-checkbox"
  class:selected={checked}
  on:click={() => {
    checked = !checked
  }}
  title={capitialize(title)}
>
  <div class="svg-bg" class:selected={checked} style={`-webkit-mask: url(${image_filename})`} title={`${title}`} />
</div>

<style>
  .svg-bg {
    width: 100%;
    height: 100%;
    background-color: var(--text);
  }

  .svg-bg.selected {
    background-color: var(--primary-background);
  }

  .image-checkbox {
    height: 100%;
    aspect-ratio: 1/1;
    background-color: var(--lighter-background);

    display: flex;
    align-items: center;
    justify-content: center;
    transition-duration: 0.1s;
    padding: 0.3em;
    box-sizing: border-box;
  }

  .image-checkbox:hover {
    background-color: var(--lightest-background);
    transition-duration: 0.1s;
  }

  .image-checkbox.selected {
    background-color: var(--hexfriend-green);
    outline: 0;
  }

  .image-checkbox.selected:hover {
    background-color: var(--dark-primary);
  }
</style>
