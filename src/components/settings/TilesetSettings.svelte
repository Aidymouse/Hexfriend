<script lang="ts">
  import '../../styles/settings.css'

  import type { Tileset } from '../../types/tilesets'

  import { LATEST_TILESET_FORMAT_VERSION, LATEST_DEFAULT_TILESET_VERSION } from '../../types/tilesets'

  import { store_has_unsaved_changes } from '../../stores/flags'
  import { tfield } from '../../stores/tfield'
  import { tl } from '../../stores/translation'

  import { update_map_to_new_default_tileset, update_tileset_format } from '../../lib/tileset_updater'
  import * as texture_loader from '../../lib/texture_loader'

  import { get_tileset_id } from '../../helpers/tiles'
  import { DEFAULTTILESET } from '../../lib/defaultTileset'

  export let comp_terrainLayer
  export let comp_terrain_panel

  export let loadedSave
  export let loadedTilesets: Tileset[]

  export let appState

  let tilesetFiles: FileList

  function importTileset() {
    let importFile = tilesetFiles[0]

    if (!importFile) return

    let r = new FileReader()
    r.readAsText(importFile)
    r.onload = (eb) => {
      /* Read the file */
      let setToImport = JSON.parse(eb.target.result as string)

      let set_already_imported = loadedTilesets.find((ts: Tileset) => ts.id == setToImport.id)

      /* Check that set hasn't already been imported */
      if (set_already_imported != null) {
        alert($tl.settings.tilesets.already_loaded)
        return
      }

      if (setToImport.format_version < LATEST_TILESET_FORMAT_VERSION) {
        setToImport = update_tileset_format(setToImport)
      }

      loadedTilesets.push(setToImport)
      loadedTilesets = loadedTilesets

      /* We also have to load all of these textures */
      //addTilesetTextures(setToImport, L);
      texture_loader.load_tileset_textures(setToImport)
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

  function update_default_tileset() {
    let successfully_updated = update_map_to_new_default_tileset($tfield)
    if (!successfully_updated) return

    // Remove default tileset
    loadedTilesets = loadedTilesets.filter((ts) => get_tileset_id(ts) != 'default')
    loadedTilesets.push(DEFAULTTILESET)
    loadedSave.tilesets = loadedTilesets
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

      <!-- Update Default Tileset Button -->
      {#if get_tileset_id(tileset) == 'default' && tileset.version < LATEST_DEFAULT_TILESET_VERSION}
        <button
          id="default-tileset-update-button"
          on:click={() => {
            update_default_tileset()
          }}
          title={`Update Tileset to v${LATEST_DEFAULT_TILESET_VERSION}`}
        >
          <img src="/assets/img/ui/arrow.png" alt={''} title={`Update Tileset to v${LATEST_DEFAULT_TILESET_VERSION}`} />
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
