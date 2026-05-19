<script lang="ts">
  import type { eraser_data, icon_data, PathData, terrain_data } from '../types/data'
  import type { SaveData } from '../types'
  import { HexOrientation } from '../types/terrain'
  import { Tools } from '../types/toolData'
  import { afterUpdate, onMount, tick } from 'svelte'
  import { data_path, data_icon, data_overlay, data_terrain, data_eraser } from '../stores/data'
  import { store_selected_tool } from '../stores/tools'
  import { loading_texture } from '../stores'

  import { tfield } from '../stores/tfield'
  import { tl } from '../stores/translation'

  export let loaded_save: SaveData

  let should_render_overlay: boolean = false
  $: {
    should_render_overlay = ($store_selected_tool === Tools.OVERLAY) || $loading_texture || loaded_save.overlay_base64 !== null
  }

  /* These proxies keep the buttons responsive */
  // TODO: these could probably just be *get*
  let data_path_proxy: PathData
  data_path.subscribe((n) => { data_path_proxy = n })

  let data_icon_proxy: icon_data
  data_icon.subscribe((n) => { data_icon_proxy = n })

  let data_terrain_proxy: terrain_data
  data_terrain.subscribe((n) => { data_terrain_proxy = n })

  let data_eraser_proxy: eraser_data
  data_eraser.subscribe((n) => { data_eraser_proxy = n })

  $: {
    data_terrain_proxy = data_terrain_proxy
    data_path_proxy = data_path_proxy
    data_icon_proxy = data_icon_proxy
    data_eraser_proxy = data_eraser_proxy

    buttons = buttons
  }

  let buttons = [
    {
      display: 'Terrain',
      toolCode: Tools.TERRAIN,

      miniButtons: [
        {
          display: $tl.tools.hex_paintbucket,
          action: function () {
            data_terrain.update((n) => {
              n.usingPaintbucket = !n.usingPaintbucket
              return n
            })
          },
          image: '/assets/img/tools/paintbucket.svg',
          obj: data_terrain_proxy,
          field: 'usingPaintbucket',
        },
        {
          display: $tl.tools.hex_eraser,
          action: function () {
            data_terrain.update((n) => {
              n.usingEraser = !n.usingEraser
              return n
            })
          },
          image: '/assets/img/tools/mini_eraser.svg',
          obj: data_terrain_proxy,
          field: 'usingEraser',
        },

        {
          display: $tl.tools.hex_eyedropper,
          action: function () {
            data_terrain.update((n) => {
              n.usingEyedropper = !n.usingEyedropper
              return n
            })
          },
          image: '/assets/img/tools/eyedropper.svg',
          obj: data_terrain_proxy,
          field: 'usingEyedropper',
        },
      ],
    },

    {
      display: 'Icon',
      toolCode: Tools.ICON,
      miniButtons: [
        {
          display: $tl.tools.icon_drag,
          action: function () {
            data_icon.update((n) => {
              n.dragMode = !n.dragMode
              return n
            })
          },
          image: '/assets/img/tools/drag.svg',
          obj: data_icon_proxy,
          field: 'dragMode',
        },

        {
          display: $tl.tools.icon_erase,
          action: function () {
            data_icon.update((n) => {
              n.usingEraser = !n.usingEraser
              return n
            })
          },
          image: '/assets/img/tools/mini_eraser.svg',
          obj: data_icon_proxy,
          field: 'usingEraser',
        },

        {
          display: $tl.tools.icon_snap,
          action: function () {
            data_icon.update((n) => {
              n.snapToHex = !n.snapToHex
              return n
            })
          },
          image: '/assets/img/tools/snap_icon.svg',
          obj: data_icon_proxy,
          field: 'snapToHex',
        },
        {
          display: $tl.tools.icon_eyedropper,
          action: function () {
            data_icon.update((n) => {
              n.usingEyedropper = !n.usingEyedropper
              return n
            })
          },
          image: '/assets/img/tools/eyedropper.svg',
          obj: data_icon_proxy,
          field: 'usingEyedropper',
        },
      ],
    },

    {
      display: 'Path',
      toolCode: Tools.PATH,
      miniButtons: [
        {
          display: $tl.tools.path_snap,
          action: function () {
            data_path.update((n) => {
              n.snap = !n.snap
              return n
            })
          },
          image: '/assets/img/tools/snap_path.svg',
          obj: data_path_proxy,
          field: 'snap',
        },
      ],
    },
    {
      display: 'Text',
      toolCode: Tools.TEXT,
      miniButtons: [],
    },
    {
      display: 'Eraser',
      toolCode: Tools.ERASER,
      miniButtons: [
        {
          display: $tl.tools.eraser_terrain,
          action: function () {
            data_eraser.update((n) => {
              n.eraseTerrain = !n.eraseTerrain
              return n
            })
          },
          image: '/assets/img/tools/terrain.svg',
          obj: data_eraser_proxy,
          field: 'eraseTerrain',
        },
        {
          display: $tl.tools.eraser_icon,
          action: function () {
            data_eraser.update((n) => {
              n.eraseIcons = !n.eraseIcons
              return n
            })
          },
          image: '/assets/img/tools/icon.svg',
          obj: data_eraser_proxy,
          field: 'eraseIcons',
        },
      ],
    },
    {
      display: 'Overlay',
      toolCode: Tools.OVERLAY,
      miniButtons: [],
    },
  ]

  export let changeTool: Function

  onMount(() => {
    store_selected_tool.subscribe(async (n) => {
      let el_selected_button = document.getElementById(`tool-button-${n}`)
      console.log(el_selected_button.offsetLeft)

      let clip_layer = document.getElementById('bottom-layer')

      // This little magic here means that when then overlay tool spawns in we can switch to it properly
      await tick()

      let new_clip_path = `circle(1.25em at ${el_selected_button.offsetLeft + el_selected_button.offsetWidth / 2}px ${
        el_selected_button.offsetTop + el_selected_button.offsetHeight / 2
      }px)`

      clip_layer.style.clipPath = new_clip_path
    })
  })
