<script lang="ts">
  import '../../styles/settings.css'

  import type { Tileset } from '../../types/tilesets'

  import { LATEST_TILESET_FORMAT_VERSION, LATEST_DEFAULT_TILESET_VERSION } from '../../types/tilesets'
  import { update_map_to_new_default_tileset } from '../../lib/tileset_updater'

  import { store_has_unsaved_changes } from '../../stores/flags'
  import { tfield } from '../../stores/tfield'
  import { tl } from '../../stores/translation'

  import { convert_tileset_to_latest } from '../../lib/tilesetConverter'
  import * as texture_loader from '../../lib/texture_loader'

  import { get_tileset_id } from '../../helpers/tiles'
  import { DEFAULTTILESET } from '../../lib/defaultTileset'
  import { copy_tileset } from '../../helpers/tileFns'

  export let comp_terrainLayer
  export let comp_terrain_panel

  export let loadedSave
  export let loadedTilesets: Tileset[]

  export let appState

  let tilesetFiles: FileList

  async function importTileset() {
    let importFile = tilesetFiles[0]

    if (!importFile) return

    let r = new FileReader()
    r.readAsText(importFile)
    r.onload = async (eb) => {
      /* Read the file */
      let setToImport = JSON.parse(eb.target.result as string)

      let set_already_imported = loadedTilesets.find((ts: Tileset) => ts.id == setToImport.id)

      /* Check that set hasn't already been imported */
      if (set_already_imported != null) {
        if (confirm($tl.settings.tilesets.make_copy_confirmation)) {
          let new_id = `${setToImport.id}_copy`
          let counter = 0
          while (loadedTilesets.find((ts) => ts.id === new_id)) {
            counter += 1
            new_id = `${setToImport.id}_copy_${counter}`
          }
          setToImport = copy_tileset(setToImport, new_id)
        }
      }

      setToImport = await convert_tileset_to_latest(setToImport)

      /* We also have to load all of these textures */
      //addTilesetTextures(setToImport, L);
      texture_loader.load_tileset_textures(setToImport)

      loadedTilesets.push(setToImport)
      loadedTilesets = loadedTilesets

      $store_has_unsaved_changes = true
    }
  }

  function removeTileset(setId: string) {
    if (!confirm($tl.settings.tilesets.remove_confirmation)) return

    comp_terrainLayer.removeAllTilesOfSet(setId)
    comp_terrain_panel.reset_tile()

    // This line will need to change if the default tileset ever gets removeable
    //data_terrain.tile = {...loadedTilesets[0].tiles[0]}

    loadedTilesets = loadedTilesets.filter((ts: Tileset) => ts.id != setId)
    loadedSave.tilesets = loadedTilesets

    $store_has_unsaved_changes = true

    // Maybe we should remove tiles here, because otherwise the tiles just... fail to load.
    // Check if these tiles are being used anywere
  }
</script>

<div id="tilesets">
  {#each loadedTilesets as tileset (tileset.id)}
    <div
      class="loaded-tileset"
      on:click={() => {
        console.log(tileset)
      }}
      on:keydown={() => {}}
    >
      <span style="display: flex;"
        >{tileset.name}
        <span class="helper-text">v{tileset.version}</span></span
      >

      {#if get_tileset_id(tileset) != 'default'}
        <button
          class="set-rollover-button"
          on:click={() => {
            removeTileset(tileset.id)
          }}
        >
          <img src="/assets/img/tools/trash.png" alt={'Trash'} title={'Remove Tileset'} />
        </button>
      {/if}
    </div>
  {/each}

  <span>
    <button class="file-input-button"
      >{$tl.settings.tilesets.import}<input
        type="file"
        accept=".hfts"
        bind:files={tilesetFiles}
        on:change={() => {
          importTileset()
        }}
      /></button
    >
    <button
      on:click={() => {
        appState = 'tilesetCreator'
      }}>{$tl.settings.tilesets.builder}</button
    >
  </span>
</div>

<style>
  button {
    min-height: 30px;
  }

  #tilesets {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 30px;
    grid-auto-rows: auto;
    row-gap: 5px;
    margin-top: var(--large-radius);
  }

  #default-tileset-update-button {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loaded-tileset:hover button.set-rollover-button {
    opacity: 1;
  }

  .loaded-tileset button.set-rollover-button {
    opacity: 0;
  }

  #tilesets span {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 5px;
  }
</style>
