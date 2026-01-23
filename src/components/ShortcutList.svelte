<script lang="ts">
  /* I am sure there's a data strcuture out there that will make this more efficient, but it works for now */
  import { shortcuts } from '../lib/keyboardShortcuts'
  import { tools } from '../types/toolData'

  const GENERALHEADING: string = 'General Keybinds'

  let toolHeadings = [
    { tool: null, heading: GENERALHEADING },
    { tool: tools.TERRAIN, heading: 'Terrain Tool' },
    { tool: tools.ICON, heading: 'Icon Tool' },
    { tool: tools.PATH, heading: 'Path Tool' },
    { tool: tools.TEXT, heading: 'Text Tool' },
    { tool: tools.ERASER, heading: 'Eraser Tool' },
  ]

  let keysDown: string[] = []

  function isKeyDown(key: string, ke: string[]): boolean {
    let t = ke.find((k) => k == key) != null
    return t
  }

  export function keydown(e: KeyboardEvent) {
    keysDown = [...keysDown, e.key.toLowerCase()]
  }

  export function keyup(e: KeyboardEvent) {
    keysDown = keysDown.filter((k) => k != e.key.toLowerCase())
  }

  function splitKeycode(keycode: string) {
    return keycode.split('+')
  }
</script>

<div id="maps-container">
  <div id="maps">
    {#each toolHeadings as toolHeading}
      <h2 style={toolHeading.heading == GENERALHEADING ? 'margin-top: 0;' : ''}>{toolHeading.heading}</h2>

      {#each shortcuts.filter((s) => s.tool == toolHeading.tool) as shortcut}
        <span class="shortcut-listing">
          <p>{shortcut.display}</p>
          <p class="keycode">
            {#if shortcut.displayKeycode}
              <div class:highlighted={isKeyDown(shortcut.keycode, keysDown)}>{shortcut.displayKeycode}</div>
            {:else}
              {#each splitKeycode(shortcut.keycode) as keyCodePart}
                {#if keyCodePart == 'control'}
                  <div class:highlighted={isKeyDown(keyCodePart, keysDown)}>{keyCodePart}+</div>
                {:else if keyCodePart == 'shift'}
                  <div class:highlighted={isKeyDown(keyCodePart, keysDown)}>{keyCodePart}+</div>
                {:else if keyCodePart == 'alt'}
                  <div class:highlighted={isKeyDown(keyCodePart, keysDown)}>{keyCodePart}+</div>
                {:else}
                  <div class:highlighted={isKeyDown(keyCodePart, keysDown)}>{keyCodePart}</div>
                {/if}
              {/each}
            {/if}
          </p>
        </span>
      {/each}
    {/each}
  </div>
</div>

<style>
  #maps-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  }

  #maps {
    width: 50%;
    height: 75%;
    background: var(--primary-background);
    border-radius: var(--large-radius);

    position: relative;

    padding: 1em;
    box-sizing: border-box;

    overflow-y: scroll;
  }

  h2 {
    padding-bottom: 0.2em;
    margin-bottom: 0.4em;
  }

  .shortcut-listing {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 0.125em 0.5em;
    margin-bottom: 0.3125em;
  }

  .shortcut-listing:hover {
    background-color: var(--lighter-background);
    border-radius: var(--large-radius);
  }

  p {
    margin: 0;
  }

  .keycode {
    font-family: monospace;
    background-color: var(--light-background);
    color: var(--text);
    padding-left: 1ch;
    border-radius: var(--small-radius);
    display: flex;
  }

  .keycode div {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .highlighted {
    color: var(--hexfriend-green);
  }
</style>