</script>

<main>
  {#each buttons as b}
    {#if b.miniButtons.length > 0}
      <div class="mini-button-container" class:risen={b.toolCode == $store_selected_tool}>
        {#each b.miniButtons as mb}
          <button
            class="mini-button"
            class:selected={mb.obj ? mb.obj[mb.field] : false}
            on:click={mb.action}
            title={mb.display}
          >
            <span class="mini-button-bg" style="-webkit-mask: url({mb.image})" />
          </button>
        {/each}
      </div>
    {/if}
  {/each}

  <div class="layer" id="top-layer">
    {#each buttons as b}
      <button
        on:click={() => { changeTool(b.toolCode) }}
        title={`${b.display} Tool`}
        class="tool-button"
        class:hidden={b.toolCode == Tools.OVERLAY && !should_render_overlay}
        id={`tool-button-${b.toolCode}`}
      >

        <div
          class="tool-icon"
          class:rotated90={(b.toolCode == Tools.TERRAIN || b.toolCode == Tools.OVERLAY) &&
            $tfield.orientation == HexOrientation.POINTYTOP}
          style={`-webkit-mask: url(/assets/img/tools/${b.toolCode}.svg) no-repeat center`}
        />
      </button>
    {/each}
  </div>

  <div class="layer" id="bottom-layer">
    {#each buttons as b}
      <button
        on:click={() => {
          changeTool(b.toolCode)
        }}
        title={`${b.display} Tool`}
        class="tool-button"
        class:hidden={b.toolCode == Tools.OVERLAY && !should_render_overlay}
        id={`b-tool-button-${b.toolCode}`}
      >

        <div
          class="tool-icon"
          class:rotated90={(b.toolCode == Tools.TERRAIN || b.toolCode == Tools.OVERLAY) &&
            $tfield.orientation == HexOrientation.POINTYTOP}
          style={`-webkit-mask: url(/assets/img/tools/${b.toolCode}.svg) no-repeat center`}
        />
      </button>
    {/each}
  </div>

</main>

<style>
  main {
    position: relative;
    display: flex;
    justify-content: center;
  }

  div.layer {
    display: flex;
    height: 2.5em;
    padding: 0.5em;
    background-color: var(--primary-background);

    border-radius: 1.75em;
    gap: 0.5em;
  }

  div#top-layer {
    position: absolute;
  }

  #top-layer .tool-icon {
    background-color: var(--lightest-background);
  }

  div#bottom-layer {
    background-color: var(--hexfriend-green);
    clip-path: circle(3.125em at 0.5em 0.5em);
    transition-duration: 0.2s;
    transition-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1.2);
  }
  #bottom-layer .tool-icon {
    background-color: var(--primary-background);
  }

  .tool-button {
    height: 100%;
    aspect-ratio: 1/1;

    position: relative;

    border: none;
    background-color: transparent;

    outline: none;
    cursor: pointer;
  }

  .tool-icon {
    width: 100%;
    height: 100%;
    transition-duration: 0.2s;
  }

  .rotated90 {
    rotate: 90deg;
    transition-duration: 0.2s;
  }

  .hidden {
    display: none;
  }

  /* Mini buttons */
  .mini-button-container {
    position: absolute;

    display: flex;
    gap: 0.5em;

    transition-duration: 0.2s;
    top: 0.25em;
    background-color: var(--dark-background);
    padding: 0.5em;
    box-sizing: border-box;
    border-top-right-radius: 0.5em;
    border-top-left-radius: 0.5em;
  }

  .mini-button-container.risen {
    top: -2.5em;
    transition-duration: 0.2s;
  }

  .mini-button {
    width: 2em;
    height: 2em;
    border-radius: 50%;

    background-color: var(--dark-background);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
  }

  .mini-button:hover {
    background-color: var(--light-background);
  }

  .mini-button.selected {
    background-color: var(--hexfriend-green);
    outline: none;
  }

  .mini-button span {
    width: 70%;
    height: 70%;
    background-color: var(--lightest-background);
  }

  .mini-button.selected span {
    background-color: var(--primary-background);
    outline: none;
  }
</style>
