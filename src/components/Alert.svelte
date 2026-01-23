<script lang="ts">
  export let severity: 'warn' | 'error'
</script>

<p class={`alert ${severity}`}>
  <slot />
</p>

<style>
  p.alert {
    padding: 0.5em;
    border-radius: var(--small-radius);
    font-size: 11pt;
  }

  p.warn {
    background-color: #ffdb4d;
    color: #804d00;
  }
</style>
