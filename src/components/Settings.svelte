<script lang="ts">
  // Types
  import type CoordsLayer from '../layers/CoordsLayer.svelte'
  import type IconLayer from '../layers/IconLayer.svelte'
  import type PathLayer from '../layers/PathLayer.svelte'
  import type TerrainLayer from '../layers/TerrainLayer.svelte'
  import type TextLayer from '../layers/TextLayer.svelte'
  import type TerrainPanel from '../panels/TerrainPanel.svelte'
  import type { Iconset } from '../types/icon'
  import type { save_data } from '../types/savedata'
  import type { Tileset } from '../types/tilesets'
  import { Map_Exports } from '../types/export'

  // Styles
  import '../styles/settings.css'

  // Stores
  import { tfield } from '../stores/tfield'
  import { resize_parameters } from '../stores/resize_parameters'
  import { tl, switch_translation, translation_map } from '../stores/translation'

  // Components
  import GridSettings from './settings/GridSettings.svelte'
  import SettingHeading from './settings/SettingHeading.svelte'
  import HexesSettings from './settings/HexesSettings.svelte'
  import DimensionSettings from './settings/DimensionSettings.svelte'
  import CoordinateSettings from './settings/CoordinateSettings.svelte'
  import OverlaySettings from './settings/OverlaySettings.svelte'
  import TilesetSettings from './settings/TilesetSettings.svelte'
  import IconsetSettings from './settings/IconsetSettings.svelte'
  import GeneratorSettings from './settings/GeneratorSettings.svelte'

  // Lib
  import { onMount } from 'svelte'
  import SelectGrid from './SelectGrid.svelte'
  import type { HexSizeParams } from '../lib/map_resize'
  import { map_shape } from '../types/settings'
  import SavedMaps from './SavedMaps.svelte'

  export let loadedSave: save_data
  export let showSettings: boolean
  export let appState
  export let showTerrainGenerator: boolean
  export let show_icon_generator: boolean

  export let exportMap: Function

  let hidden_settings = {
    grid: true,
    hexes: true,
    dimensions: true,
    coordinates: true,
    overlay: true,
    tilesets: true,
    iconsets: true,
    experimental: true,
  }

  export let renderAllHexes: Function
  export let renderGrid: Function
  export let redrawEntireMap: Function

  //export let data_terrain: terrain_data
  export let loadedTilesets: Tileset[]
  export let loadedIconsets: Iconset[]

  export let comp_terrainLayer: TerrainLayer
  export let comp_iconLayer: IconLayer
  export let comp_pathLayer: PathLayer
  export let comp_textLayer: TextLayer
  export let comp_coordsLayer: CoordsLayer

  export let comp_terrain_panel: TerrainPanel

  export let load: Function

  let retainIconPosition: boolean = true
  let retainPathPosition: boolean = true
  let retainTextPosition: boolean = true
  let retain_icon_scale: boolean = true

  let exportType: 'Export As...' | 'image/png' | 'application/json' = 'Export As...'

  let iconset_text = 'Icon Set'

  function retain_positions_on_resize() {
    const old_hex_size: HexSizeParams = {
      width: $resize_parameters.old_hex_width,
      height: $resize_parameters.old_hex_height,
      orientation: $resize_parameters.old_orientation,
      gap: $resize_parameters.old_gap,
    }
    const new_hex_size: HexSizeParams = {
      width: $tfield.hexWidth,
      height: $tfield.hexHeight,
      orientation: $tfield.orientation,
      gap: $tfield.grid.gap,
    }

    if (retainIconPosition) comp_iconLayer.retain_icon_position_on_hex_resize(old_hex_size, new_hex_size)
    if (retainPathPosition) comp_pathLayer.retain_path_position_on_hex_resize(old_hex_size, new_hex_size)
    if (retainTextPosition) comp_textLayer.retain_text_position_on_hex_resize(old_hex_size, new_hex_size)
  }

  const retain_positions_on_orientation_change = () => {
    if ($tfield.mapShape === map_shape.FLOWER) {
      retain_positions_on_resize() // Equiv. because Orientation is tracked in resize params
    } else {
      const old_hex_size: HexSizeParams = {
        width: $resize_parameters.old_hex_width,
        height: $resize_parameters.old_hex_height,
        orientation: $resize_parameters.old_orientation,
        gap: $resize_parameters.old_gap,
      }
      const new_hex_size: HexSizeParams = {
        width: $tfield.hexWidth,
        height: $tfield.hexHeight,
        orientation: $tfield.orientation,
        gap: $tfield.grid.gap,
      }

      if (retainIconPosition)
        comp_iconLayer.retain_icon_position_on_orientation_change(old_hex_size, new_hex_size, $tfield.raised)
      if (retainPathPosition)
        comp_pathLayer.retain_path_position_on_orientation_change(old_hex_size, new_hex_size, $tfield.raised)
      if (retainTextPosition)
        comp_textLayer.retain_text_position_on_orientation_change(old_hex_size, new_hex_size, $tfield.raised)
    }
  }

  /** Retains scale of icons on hex changes */
  const retain_scale = () => {
    const new_hex_size: HexSizeParams = {
      width: $tfield.hexWidth,
      height: $tfield.hexHeight,
      orientation: $tfield.orientation,
      gap: $tfield.grid.gap,
    }
    if (retain_icon_scale) comp_iconLayer.retain_icon_scale(new_hex_size)
  }

  function save_old_resize_parameters() {
    $resize_parameters.old_hex_width = $tfield.hexWidth
    $resize_parameters.old_hex_height = $tfield.hexHeight
    $resize_parameters.old_gap = $tfield.grid.gap
    $resize_parameters.old_orientation = $tfield.orientation

    //console.log(resize_parameters)
  }

  // Imports
  let mapImportFiles: FileList
  function importMap() {
    if (!mapImportFiles[0]) return

    let confirm = window.confirm(
      `This will discard your currently loaded map '${loadedSave.title}' (make sure it's saved!)\nAre you sure you want to load '${mapImportFiles[0].name}'?`,
    )
    if (!confirm) return

    let r = new FileReader()
    r.readAsText(mapImportFiles[0])
    r.onload = (eb) => {
      let saveData = JSON.parse(eb.target.result as string)
      //console.log(saveData)
      load(saveData, null)
    }
  }

  onMount(() => {
    save_old_resize_parameters()

    hexfriend_blink()
  })

  let hexfriend_affection = 0
  let petting_hexfriend = false
  let hexfriend_hearts = false

  function getRandomInt(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
  }

  function hexfriend_blink() {
    // console.log(petting_hexfriend)
    if (!(petting_hexfriend || hexfriend_hearts)) {
      // console.log("HUH!?")
      document.getElementById('little-hexfriend').innerHTML = '⟨ -‿- ⟩'
      setTimeout(() => {
        if (!(petting_hexfriend || hexfriend_hearts)) {
          document.getElementById('little-hexfriend').innerHTML = '⟨ •‿• ⟩'
        }
      }, 400)
    }
    setTimeout(hexfriend_blink, getRandomInt(60, 120) * 1000)
  }

  function hexfriend_pet() {
    if (!petting_hexfriend) return
    hexfriend_affection += 1

    document.getElementById('floating-hexfriend').style.opacity = `${hexfriend_affection / 100}`

    if (hexfriend_affection > 100) {
      // TODO: Some hearts
      document.getElementById('floating-hexfriend').style.opacity = '0'

      document.getElementById('little-hexfriend').innerHTML = '⟨ ꈍ‿ꈍ ⟩'
      document.getElementById('floating-hexfriend').innerHTML = '⟨ ꈍ‿ꈍ ⟩'
      document.getElementById('floating-hexfriend').style.transitionDuration = '2s'
      document.getElementById('floating-hexfriend').style.opacity = '0'

      hexfriend_hearts = true
      setTimeout(() => {
        document.getElementById('floating-hexfriend').innerHTML = '⟨ >‿• ⟩'
        document.getElementById('floating-hexfriend').style.transitionDuration = '0s'
        hexfriend_hearts = false
        hexfriend_stop_petting()
      }, 2000)
    }
  }

  function hexfriend_stop_petting() {
    if (hexfriend_hearts) return
    document.getElementById('floating-hexfriend').style.opacity = '0'
    document.getElementById('little-hexfriend').innerHTML = '⟨ •‿• ⟩'
    document.getElementById('little-hexfriend').style.cursor = 'grab'
    petting_hexfriend = false
    hexfriend_affection = 0
  }

  function hexfriend_start_petting(e: MouseEvent) {
    if (hexfriend_hearts) return
    document.getElementById('little-hexfriend').innerHTML = '⟨ >‿• ⟩'
    document.getElementById('little-hexfriend').style.cursor = 'grabbing'
    petting_hexfriend = true
  }
