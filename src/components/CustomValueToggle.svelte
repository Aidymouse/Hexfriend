<script lang="ts">
  export let offValue: any
  export let onValue: any

  export let value: any = offValue
</script>

<div
  class="customValueToggle"
  class:on={value == onValue}
  class:error={value != onValue && value != offValue}
  on:click={() => {
    value = value == offValue ? onValue : offValue
  }}
>
  <slot />
</div>

<style>
  .customValueToggle {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--lighter-background);
    transition-duration: 0.1s;
  }

  .customValueToggle:hover {
    background-color: var(--lightest-background);
    transition-duration: 0.1s;
    cursor: inherit;
    user-select: none;
  }

  .customValueToggle.on {
    background-color: var(--hexfriend-green);
  }

  .customValueToggle.on:hover {
    background-color: var(--hexfriend-green);
  }

  .customValueToggle.error {
    background-color: maroon;
  }
</style>
