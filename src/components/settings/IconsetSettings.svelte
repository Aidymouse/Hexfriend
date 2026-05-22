<script lang="ts">
  import '../../styles/settings.css'

  import { LATEST_DEFAULT_ICONS_VERSION, type SaveData } from '../../types/savedata'
  import { type Iconset } from '../../types/icon'

  import { store_has_unsaved_changes } from '../../stores/flags'
  import { store_loaded_save } from '../../stores'
  import { tl } from '../../stores/translation'
  import { copy_iconset } from '../../helpers/iconFns'

  import * as texture_loader from '../../lib/texture_loader'

  import IconLayer from '../../layers/IconLayer.svelte'
  import IconPanel from '../../panels/IconPanel.svelte'

  import { convert_iconset_to_latest } from '../../lib/iconsetConverter'
  import SettingHeading from './SettingHeading.svelte'
  import { completeUndoState, startUndoState } from '../../lib'

  export let comp_iconLayer: IconLayer
  export let comp_icon_panel: IconPanel


  let loadedIconsets: Iconset[]
  store_loaded_save.subscribe(ls => {
    loadedIconsets = ls.iconsets
  })

  export let appState

  function removeIconset(setId: string) {

    if (!confirm($tl.settings.icon_sets.remove_confirmation)) { return }

    const iconsetToRemove = loadedIconsets.find((is: Iconset) => is.id === setId)

    // TODO: this is very inefficient, but until loadedSave is depended on entirely for icons, it will do
    const [icons_before_removal, icons_after_removal] = comp_iconLayer.removeAllIconsOfSet(iconsetToRemove)

    startUndoState({iconsets: $store_loaded_save.iconsets, icons: icons_before_removal }, `Remove Iconset ${setId}`)

    $store_loaded_save.iconsets = $store_loaded_save.iconsets.filter((is: Iconset) => is.id != setId)
    loadedIconsets = $store_loaded_save.iconsets

    comp_icon_panel.selectIcon(loadedIconsets[0].icons[0])

    completeUndoState({iconsets: $store_loaded_save.iconsets, icons: icons_after_removal }, `Remove Iconset ${setId}`)


    $store_has_unsaved_changes = true
  }

  let iconsetFiles: FileList

  async function importIconset() {
    let importFile = iconsetFiles[0]

    if (!importFile) return

    let r = new FileReader()
    r.readAsText(importFile)
    r.onload = async (eb) => {
      /* Read the file */
      let setToImport = JSON.parse(eb.target.result as string)

      /* Check that set hasn't already been imported */
      const existingIconset = loadedIconsets.find((is: Iconset) =>
        is.id == setToImport.id ||
        (is.id.split(':')[0] === 'default' && setToImport.id.split(':')[0] === 'default'),
      ) 

      if (existingIconset !== undefined) {
        if (confirm($tl.settings.icon_sets.make_copy_confirmation)) {
          let new_id = `${setToImport.id}_copy`
          let counter = 0
          while (loadedIconsets.find((is) => is.id === new_id)) {
            counter += 1
            new_id = `${new_id}_copy_${counter}`
          }
          setToImport = copy_iconset(setToImport, new_id)
        }
      }

      setToImport = await convert_iconset_to_latest(setToImport)

      /* We also have to load all of these textures */
      //addIconsetTextures(setToImport, L);
      await texture_loader.load_iconset_textures(setToImport)

      startUndoState({iconsets: $store_loaded_save.iconsets}, `Load Iconset ${setToImport.name} (${setToImport.id})`)

      $store_loaded_save.iconsets.push(setToImport)
      $store_loaded_save.iconsets = $store_loaded_save.iconsets // inexplicably, this line makes the icon panel update instantly
      loadedIconsets = $store_loaded_save.iconsets

      completeUndoState({iconsets: $store_loaded_save.iconsets})

      $store_has_unsaved_changes = true
    }
  }
</script>

<div id="iconsets">
  {#each loadedIconsets as iconset (iconset.id)}
    <div class="loaded-tileset">
      <span style="display: flex">
        {iconset.name}
        <span class="helper-text">v{iconset.version}</span>
      </span>

      {#if iconset.id.split(':')[0] !== 'default' || (loadedIconsets.find((is) => is.id === 'default') && iconset.id !== 'default')}
        <button
          on:click={() => {
            removeIconset(iconset.id)
          }}
        >
          <img src="/assets/img/tools/trash.png" alt={'Trash'} title={'Remove Iconset'} />
        </button>
      {/if}
    </div>
  {/each}

  <span>
    <button class="file-input-button"
      >{$tl.settings.icon_sets.import}
      <input
        type="file"
        accept=".hfis"
        bind:files={iconsetFiles}
        on:change={() => {
          importIconset()
        }}
      /></button
    >
    <button
      on:click={() => {
        appState = 'iconsetCreator'
      }}>{$tl.settings.icon_sets.builder}</button
    >
  </span>
</div>

<style>
  button {
    min-height: 30px;
  }

  #iconsets {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 30px;
    grid-auto-rows: auto;
    row-gap: 5px;
    margin-top: var(--large-radius);
  }

  #iconsets span {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 5px;
  }
</style>