</script>

<button
  id="close-tab"
  class:shown={showSettings}
  on:click={() => {
    showSettings = false
  }}
  title={'Close Settings'}
>
  <img src="/assets/img/ui/back.png" alt={'Back'} />
</button>

<div id="settings" class:shown={showSettings}>
  <input
    style="font-size: 20pt; font-family: Segoe UI; border-radius: var(--small-radius); padding: 0.3em; width: 100%; box-sizing: border-box;"
    type="text"
    placeholder="Map Title"
    bind:value={loadedSave.title}
  />

  <!-- EXPORT / IMPORT -->
  <span style="display: grid; grid-template-columns: 1fr 1fr; margin-top: 0.25em; gap: 0.25em;">
    <select
      class="outline"
      bind:value={exportType}
      title={$tl.general.export}
      on:change={() => {
        exportMap(exportType)
        exportType = 'Export As...'
      }}
    >
      <option value={Map_Exports.PLACEHOLDER} style="display: none">{$tl.settings.export_as}</option>
      <option value={Map_Exports.PNG}>{$tl.settings.exports.png}</option>
      <option value={Map_Exports.SCALED_PNG}>{$tl.settings.exports.scaled_png}</option>
      <option value={Map_Exports.JSON}>{$tl.settings.exports.hexfriend}</option>
    </select>

    <button class="file-input-button outline-button" on:click={() => {}} title="Import">
      {$tl.general.import}
      <input
        type="file"
        accept=".hexfriend"
        bind:files={mapImportFiles}
        on:change={() => {
          importMap()
        }}
      />
    </button>

    <!-- LANGUAGE -->
    <select
      class="outline"
      style="grid-column: 1/3"
      value={$tl.language}
      on:change={(e) => {
        switch_translation(e.currentTarget.value)
      }}
    >
      {#each Object.entries(translation_map) as [tl_code, translation] (translation.label)}
        <option value={tl_code}>{translation.label}</option>
      {/each}
    </select>
  </span>

  <!-- GRID -->
  <div class="setting-container">
    <SettingHeading text={$tl.settings.grid.title} bind:toggle={hidden_settings.grid} />
    <div class="settings-hider" class:hidden={hidden_settings.grid}>
      <div class="hider">
        <GridSettings
          bind:comp_terrainLayer
          bind:comp_coordsLayer
          {renderGrid}
          {redrawEntireMap}
          retain_positions={retain_positions_on_resize}
          {save_old_resize_parameters}
        />
      </div>
    </div>
  </div>

  <!-- HEXES -->
  <div class="setting-container">
    <SettingHeading text={$tl.settings.hexes.title} bind:toggle={hidden_settings.hexes} />
    <div class="settings-hider" class:hidden={hidden_settings.hexes}>
      <div class="hider">
        <HexesSettings
          bind:comp_coordsLayer
          bind:comp_terrainLayer
          bind:retainIconPosition
          bind:retainPathPosition
          bind:retainTextPosition
          bind:retainIconScale={retain_icon_scale}
          retain_positions={retain_positions_on_resize}
          {save_old_resize_parameters}
          {renderAllHexes}
          {redrawEntireMap}
          retain_positions_orientation_change={retain_positions_on_orientation_change}
          {retain_scale}
        />
      </div>
    </div>
  </div>

  <!-- DIMENSIONS AND SHAPE -->
  <div class="setting-container">
    <SettingHeading text={$tl.settings.shape.title} bind:toggle={hidden_settings.dimensions} />
    <div class="settings-hider" class:hidden={hidden_settings.dimensions}>
      <div class="hider">
        <DimensionSettings bind:comp_terrainLayer bind:comp_iconLayer bind:comp_textLayer bind:comp_pathLayer />
      </div>
    </div>
  </div>

  <!-- COORDINATES -->
  <div class="setting-container">
    <SettingHeading text={$tl.settings.coordinates.title} bind:toggle={hidden_settings.coordinates} />
    <div class="settings-hider" class:hidden={hidden_settings.coordinates}>
      <div class="hider">
        <CoordinateSettings bind:comp_coordsLayer />
      </div>
    </div>
  </div>

  <!-- OVERLAY -->
  <div class="setting-container">
    <SettingHeading text={$tl.settings.overlay.title} bind:toggle={hidden_settings.overlay} />
    <div class="settings-hider" class:hidden={hidden_settings.overlay}>
      <div class="hider">
        <OverlaySettings bind:showSettings />
      </div>
    </div>
  </div>

  <!-- TILE SETS -->
  <div class="setting-container">
    <SettingHeading text={$tl.settings.tilesets.title} bind:toggle={hidden_settings.tilesets} />
    <div class="settings-hider" class:hidden={hidden_settings.tilesets}>
      <div class="hider">
        <TilesetSettings
          bind:loadedSave
          bind:loadedTilesets
          bind:comp_terrainLayer
          bind:comp_terrain_panel
          bind:appState
        />
      </div>
    </div>
  </div>

  <!-- ICON SETS -->
  <div class="setting-container">
    <SettingHeading text={$tl.settings.icon_sets.title} bind:toggle={hidden_settings.iconsets} />
    <div class="settings-hider" class:hidden={hidden_settings.iconsets}>
      <div class="hider">
        <IconsetSettings bind:loadedSave bind:loadedIconsets bind:iconset_text bind:appState />
      </div>
    </div>
  </div>

  <!-- GENERATORS -->
  <div class="setting-container">
    <SettingHeading text={$tl.settings.generators.title} bind:toggle={hidden_settings.experimental} />
    <div class="settings-hider" class:hidden={hidden_settings.experimental}>
      <div class="hider">
        <GeneratorSettings bind:show_icon_generator bind:showTerrainGenerator bind:showSettings />
      </div>
    </div>
  </div>

  <!-- Changelog -->
  <a
    href="https://github.com/Aidymouse/Hexfriend/blob/master/changelog.md"
    target={'_blank'}
    style="color: var(--text);"
  >
    <div class="setting-container">
      <h2 class="setting-heading">
        {$tl.settings.changelog}
        <button
          ><img alt={'Go to Changelog'} src={'/assets/img/ui/arrow.png'} style="transform: rotate(90deg);" /></button
        >
      </h2>
    </div>
  </a>

  <div class="setting-container">
    <h2>{$tl.settings.about.title}</h2>
    <p class="helper-text">
      Hexfriend v3.1 - {$tl.settings.about.version_tagline}
    </p>

    <p class="helper-text" style="margin-top: var(--small-radius)">
      {$tl.settings.about.credits.start}
      <a href="https://github.com/Aidymouse/Hexfriend/graphs/contributors"
        >{$tl.settings.about.credits.contributorlink}</a
      >
      {$tl.settings.about.credits.end}
    </p>

    <p class="helper-text" style="margin-top: var(--small-radius)">
      {$tl.settings.about.wiki.start}
      <a href="https://github.com/Aidymouse/Hexfriend/wiki">{$tl.settings.about.wiki.wiki_link_text}</a>.
      {$tl.settings.about.wiki.end}
    </p>

    <p class="helper-text" style="margin-top: var(--small-radius)">
      {$tl.settings.about.guts.start}
      <a href="https://www.github.com/Aidymouse/Hexfriend">{$tl.settings.about.guts.github_link}</a>
      {$tl.settings.about.guts.end}
    </p>

    <p class="helper-text" style="margin-top: var(--small-radius)">
      {$tl.settings.about.socials.start}
      <a href="https://discord.gg/Jvws27VmWR">{$tl.settings.about.socials.discord_link}</a>
      {$tl.settings.about.socials.end}
    </p>

    <p class="helper-text" style="margin-top: var(--small-radius)">
      {$tl.settings.about.money.start}
      <a href="https://ko-fi.com/aidymouse">{$tl.settings.about.money.kofi_link}</a>.
      {$tl.settings.about.money.end}
    </p>
  </div>

  <div id="hexfriends-house">
    <p
      id="little-hexfriend"
      on:mousedown={hexfriend_start_petting}
      on:mousemove={hexfriend_pet}
      on:mouseup={hexfriend_stop_petting}
      on:mouseleave={hexfriend_stop_petting}
      on:blur={hexfriend_stop_petting}
    >
      ⟨ •‿• ⟩
    </p>
    <p id="floating-hexfriend" class="hexfriend-ungreen">⟨ >‿• ⟩</p>
  </div>
</div>

<style>
  .hexfriend-ungreen {
    color: var(--hexfriend-green) !important;
  }

  #hexfriends-house {
    display: flex;
    justify-content: center;
  }

  #floating-hexfriend,
  #little-hexfriend {
    text-align: center;
    font-size: 20pt;
    font-style: normal;
    color: var(--lightest-background);
    cursor: grab;
    max-width: auto;
  }

  #little-hexfriend {
    transition-duration: 2s;
  }

  #floating-hexfriend {
    position: absolute;
    pointer-events: none;
    color: var(--hexfriend-green);
    opacity: 0;
  }

  #little-hexfriend:active {
    cursor: grabbing;
  }

  .setting-container {
    background-color: var(--light-background);
    padding: 0.5em;
    padding-left: 0.5em;
    padding-right: 0.5em;
    border-radius: var(--large-radius);
    margin-top: 0.25em;
  }

  .setting-heading {
    display: flex;
    position: relative;
  }

  .setting-heading button {
    width: 3em;
    height: 2em;
    position: absolute;
    height: 100%;
    right: 0px;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
  }

  .setting-heading button:hover {
    background-color: var(--lighter-background);
  }

  .setting-heading button img {
    height: 80%;
    transition-duration: 0.2s;
  }

  .setting-heading button img.rotated {
    rotate: 180deg;
    transition-duration: 0.2s;
  }

  .settings-hider {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows 0.2s ease-in-out;
  }

  .hider {
    /* allows for smooth hiding transition */
    overflow-y: hidden;
  }

  .hidden {
    grid-template-rows: 0fr;
  }

  a {
    color: var(--hexfriend-green);
  }

  a:visited {
    color: var(--hexfriend-green);
  }

  #export-map-select {
    border: solid 1px var(--lighter-background);
    border-radius: var(--small-radius);
    background-color: var(--primary-background);
    padding: 0.3125em;
    transition-duration: 0.2s;

    text-align: center;
  }

  #export-map-select:hover {
    background-color: var(--light-background);
  }

  h2 {
    margin: 0;
  }

  p {
    margin: 0;
  }

  #settings {
    position: absolute;
    top: 0;
    left: -19em;
    width: 19em;
    height: 100%;
    background: var(--primary-background);
    box-sizing: border-box;

    padding: 1em;

    overflow-y: scroll;
    transition-duration: 0.2s;
  }

  #settings.shown {
    left: 0px !important;
  }

  #close-tab {
    position: absolute;
    left: -2.5em;
    top: 0;
    width: 2.5em;
    height: 8em;
    border-radius: 0em;
    border-top-right-radius: var(--large-radius);
    border-bottom-right-radius: var(--large-radius);
    border: none;
    background: var(--primary-background);
    transition-duration: 0.2s;
    transition-timing-function: ease;
    padding: 0.5em;
    box-sizing: border-box;
  }

  #close-tab.shown {
    left: 22.75em;
  }

  #close-tab:hover {
    background: var(--light-background);
  }

  #close-tab img {
    margin: 0;
    width: 100%;
  }
</style>
