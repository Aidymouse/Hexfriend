<script lang="ts">
  import '../../styles/settings.css'

  import { data_overlay } from '../../stores/data'
  import { store_selected_tool } from '../../stores/tools'
  import { store_has_unsaved_changes } from '../../stores/flags'
  import { tl } from '../../stores/translation'

  import { tools } from '../../types/toolData'

  export let showSettings

  let overlay_files: FileList
  function import_overlay_image() {
    if (!overlay_files[0]) return

    let r = new FileReader()
    r.readAsDataURL(overlay_files[0])
    r.onload = (eb) => {
      let b64 = r.result as string

      $data_overlay.base64 = b64
      $data_overlay.scale.x = 1
      $data_overlay.scale.y = 1
      showSettings = false
      store_selected_tool.update((n) => tools.OVERLAY)

      $store_has_unsaved_changes = true
    }
  }
</script>

<div class="settings-grid" style={'justify-items: start;'}>
  <button class="file-input-button" style="width: 100%; grid-column: 1/3; min-height: 30px;">
    {#if $data_overlay.base64 == ''}{$tl.settings.overlay.load}{:else}{$tl.settings.overlay.replace}{/if}
    <input
      type="file"
      accept="image/*"
      bind:files={overlay_files}
      on:change={() => {
        import_overlay_image()
      }}
    />
  </button>
</div>
