<script lang="ts">
  import { coords_cubeToWorld } from '../helpers/hexHelpers'
  import { breakDownHexID } from '../helpers/hexHelpers'

  import { data_coordinates } from '../stores/data'

  import { tfield } from '../stores/tfield'

  import { store_has_unsaved_changes } from '../stores/flags'
  import { coord_system, type CoordText } from '../types/coordinates'
  import type { HexId } from '../types/toolData'
  import * as PIXI from 'pixi.js'
  import { onMount } from 'svelte'
  import { map_shape } from '../types/settings'
  import {
    genCoord_axial,
    genCoord_cube,
    genCoord_letterNumber,
    genCoord_rowCol,
    getHexCoordParams,
    type GenCoordFn,
  } from '../helpers'
  import type { CoordinatesData } from '../types'

  $: {
    Object.entries(coordTexts).forEach(([hexId, text]) => {
      text.pixiText.style = $data_coordinates.style
      text.pixiText.resolution = 4
    })

    cont_textContainer.visible = $data_coordinates.shown
  }

  let coordTexts: { [key: HexId]: CoordText } = {}

  export let cont_coordinates: PIXI.Container
  let cont_textContainer = new PIXI.Container()
  cont_coordinates.addChild(cont_textContainer)

  function coordTextExists(hexId: HexId) {
    return coordTexts[hexId] != null
  }

  function generateAllCoords(system: coord_system) {
    Object.keys($tfield.hexes).forEach((hexId: HexId) => {
      generateNewCoord(hexId, system)
    })
    $store_has_unsaved_changes = true
  }

  export function populateBlankHexes() {
    Object.keys($tfield.hexes).forEach((hexId: HexId) => {
      if (!coordTextExists(hexId)) {
        generateNewCoord(hexId)
      }
    })

    if ($tfield.mapShape == map_shape.FLOWER && $data_coordinates.system == coord_system.LETTERNUMBER) {
      updateAllCoordsText()
    }
    $store_has_unsaved_changes = true
  }

  export function generateNewCoord(hexId: HexId, system: coord_system = $data_coordinates.system) {
    if (coordTextExists(hexId)) {
      console.log(`You already have a text at ${hexId}! Use updateCoord() instead, goofball.`)
      updateCoordPosition(hexId)
      updateCoordText(hexId)
      return
    }

    coordTexts[hexId] = { pixiText: new PIXI.Text('', $data_coordinates.style), parts: [] }
    coordTexts[hexId].pixiText.anchor.x = 0.5
    coordTexts[hexId].pixiText.anchor.y = 1
    cont_textContainer.addChild(coordTexts[hexId].pixiText)

    let generated = generateCoordTextAndParts(hexId)

    coordTexts[hexId].pixiText.text = generated.text
    coordTexts[hexId].parts = [...generated.parts]

    updateCoordPosition(hexId)
    $store_has_unsaved_changes = true
  }

  export function updateAllCoordPositions() {
    Object.keys(coordTexts).forEach((hexId: HexId) => {
      updateCoordPosition(hexId)
    })

    if ($data_coordinates.system == coord_system.LETTERNUMBER) {
      updateAllCoordsText()
    }

    $store_has_unsaved_changes = true
  }

  export function completeUpdate() {
    cullUnusedCoordinates()
    updateAllCoordPositions()
    updateAllCoordsText()
    populateBlankHexes()
  }

  function updateCoordPosition(hexId: HexId) {
    let text = coordTexts[hexId]

    let idParts = breakDownHexID(hexId)
    let newPos = coords_cubeToWorld(
      idParts.q,
      idParts.r,
      idParts.s,
      $tfield.orientation,
      $tfield.hexWidth + $tfield.gap,
      $tfield.hexHeight + $tfield.gap,
      $tfield.gap,
    )

    text.pixiText.position.x = newPos.x
    text.pixiText.position.y = newPos.y + $tfield.hexHeight / 2 - $data_coordinates.gap
  }

  export function eliminateCoord(hexId: HexId) {
    cont_textContainer.removeChild(coordTexts[hexId].pixiText)
    coordTexts[hexId].pixiText.destroy()
    delete coordTexts[hexId]

    $store_has_unsaved_changes = true
  }

  function getGeneratorFn(): GenCoordFn {
    switch ($data_coordinates.system) {
      case coord_system.CUBE:
        return genCoord_cube
      case coord_system.AXIAL:
        return genCoord_axial
      case coord_system.ROWCOL:
        return genCoord_rowCol
      case coord_system.LETTERNUMBER:
        return genCoord_letterNumber
    }
  }

  /* @deprecated - fn to be found BEFORE generating coord texts */
  function generateCoordTextAndParts(
    hexId: HexId,
    system: coord_system = $data_coordinates.system,
  ): { parts: number[]; text: string } {
    switch (system) {
      case coord_system.CUBE: {
        return genCoord_cube(hexId, $data_coordinates.seperator, $data_coordinates.offsets, getHexCoordParams($tfield))
      }

      case coord_system.ROWCOL: {
        return genCoord_rowCol(
          hexId,
          $data_coordinates.seperator,
          $data_coordinates.offsets,
          getHexCoordParams($tfield),
        )
      }

      case coord_system.AXIAL: {
        return genCoord_axial(hexId, $data_coordinates.seperator, $data_coordinates.offsets, getHexCoordParams($tfield))
      }

      case coord_system.LETTERNUMBER: {
        return genCoord_letterNumber(
          hexId,
          $data_coordinates.seperator,
          $data_coordinates.offsets,
          getHexCoordParams($tfield),
        )
      }
    }
  }

  export function updateAllCoordsText() {
    const genFn: GenCoordFn = getGeneratorFn()
    Object.keys(coordTexts).forEach((hexId: HexId) => {
      updateCoordText(hexId, genFn)
    })
    $store_has_unsaved_changes = true
  }

  export function updateCoordText(hexId: HexId, genFn?: GenCoordFn) {
    let coordGenerator = genFn ?? getGeneratorFn()
    let generated = coordGenerator(
      hexId,
      $data_coordinates.seperator,
      $data_coordinates.offsets,
      getHexCoordParams($tfield),
    )
    coordTexts[hexId].parts = [...generated.parts]
    coordTexts[hexId].pixiText.text = generated.text
  }

  export function cullUnusedCoordinates() {
    Object.keys(coordTexts).forEach((hexId: HexId) => {
      if ($tfield.hexes[hexId] == null) {
        eliminateCoord(hexId)
      }
    })

    if ($tfield.mapShape == map_shape.FLOWER && $data_coordinates.system == coord_system.LETTERNUMBER) {
      updateAllCoordsText()
    }

    $store_has_unsaved_changes = true
  }

  export const applyCoordsData = (newData: Partial<CoordinatesData>) => {
    $data_coordinates = { ...$data_coordinates, ...newData }

    // The most inefficient version of this possible
    // TODO: conditionally re-render / reposition based on newData
    completeUpdate()
  }

  onMount(() => {
    cont_coordinates.removeChildren(0)

    cont_textContainer = new PIXI.Container()
    cont_coordinates.addChild(cont_textContainer)

    cullUnusedCoordinates()
    generateAllCoords($data_coordinates.system)
  })
</script>
