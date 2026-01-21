<script lang="ts">
  import type { cube_coords } from '../types/coordinates'
  import type { terrain_data } from '../types/data'
  import type { shortcut_data } from '../types/inputs'
  import type { pan_state } from '../types/panning'
  import type { TerrainHex, terrain_field } from '../types/terrain'
  import type { Tile } from '../types/tilesets'
  import type { hex_id, HexId } from '../types/toolData'
  import { tools } from '../types/toolData'
  import type CoordsLayer from './CoordsLayer.svelte'

  import { data_terrain } from '../stores/data'
  import { data_overlay } from '../stores/data'
  import * as store_panning from '../stores/panning'
  import { tfield } from '../stores/tfield'
  import { store_inputs } from '../stores/inputs'

  import { tiles_match, compress_tile } from '../helpers/tiles'
  import {
    coords_cubeToWorld,
    coords_qToCube,
    coords_rToCube,
    coords_worldToCube,
    genCoordsObj,
    genHexId,
    genHexId_coordsObj,
    getHexPath,
    getNeighbours,
    getRing,
    id_to_coords,
  } from '../helpers/hexHelpers'

  import { tl } from '../stores/translation'

  // Enums
  import { HexOrientation, HexRaised } from '../types/terrain'
  import { map_shape } from '../types/settings'

  // There's probably some clean up to do in that different colored hexes can have the same ID...
  // This isnt *really* an issue, because ID is only used for symbol textures and we want those to double up anyway.
  import { store_has_unsaved_changes } from '../stores/flags'
  import * as PIXI from 'pixi.js'
  import { onMount } from 'svelte'

  import { get_symbol_texture } from '../lib/texture_loader'
  import { get_icon_scale_for_hex } from '../helpers/imageSizing'
  import type { PreviewHexInfo } from '../helpers/iconFns'
  import { generate_tile_previews } from '../helpers/tileFns'

  import { DEFAULTTILESET } from '../lib/defaultTileset'
  import { record_undo_action } from '../lib/undo_handler'
  import { UndoActions, type UndoAction } from '../types/undoTypes'
  export let cont_terrain: PIXI.Container

  export let changeTool: Function

  let terrainGraphics = new PIXI.Graphics()
  let symbolsContainer = new PIXI.Container()
  let gridGraphics = new PIXI.Graphics()

  cont_terrain.addChild(terrainGraphics)
  cont_terrain.addChild(symbolsContainer)
  cont_terrain.addChild(gridGraphics)

  let terrainSprites: { [key: hex_id]: PIXI.Sprite } = {}

  // Since all placed terrain must be one tile, we can just store the tile.
  let placed_terrain: { tile: Tile, hex_ids: string[] } = { 
    tile: compress_tile(DEFAULTTILESET.tiles[0]),
    hex_ids: []
  }
  let replaced_terrain: {[hexid: string]: Tile} = {}

  let pan: pan_state
  store_panning.store.subscribe((newPan) => {
    pan = newPan
  })

  export let comp_coordsLayer: CoordsLayer

  export function copyHex(from: TerrainHex, to: TerrainHex) {
    to.tile = structuredClone(from.tile)
  }

  /* SQUARE SHAPED MAPS */
  export function square_updateRaisedColumn() {
    // the labels look backwards, but thats cos the value is bound to the thing that triggers this function

    if ($tfield.raised == 'odd') {
      for (let col = 1; col < $tfield.columns; col += 2) {
        // Create hex at bottom of column
        let newHexCoords: cube_coords = coords_qToCube('odd', col, $tfield.rows - 1)
        let newId: hex_id = genHexId_coordsObj(newHexCoords)
        $tfield.hexes[newId] = {
          q: newHexCoords.q,
          r: newHexCoords.r,
          s: newHexCoords.s,
          tile: null,
        }
        comp_coordsLayer.generateNewCoord(newId)

        // Move all hexes one down
        for (let row = $tfield.rows - 1; row >= 0; row--) {
          let destinationCoords = coords_qToCube('odd', col, row)
          let destinationHex = $tfield.hexes[genHexId_coordsObj(destinationCoords)]

          let sourceId = coords_qToCube('odd', col, row - 1)
          let sourceHex = $tfield.hexes[genHexId_coordsObj(sourceId)]

          copyHex(sourceHex, destinationHex)
          comp_coordsLayer.updateCoordText(genHexId_coordsObj(destinationCoords))
        }

        let oldHexCoords = coords_qToCube('even', col, 0)
        eraseHex(genHexId_coordsObj(oldHexCoords))
        delete $tfield.hexes[genHexId_coordsObj(oldHexCoords)]
        comp_coordsLayer.eliminateCoord(genHexId_coordsObj(oldHexCoords))
      }
    } else if ($tfield.raised == 'even') {
      for (let col = 1; col < $tfield.columns; col += 2) {
        // Create hex at top of column
        let newHexCoords = coords_qToCube('even', col, 0)
        let newId = genHexId_coordsObj(newHexCoords)
        $tfield.hexes[newId] = {
          q: newHexCoords.q,
          r: newHexCoords.r,
          s: newHexCoords.s,
          tile: null,
        }
        comp_coordsLayer.generateNewCoord(newId)

        // Move all hexes one up
        for (let row = 0; row < $tfield.rows; row++) {
          let destinationCoords = coords_qToCube('even', col, row)
          let destinationHex = $tfield.hexes[genHexId_coordsObj(destinationCoords)]

          let sourceId = coords_qToCube('even', col, row + 1)
          let sourceHex = $tfield.hexes[genHexId_coordsObj(sourceId)]

          copyHex(sourceHex, destinationHex)
          comp_coordsLayer.updateCoordText(genHexId_coordsObj(destinationCoords))
        }

        let oldHexCoords = coords_qToCube('odd', col, $tfield.rows - 1)
        eraseHex(genHexId_coordsObj(oldHexCoords))
        delete $tfield.hexes[genHexId_coordsObj(oldHexCoords)]
        comp_coordsLayer.eliminateCoord(genHexId_coordsObj(oldHexCoords))
      }
    }

    renderAllHexes()
  }

  export function square_changeIndentedRow() {
    if ($tfield.raised == 'odd') {
      for (let row = 1; row < $tfield.rows; row += 2) {
        // Create hex at right of row
        let newHexCoords = coords_rToCube('odd', $tfield.columns - 1, row)
        let newId = genHexId_coordsObj(newHexCoords)
        $tfield.hexes[newId] = {
          q: newHexCoords.q,
          r: newHexCoords.r,
          s: newHexCoords.s,
          tile: null,
        }
        comp_coordsLayer.generateNewCoord(newId)

        // Move all hexes one right
        for (let col = $tfield.columns - 1; col >= 0; col--) {
          let destinationCoords = coords_rToCube('odd', col, row)
          let destinationHex = $tfield.hexes[genHexId_coordsObj(destinationCoords)]

          let sourceId = coords_rToCube('odd', col - 1, row)
          let sourceHex = $tfield.hexes[genHexId_coordsObj(sourceId)]

          copyHex(sourceHex, destinationHex)
          comp_coordsLayer.updateCoordText(genHexId_coordsObj(destinationCoords))
        }

        let oldHexCoords = coords_rToCube('even', 0, row)
        eraseHex(genHexId_coordsObj(oldHexCoords))
        delete $tfield.hexes[genHexId_coordsObj(oldHexCoords)]
        comp_coordsLayer.eliminateCoord(genHexId_coordsObj(oldHexCoords))
      }
    } else if ($tfield.raised == 'even') {
      for (let row = 1; row < $tfield.rows; row += 2) {
        // Create hex at top of column
        let newHexCoords = coords_rToCube('even', 0, row)
        let newId = genHexId_coordsObj(newHexCoords)
        $tfield.hexes[newId] = {
          q: newHexCoords.q,
          r: newHexCoords.r,
          s: newHexCoords.s,
          tile: null,
        }
        comp_coordsLayer.generateNewCoord(newId)

        // Move all hexes one up
        for (let col = 0; col < $tfield.columns; col++) {
          let destinationCoords = coords_rToCube('even', col, row)
          let destinationHex = $tfield.hexes[genHexId_coordsObj(destinationCoords)]

          let sourceId = coords_rToCube('even', col + 1, row)
          let sourceHex = $tfield.hexes[genHexId_coordsObj(sourceId)]

          copyHex(sourceHex, destinationHex)
          comp_coordsLayer.updateCoordText(genHexId_coordsObj(destinationCoords))
        }

        let oldHexCoords = coords_rToCube('odd', $tfield.columns - 1, row)
        eraseHex(genHexId_coordsObj(oldHexCoords))
        delete $tfield.hexes[genHexId_coordsObj(oldHexCoords)]
        comp_coordsLayer.eliminateCoord(genHexId_coordsObj(oldHexCoords))
      }
    }

    renderAllHexes()
  }

  function square_changeOrientation() {
    let newHexes = {}

    for (let col = 0; col < $tfield.columns; col++) {
      for (let row = 0; row < $tfield.rows; row++) {
        let newHexCoords =
          $tfield.orientation == 'flatTop'
            ? coords_qToCube($tfield.raised, col, row)
            : coords_rToCube($tfield.raised, col, row)

        let sourceHexCoords =
          $tfield.orientation == 'flatTop'
            ? coords_rToCube($tfield.raised, col, row)
            : coords_qToCube($tfield.raised, col, row)
        let sourceHex: TerrainHex = $tfield.hexes[genHexId_coordsObj(sourceHexCoords)]

        let newHex = {
          ...sourceHex,
          q: newHexCoords.q,
          r: newHexCoords.r,
          s: newHexCoords.s,
        }

        newHexes[genHexId_coordsObj(newHexCoords)] = newHex
      }
    }

    $tfield.hexes = newHexes
    //for (var i = symbolsContainer.children.length - 1; i >= 0; i--) {symbolsContainer.removeChild(symbolsContainer.children[i]);};
    clearTerrainSprites()
    renderAllHexes()
  }

  export function square_expandMapDimension(direction: 'left' | 'right' | 'top' | 'bottom', amount: number) {
    $store_has_unsaved_changes = true

    // Will come back here later...
    // Why??
    switch (direction) {
      case 'right':
        square_expandRight(amount)
        break

      case 'left':
        square_expandRight(amount)
        square_moveAllHexesRight(amount)

        if ($tfield.orientation == 'flatTop') {
          let delta_x = ($tfield.hexWidth + $tfield.grid.gap) * 0.75 * amount
          pan.offsetX -= delta_x * pan.zoomScale
          $data_overlay.x += delta_x

          if (amount % 2 == 1) {
            $tfield.raised = $tfield.raised == HexRaised.ODD ? HexRaised.EVEN : HexRaised.ODD
            square_updateRaisedColumn()
            let delta_y = ($tfield.hexHeight + $tfield.grid.gap) * 0.5 * ($tfield.raised == 'odd' ? -1 : 1)
            pan.offsetY += delta_y * pan.zoomScale

            $data_overlay.y -= delta_y
          }
        } else {
          let delta_x = ($tfield.hexWidth + $tfield.grid.gap) * amount
          pan.offsetX -= delta_x * pan.zoomScale
          $data_overlay.x += delta_x
        }

        break

      case 'bottom':
        square_expandDown(amount)
        break

      case 'top':
        square_expandDown(amount)
        square_moveAllHexesDown(amount)

        if ($tfield.orientation == 'flatTop') {
          let delta_y = ($tfield.hexHeight + $tfield.grid.gap) * amount
          pan.offsetY -= delta_y * pan.zoomScale

          $data_overlay.y += delta_y
        } else {
          let delta_y = ($tfield.hexHeight + $tfield.grid.gap) * 0.75 * amount
          pan.offsetY -= delta_y * pan.zoomScale
          $data_overlay.y += delta_y

          if (amount % 2 == 1) {
            $tfield.raised = $tfield.raised == HexRaised.ODD ? HexRaised.EVEN : HexRaised.ODD
            square_changeIndentedRow()
            let delta_x = ($tfield.hexWidth + $tfield.grid.gap) * 0.5 * ($tfield.raised == 'odd' ? -1 : 1)
            pan.offsetX += delta_x * pan.zoomScale
            $data_overlay.x -= delta_x
          }
        }

        break
    }

    store_panning.store.update(() => {
      return pan
    })

    renderAllHexes()
  }

  function square_expandRight(amount: number) {
    for (let col = 0; col < amount; col++) {
      for (let row = 0; row < $tfield.rows; row++) {
        let newHexCoords =
          $tfield.orientation == 'flatTop'
            ? coords_qToCube($tfield.raised, $tfield.columns, row)
            : coords_rToCube($tfield.raised, $tfield.columns, row)

        $tfield.hexes[genHexId_coordsObj(newHexCoords)] = {
          q: newHexCoords.q,
          r: newHexCoords.r,
          s: newHexCoords.s,
          tile: null,
        }
        comp_coordsLayer.generateNewCoord(genHexId_coordsObj(newHexCoords))
      }

      $tfield.columns += 1
    }
  }

  function square_moveAllHexesRight(amount: number) {
    for (let col = $tfield.columns - 1; col >= amount; col--) {
      for (let row = 0; row < $tfield.rows; row++) {
        let destinationCoords =
          $tfield.orientation == 'flatTop'
            ? coords_qToCube($tfield.raised, col, row)
            : coords_rToCube($tfield.raised, col, row)
        let destinationHex = $tfield.hexes[genHexId_coordsObj(destinationCoords)]

        let sourceColumn = col - amount

        let sourceCoords =
          $tfield.orientation == 'flatTop'
            ? coords_qToCube($tfield.raised, sourceColumn, row)
            : coords_rToCube($tfield.raised, sourceColumn, row)
        let sourceHex = $tfield.hexes[genHexId_coordsObj(sourceCoords)]

        copyHex(sourceHex, destinationHex)

        if (sourceColumn < amount) {
          sourceHex.tile = null
        }
      }
    }
  }

  function square_expandDown(amount: number) {
    for (let col = 0; col < $tfield.columns; col++) {
      for (let row = 0; row < amount; row++) {
        let newHexCoords =
          $tfield.orientation == 'flatTop'
            ? coords_qToCube($tfield.raised, col, $tfield.rows + row)
            : coords_rToCube($tfield.raised, col, $tfield.rows + row)

        $tfield.hexes[genHexId_coordsObj(newHexCoords)] = {
          q: newHexCoords.q,
          r: newHexCoords.r,
          s: newHexCoords.s,
          tile: null,
        }
        comp_coordsLayer.generateNewCoord(genHexId_coordsObj(newHexCoords))
      }
    }
    $tfield.rows += amount
  }

  function square_moveAllHexesDown(amount: number) {
    for (let col = 0; col < $tfield.columns; col++) {
      for (let row = $tfield.rows - 1; row >= amount; row--) {
        let destinationCoords =
          $tfield.orientation == 'flatTop'
            ? coords_qToCube($tfield.raised, col, row)
            : coords_rToCube($tfield.raised, col, row)
        let destinationHex = $tfield.hexes[genHexId_coordsObj(destinationCoords)]

        let sourceRow = row - amount

        let sourceCoords =
          $tfield.orientation == 'flatTop'
            ? coords_qToCube($tfield.raised, col, sourceRow)
            : coords_rToCube($tfield.raised, col, sourceRow)
        let sourceHex = $tfield.hexes[genHexId_coordsObj(sourceCoords)]

        copyHex(sourceHex, destinationHex)

        if (sourceRow < amount) {
          sourceHex.tile = null
        }
      }
    }
  }

  export function square_reduceMapDimension(direction: 'left' | 'right' | 'top' | 'bottom', amount: number) {
    $store_has_unsaved_changes = true

    switch (direction) {
      case 'right':
        if (amount >= $tfield.columns) amount = $tfield.columns - 1
        if (amount == 0) return
        square_removeRight(amount)

        break

      case 'left':
        if (amount >= $tfield.columns) amount = $tfield.columns - 1
        if (amount == 0) return

        // Move everything 1 left
        square_moveAllHexesLeft(amount)
        square_removeRight(amount)

        if ($tfield.orientation == 'flatTop') {
          if (amount % 2 == 1) {
            $tfield.raised = $tfield.raised == HexRaised.ODD ? HexRaised.EVEN : HexRaised.ODD
            square_updateRaisedColumn()
          }

          let delta_x = ($tfield.hexWidth + $tfield.grid.gap) * 0.75 * amount
          let delta_y =
            ($tfield.hexHeight + $tfield.grid.gap) *
            0.5 *
            ($tfield.raised == 'odd' ? -1 : 1) *
            (amount % 2 == 0 ? 0 : 1)

          pan.offsetX += delta_x * pan.zoomScale
          pan.offsetY += delta_y * pan.zoomScale

          $data_overlay.x -= delta_x
          $data_overlay.y -= delta_y
        } else {
          let delta_x = ($tfield.hexWidth + $tfield.grid.gap) * amount
          pan.offsetX += delta_x * pan.zoomScale

          $data_overlay.x -= delta_x
        }

        break

      case 'bottom':
        if (amount >= $tfield.rows) amount = $tfield.rows - 1
        if (amount == 0) return

        square_removeBottom(amount)
        break

      case 'top':
        if (amount >= $tfield.rows) amount = $tfield.rows - 1
        if (amount == 0) return

        square_moveAllHexesUp(amount)
        square_removeBottom(amount)

        if ($tfield.orientation == 'flatTop') {
          let delta_y = $tfield.hexHeight * amount
          pan.offsetY += delta_y * pan.zoomScale

          $data_overlay.y -= delta_y
        } else {
          let delta_y = $tfield.hexHeight * 0.75 * amount
          pan.offsetY += delta_y * pan.zoomScale
          $data_overlay.y -= delta_y

          if (amount % 2 == 1) {
            $tfield.raised = $tfield.raised == HexRaised.ODD ? HexRaised.EVEN : HexRaised.ODD
            square_changeIndentedRow()
            let delta_x = ($tfield.hexWidth + $tfield.grid.gap) * 0.5 * ($tfield.raised == 'odd' ? -1 : 1)
            pan.offsetX += delta_x * pan.zoomScale
            $data_overlay.x -= delta_x
          }
        }

        break
    }

    store_panning.store.update(() => {
      return pan
    })

    renderAllHexes()
  }

  function square_removeRight(amount: number) {
    for (let col = 0; col < amount; col++) {
      for (let row = 0; row < $tfield.rows; row++) {
        let fatedHexCoords =
          $tfield.orientation == 'flatTop'
            ? coords_qToCube($tfield.raised, $tfield.columns - 1, row)
            : coords_rToCube($tfield.raised, $tfield.columns - 1, row)
        eliminateHex(genHexId_coordsObj(fatedHexCoords))
      }

      $tfield.columns -= 1
    }
  }

  function square_moveAllHexesLeft(amount: number) {
    for (let col = 0; col <= $tfield.columns - 1 - amount; col++) {
      for (let row = 0; row < $tfield.rows; row++) {
        let destinationCoords =
          $tfield.orientation == 'flatTop'
            ? coords_qToCube($tfield.raised, col, row)
            : coords_rToCube($tfield.raised, col, row)
        let destinationHex = $tfield.hexes[genHexId_coordsObj(destinationCoords)]

        let sourceColumn = col + amount

        let sourceCoords =
          $tfield.orientation == 'flatTop'
            ? coords_qToCube($tfield.raised, sourceColumn, row)
            : coords_rToCube($tfield.raised, sourceColumn, row)
        let sourceHex = $tfield.hexes[genHexId_coordsObj(sourceCoords)]

        copyHex(sourceHex, destinationHex)

        if (sourceColumn > $tfield.columns - 1 - amount) {
          sourceHex.tile = null
        }
      }
    }
  }

  function square_removeBottom(amount: number) {
    for (let col = 0; col < $tfield.columns; col++) {
      for (let row = 0; row < amount; row++) {
        let newHexCoords =
          $tfield.orientation == 'flatTop'
            ? coords_qToCube($tfield.raised, col, $tfield.rows - 1 - row)
            : coords_rToCube($tfield.raised, col, $tfield.rows - 1 - row)

        eliminateHex(genHexId_coordsObj(newHexCoords))
      }
    }
    $tfield.rows -= amount
  }

  function square_moveAllHexesUp(amount: number) {
    for (let col = 0; col < $tfield.columns; col++) {
      for (let row = 0; row <= $tfield.rows - 1 - amount; row++) {
        let destinationCoords =
          $tfield.orientation == 'flatTop'
            ? coords_qToCube($tfield.raised, col, row)
            : coords_rToCube($tfield.raised, col, row)
        let destinationHex = $tfield.hexes[genHexId_coordsObj(destinationCoords)]

        let sourceRow = row + amount

        let sourceCoords =
          $tfield.orientation == 'flatTop'
            ? coords_qToCube($tfield.raised, col, sourceRow)
            : coords_rToCube($tfield.raised, col, sourceRow)
        let sourceHex = $tfield.hexes[genHexId_coordsObj(sourceCoords)]

        copyHex(sourceHex, destinationHex)

        if (sourceRow > $tfield.rows - 1 - amount) {
          sourceHex.tile = null
        }
      }
    }
  }

  /* FLOWER SHAPED MAPS */
  export function flower_expandHexesOut(amount: number) {
    $store_has_unsaved_changes = true

    for (let curRing = 0; curRing < amount; curRing++) {
      $tfield.hexesOut += 1

      let idsToAdd = getRing('0:0:0', $tfield.hexesOut)

      idsToAdd.forEach((hexId) => {
        createBlankHex(genCoordsObj(hexId))
        renderHex(hexId)
      })
    }

    renderGrid()
    comp_coordsLayer.populateBlankHexes()

    // unused
    // store_$tfield.store.update(() => {
    // 	return $tfield;
    // });
  }

  export function flower_reduceHexesOut(amount: number) {
    $store_has_unsaved_changes = true

    if ($tfield.hexesOut == 0) return

    for (let curRing = 0; curRing < amount; curRing++) {
      let idsToAdd = getRing('0:0:0', $tfield.hexesOut)

      idsToAdd.forEach((hexId) => {
        eliminateHex(hexId)
      })

      $tfield.hexesOut -= 1
    }

    renderAllHexes()
    renderGrid()
    comp_coordsLayer.cullUnusedCoordinates()

    // unused
    // store_$tfield.store.update(() => {
    // 	return $tfield;
    // });
  }

  /* TRANSFORMATIONS THAT APPLY TO ALL MAP TYPES */
  function createBlankHex(coords: cube_coords) {
    $tfield.hexes[genHexId_coordsObj(coords)] = {
      q: coords.q,
      r: coords.r,
      s: coords.s,
      tile: null,
    }
  }

  export function changeOrientation() {
    $store_has_unsaved_changes = true

    switch ($tfield.mapShape) {
      case map_shape.SQUARE:
        square_changeOrientation()
        break

      case map_shape.FLOWER:
        renderAllHexes()
        // Perhaps... a flower orientation change algorithm that finds the closest hex in screen space after transformation and maps shit like that
        // Might cause hex overlaps though... preventable?
        break
    }

    comp_coordsLayer.cullUnusedCoordinates()
  }

  export function changeMapShape(newMapShape: map_shape) {
    $store_has_unsaved_changes = true

    switch (newMapShape) {
      case map_shape.SQUARE:
        square_generateBlankMap()
        break

      case map_shape.FLOWER:
        flower_generateBlankMap()
        break
    }
  }

  function square_generateBlankMap() {
    eliminateAllHexes()

    for (let col = 0; col < $tfield.columns; col++) {
      for (let row = 0; row < $tfield.rows; row++) {
        let cubeCoords =
          $tfield.orientation == HexOrientation.FLATTOP
            ? coords_qToCube($tfield.raised, col, row)
            : coords_rToCube($tfield.raised, col, row)

        createBlankHex(cubeCoords)
      }
    }

    comp_coordsLayer.cullUnusedCoordinates()
    comp_coordsLayer.populateBlankHexes()
    comp_coordsLayer.updateAllCoordPositions()

    renderAllHexes()
    renderGrid()
  }

  function flower_generateBlankMap() {
    eliminateAllHexes()

    for (let q = -$tfield.hexesOut; q <= $tfield.hexesOut; q++) {
      for (let r = -$tfield.hexesOut; r <= $tfield.hexesOut; r++) {
        if (q + r <= $tfield.hexesOut && q + r >= -$tfield.hexesOut) {
          createBlankHex({
            q: q,
            r: r,
            s: -q - r,
          })
        }
      }
    }

    comp_coordsLayer.cullUnusedCoordinates()
    comp_coordsLayer.populateBlankHexes()
    comp_coordsLayer.updateAllCoordPositions()

    renderAllHexes()
    renderGrid()
  }

  function eliminateAllHexes() {
    Object.keys($tfield.hexes).forEach((hexId: hex_id) => {
      eliminateHex(hexId)
    })
  }

  /* RENDER FUNCTIONS */
  export function renderGrid() {
    gridGraphics.clear()
    if (!$tfield.grid.shown) return

    gridGraphics.lineStyle($tfield.grid.thickness, $tfield.grid.stroke)

    Object.keys($tfield.hexes).forEach((hexId: hex_id) => {
      let hex = $tfield.hexes[hexId]

      let hexC = coords_cubeToWorld(
        hex.q,
        hex.r,
        hex.s,
        $tfield.orientation,
        $tfield.hexWidth,
        $tfield.hexHeight,
        $tfield.grid.gap,
      )

      gridGraphics.drawPolygon(
        getHexPath(
          $tfield.hexWidth + $tfield.grid.gap,
          $tfield.hexHeight + $tfield.grid.gap,
          $tfield.orientation,
          hexC.x,
          hexC.y,
        ),
      )
    })
  }

  export function renderSelectiveHexes(callback: Function) {
    // Re-renders hexes that pass true
    Object.keys($tfield.hexes).forEach((hexId: hex_id) => {
      if (callback($tfield.hexes[hexId])) renderHex(hexId)
    })
  }

  export async function renderAllHexes() {
    terrainGraphics.clear()
    Object.keys($tfield.hexes).forEach((hexId: hex_id) => {
      renderHex(hexId)
    })
    renderGrid()
  }

  export function renderHex(hexId: hex_id) {
    let hex = $tfield.hexes[hexId]
    let hexWorldCoords = coords_cubeToWorld(
      hex.q,
      hex.r,
      hex.s,
      $tfield.orientation,
      $tfield.hexWidth,
      $tfield.hexHeight,
      $tfield.grid.gap,
    )

    if (hex.tile === null) {
      terrainGraphics.beginFill($tfield.blankHexColor)
      terrainGraphics.drawPolygon(
        getHexPath($tfield.hexWidth, $tfield.hexHeight, $tfield.orientation, hexWorldCoords.x, hexWorldCoords.y),
      )
      terrainGraphics.endFill()

      if (terrainSprites[hexId]) {
        symbolsContainer.removeChild(terrainSprites[hexId])
        terrainSprites[hexId].destroy()
        delete terrainSprites[hexId]
      }

      return
    }

    terrainGraphics.beginFill(hex.tile.bgColor)
    terrainGraphics.drawPolygon(
      getHexPath($tfield.hexWidth, $tfield.hexHeight, $tfield.orientation, hexWorldCoords.x, hexWorldCoords.y),
    )
    terrainGraphics.endFill()

    if (hex.tile.symbol === null) {
      if (terrainSprites[hexId]) {
        symbolsContainer.removeChild(terrainSprites[hexId])
        terrainSprites[hexId].destroy()
        delete terrainSprites[hexId]
      }

      return
    }

    let ns: PIXI.Sprite

    if (terrainSprites[hexId]) {
      // Re-use the sprite that already exists
      ns = terrainSprites[hexId]
    } else {
      // Make a new sprite
      ns = new PIXI.Sprite()
      ns.anchor.set(0.5)
      symbolsContainer.addChild(ns)
      terrainSprites[hexId] = ns
    }

    ns.texture = get_symbol_texture(hex.tile)
    ns.scale = get_icon_scale_for_hex(hex.tile.symbol, { hexWidth: $tfield.hexWidth, hexHeight: $tfield.hexHeight })
    ns.tint = hex.tile.symbol.color
    ns.position.set(hexWorldCoords.x, hexWorldCoords.y) // Position is updated even though it's usually the same, but if hex has been resized since last draw the symbol position will be different
    ns.rotation = PIXI.DEG_TO_RAD * (hex.tile.symbol.rotation ?? 0)
  }

  /* PAINT */
  export function paintFromTile(hexId: hex_id, tile: Tile, render: boolean = true) {
    if (!hexExists(hexId)) return

    if (tiles_match($tfield.hexes[hexId].tile, tile)) return

    $tfield.hexes[hexId].tile = tile
      ? {
          ...tile,
          preview_flatTop: '',
          preview_pointyTop: '',
          symbol: tile.symbol ? { ...tile.symbol, base64: '' } : null,
        }
      : null
    if (render) renderHex(hexId)
  }

  export function placeTerrain() {
    $store_has_unsaved_changes = true

    //$data_terrain = $data_terrain
    // Needs checking if terrain matches what we're trying to place already
    if ($store_inputs.mouseDown[0]) {
      let x = store_panning.curWorldX()
      let y = store_panning.curWorldY()
      let clickedCoords = coords_worldToCube(
        x,
        y,
        $tfield.orientation,
        $tfield.hexWidth,
        $tfield.hexHeight,
        $tfield.grid.gap,
      )

      let clickedId = genHexId(clickedCoords.q, clickedCoords.r, clickedCoords.s)

      // Update undo registers
      if (hexExists(clickedId) && replaced_terrain[clickedId] === undefined) {
	const existing_tile = $tfield.hexes[clickedId].tile
	replaced_terrain[clickedId] = existing_tile ? compress_tile(existing_tile) : null
	placed_terrain.hex_ids = placed_terrain.hex_ids.concat(clickedId) 
	placed_terrain.tile = compress_tile($data_terrain.tile)
      }

      // Paint the tilee	
      paintFromTile(clickedId, $data_terrain.tile)

    }
  }

  function paintHexFromData(hexId: hex_id) {
    $store_has_unsaved_changes = true

    //$data_terrain = $data_terrain

    paintFromTile(hexId, $data_terrain.tile)
  }

  /* CHECKS */
  export function areAllHexesBlank(): boolean {
    return null == Object.entries($tfield.hexes).find(([id, hex]) => hex.tile != null)
  }

  export function hexExists(hexId: hex_id): boolean {
    return $tfield.hexes[hexId] != undefined
  }

  function hexesMatch(hexId1: hex_id, hexId2: hex_id): boolean {
    if (!hexExists(hexId1)) return false
    if (!hexExists(hexId2)) return false

    let hex1 = $tfield.hexes[hexId1]
    let hex2 = $tfield.hexes[hexId2]

    return tiles_match(hex1.tile, hex2.tile)
  }

  function hexMatchesData(hexId: hex_id): boolean {
    if (!hexExists(hexId)) return false

    let hex = $tfield.hexes[hexId]

    return tiles_match(hex.tile, $data_terrain.tile)
  }

  /* USER ACTIONS */
  export function removeAllTilesOfSet(setId: string) {
    $store_has_unsaved_changes = true

    Object.entries($tfield.hexes).forEach(([hexId, hex]: [hex_id, TerrainHex]) => {
      if (!hex.tile) return

      let hexSetId = hex.tile.tileset_id
      if (setId == hexSetId) {
        eraseHex(hexId)
      }
    })
  }

  function eyedrop() {
    if ($store_inputs.mouseDown[0]) {
      let x = store_panning.curWorldX()
      let y = store_panning.curWorldY()
      let clickedCoords = coords_worldToCube(
        x,
        y,
        $tfield.orientation,
        $tfield.hexWidth,
        $tfield.hexHeight,
        $tfield.grid.gap,
      )

      let clickedId = genHexId(clickedCoords.q, clickedCoords.r, clickedCoords.s)

      if (!hexExists(clickedId)) return

      let cHex = $tfield.hexes[clickedId]

      if (cHex.tile == null) {
        changeTool(tools.ERASER)
        $data_terrain.usingEyedropper = false
        return
      }

      $data_terrain.tile = structuredClone(cHex.tile)
      $data_terrain.usingEyedropper = false
      // HACKY!!!!
      $data_terrain.genPreview = true
    }
  }

  export function eraseAtMouse() {
    $store_has_unsaved_changes = true

    let clickedCoords = coords_worldToCube(
      store_panning.curWorldX(),
      store_panning.curWorldY(),
      $tfield.orientation,
      $tfield.hexWidth,
      $tfield.hexHeight,
      $tfield.grid.gap,
    )

    let clickedId = genHexId(clickedCoords.q, clickedCoords.r, clickedCoords.s)

    if (hexExists(clickedId)) eraseHex(clickedId)
  }

  export function eraseHex(hexId: hex_id) {
    $tfield.hexes[hexId].tile = null
    renderHex(hexId)
  }

  function paintbucket() {
    let x = store_panning.curWorldX()
    let y = store_panning.curWorldY()
    let clickedCoords = coords_worldToCube(
      x,
      y,
      $tfield.orientation,
      $tfield.hexWidth,
      $tfield.hexHeight,
      $tfield.grid.gap,
    )

    let clickedId = genHexId_coordsObj(clickedCoords)
    if (!hexExists(clickedId)) return
    if (hexMatchesData(clickedId)) return

    // Check if hex in data matches the clicked style. If it does, abort painting!
    // Should be done in paint terrain as well

    getContiguousHexIdsOfSameType(clickedId).forEach((hexId: hex_id) => {
      paintHexFromData(hexId)
    })

    $store_has_unsaved_changes = true
  }

  function erasePaintbucket() {
    // Find all like hexes, much like a paintbucket, and perform a specific operation on them, passing in hex id as a parameter

    let clickedId = genHexId_coordsObj(
      coords_worldToCube(
        store_panning.curWorldX(),
        store_panning.curWorldY(),
        $tfield.orientation,
        $tfield.hexWidth,
        $tfield.hexHeight,
        $tfield.grid.gap,
      ),
    )

    if (!hexExists(clickedId)) return
    if ($tfield.hexes[clickedId].tile == null) return

    let hexes = getContiguousHexIdsOfSameType(clickedId)
    hexes.forEach((hexId: hex_id) => {
      eraseHex(hexId)
    })

    $store_has_unsaved_changes = true
  }

  function eliminateHex(hexId: hex_id) {
    if (terrainSprites[hexId]) {
      symbolsContainer.removeChild(terrainSprites[hexId])
      terrainSprites[hexId].destroy()
      delete terrainSprites[hexId]
    }

    delete $tfield.hexes[hexId]

    comp_coordsLayer.eliminateCoord(hexId)
  }

  /* UNCATEGORIZED */
  function generateBlankTile(): Tile {
    return {
      bgColor: $tfield.blankHexColor,
      display: 'Blank',
      id: 'noset_blank',
      tileset_id: 'noset_blank',
      symbol: null,
      preview: '',
    }
  }

  export function get_existant_neighbours(hex_id: hex_id): TerrainHex[] {
    let coords = id_to_coords(hex_id)

    let neighbourIds = getNeighbours(coords.q, coords.r, coords.s)

    let valid_neighbour_ids = neighbourIds.filter((id) => hexExists(id))

    return valid_neighbour_ids.map((id) => get_hex(id))
  }

  function get_hex(hex_id: hex_id): TerrainHex {
    if (hexExists(hex_id)) return $tfield.hexes[hex_id]

    return null
  }

  function getContiguousHexIdsOfSameType(hexId: hex_id): hex_id[] {
    let startHex = { ...$tfield.hexes[hexId] } // Any neighbours with the same style (same bgColor, symbol and symbolColor) will be changed and their neighbours will be added to the list

    let seenIds = [genHexId(startHex.q, startHex.r, startHex.s)] // Seen hexes have been added to the hex stack
    let visitedIDs = [] // Visited hexes have been gone into and their neighbours looked at
    let hexStack = [hexId]

    while (hexStack.length > 0) {
      let currentHex = $tfield.hexes[hexStack.pop()]

      // Add only matching neighbours to hexStack
      let neighbourIds = getNeighbours(currentHex.q, currentHex.r, currentHex.s)
      neighbourIds.forEach((nId: hex_id) => {
        if (!hexExists(nId)) return
        if (seenIds.find((sId) => sId == nId)) return

        if (hexesMatch(nId, hexId)) {
          seenIds.push(nId)
          hexStack.push(nId)
        }
      })

      // Add this hex to the list to return
      visitedIDs.push(genHexId(currentHex.q, currentHex.r, currentHex.s))
    }

    return visitedIDs
  }

  let mouse_lock: { locked: boolean, lock_action: null | 'terrain' } = {
  	locked: false,
	lock_action: null
  }


  export function pointerdown() {

    // Start a mouse lock, released when mouse events stop.
    // During a mouse lock, events are collated into event records (assembled undo actions I spose?)
    // When mouse lock is released, the event record is committed to undo history

    // Actually, instead of keeping a locked state, I can just collate everything that happens on mouse down, and remove it on mouse up.
    
    if ($data_terrain.usingEyedropper) {
      eyedrop()
    } else if ($data_terrain.usingPaintbucket && $data_terrain.usingEraser) {
      erasePaintbucket()
    } else if ($data_terrain.usingPaintbucket) {
      paintbucket()
    } else if ($data_terrain.usingEraser) {
      eraseAtMouse()
    } else {
      placeTerrain()
    }
  }

  export function pointerup(e) {
      // Get placed terrain, etc, and put into undo record

      if (e.button === 0) { // Left Mouse
	console.log(placed_terrain, replaced_terrain)

	
	if (placed_terrain.hex_ids.length > 0) {
	  record_undo_action({
	    type: UndoActions.PlaceTerrain,
	    placed_terrain: {...placed_terrain},
	    replaced_terrain: {...replaced_terrain}
	  })
	}
	

	placed_terrain.hex_ids = []
	replaced_terrain = {}
      }

  }

  export function clearTerrainSprites() {
    Object.keys(terrainSprites).forEach((hexId: hex_id) => {
      symbolsContainer.removeChild(terrainSprites[hexId])
      terrainSprites[hexId].destroy()
      delete terrainSprites[hexId]
    })
  }

  // KEYBOARD EVENTS
  export function keydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Alt': {
        $data_terrain.usingEyedropper = true
        break
      }

      case 'Shift': {
        $data_terrain.usingEraser = true
        break
      }

      case 'Control': {
        $data_terrain.usingPaintbucket = true
        break
      }
    }
  }

  export function keyup(e: KeyboardEvent) {
    switch (e.key) {
      case 'Alt': {
        $data_terrain.usingEyedropper = false
        break
      }

      case 'Shift': {
        $data_terrain.usingEraser = false
        break
      }

      case 'Control': {
        $data_terrain.usingPaintbucket = false
        break
      }
    }
  }

  export function handleKeyboardShortcut(shortcutData: shortcut_data) {
    switch (shortcutData.function) {
      case 'toggleEraser':
        $data_terrain.usingEraser = !$data_terrain.usingEraser
        break

      case 'togglePaintbucket':
        $data_terrain.usingPaintbucket = !$data_terrain.usingPaintbucket
        break
    }
  }

  export const handle_undo = (action: UndoAction) => {
    switch (action.type) {
      case UndoActions.PlaceTerrain: {
	for (const [hex_id, tile] of Object.entries(action.replaced_terrain)) {
	  if (tile === null) {
	    eraseHex(hex_id as HexId)
	  } else {
	    paintFromTile(hex_id as HexId, tile)
	  }
	}
      }
    }
  }

  export const handle_redo = (action: UndoAction) => {
    switch (action.type) {
      case UndoActions.PlaceTerrain: {
	for (const hex_id of action.placed_terrain.hex_ids) {
	  paintFromTile(hex_id as HexId, action.placed_terrain.tile)
	}
      }
    }
  }

  onMount(() => {
    cont_terrain.removeChildren(0)
    cont_terrain.addChild(terrainGraphics)
    cont_terrain.addChild(symbolsContainer)
    cont_terrain.addChild(gridGraphics)

    renderAllHexes()
    renderGrid()
  })
</script>

<!--
<Graphics
	instance={terrainGraphics}
	draw={(g) => {
		/* too slow to draw here! we have to handle it manually. See the render methods */
	}}
/>
<Container instance={symbolsContainer} />

{#if $tfield.grid.shown}
	<Graphics
		instance={gridGraphics}
		draw={(g) => {
			/* too slow to draw here! we have to handle it manually. See the render methods */
		}}
	/>
{/if}
-->
