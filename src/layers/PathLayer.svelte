<script lang="ts">
  import type { path_data } from '../types/data'
  import type { pan_state } from '../types/panning'
  import type { PathLayerPath } from '../types/path'
  import type { HexRaised, TerrainField } from '../types/terrain'
  import type { shortcut_data } from '../types/inputs'

  // ENUMS
  import { HexOrientation } from '../types/terrain'

  // STORES
  import { data_path } from '../stores/data'

  import * as store_panning from '../stores/panning'
  import { tfield } from '../stores/tfield'

  import { store_inputs } from '../stores/inputs'
  import { store_selected_tool } from '../stores/tools'
  import { store_has_unsaved_changes } from '../stores/flags'

  import { coords_cubeToWorld, coords_worldToCube, cube_round } from '../helpers/hexHelpers'
  import { Vector } from '../lib/vector2d'
  import * as PIXI from 'pixi.js'
  import { DashLine } from 'pixi-dashed-line'

  import { afterUpdate, onMount } from 'svelte'
  import {
    find_new_pos_square_orientation_change,
    find_new_pos_through_resize,
    type HexSizeParams,
  } from '../lib/map_resize'
  import { completeUndoState, push_undo_state, startUndoState } from '../lib/undoManager'
  import { findHitArea, getPathSnapPoint } from '../helpers/pathHelpers'
  import { Tools, type UndoDataPathPoint } from '../types'
  import { store_undo } from '../stores'

  let pan: pan_state
  store_panning.store.subscribe((newPan) => { pan = newPan })

  // When we've added the first point, we don't want to push the undo state *yet*
  //let state_in_the_chamber: UndoDataPathPoint | null = null

  export let paths: PathLayerPath[] = []
  export let cont_all_paths: PIXI.Container

  export function debug_logPathState() {
    console.log(paths)
  }

  export function retain_path_position_on_hex_resize(old_hex_size: HexSizeParams, new_hex_size: HexSizeParams) {
    paths.forEach((path) => {
      for (let pI = 0; pI < path.points.length; pI += 2) {
        let path_point_x = path.points[pI]
        let path_point_y = path.points[pI + 1]

        const new_point_pos = find_new_pos_through_resize(
          { x: path_point_x, y: path_point_y },
          old_hex_size,
          new_hex_size,
        )

        path.points[pI] = new_point_pos.x
        path.points[pI + 1] = new_point_pos.y
      }
    })

    paths = paths
  }

  export function retain_path_position_on_orientation_change(
    old_hex_size: HexSizeParams,
    new_hex_size: HexSizeParams,
    cur_raised: HexRaised,
  ) {
    paths.forEach((path) => {
      for (let pI = 0; pI < path.points.length; pI += 2) {
        let path_point_x = path.points[pI]
        let path_point_y = path.points[pI + 1]

        const new_point_pos = find_new_pos_square_orientation_change(
          { x: path_point_x, y: path_point_y },
          old_hex_size,
          new_hex_size,
          cur_raised,
        )

        path.points[pI] = new_point_pos.x
        path.points[pI + 1] = new_point_pos.y
      }
    })

    paths = paths
  }

  let pathId: number = 0

  function updatePathId() {
    paths.forEach((p) => (pathId = Math.max(pathId, p.id)))
    pathId++
  }

  updatePathId()

  function appendPoint(path: PathLayerPath, x: number, y: number, path_end: 'start' | 'end') {
    if (path_end == 'end') {
      path.points = [...path.points, x, y]
    } else if (path_end == 'start') {
      path.points = [x, y, ...path.points]
    }

    paths = paths

    $store_has_unsaved_changes = true
  }

  export function deselectPath() {
    if ($data_path.selectedPath.points.length <= 2) { 
      startUndoState({paths, selected_tool: Tools.PATH}, "Delete path by deselect")
      deletePath($data_path.selectedPath)
      completeUndoState({paths})
    }
    $data_path.selectedPath = null
  }

  export function pointerdown() {
    $data_path.contextPathId = null

    if ($store_inputs.mouseDown[0]) {
      if ($data_path.selectedPath) {
        let pX = store_panning.curWorldX()
        let pY = store_panning.curWorldY()
        if ($data_path.snap) {
          let sP = getSnapPoint()
          pX = sP.x
          pY = sP.y
        }

	/* Special: if the path we're appending to is a single point, REMOVE the last undo state! 
	* This makes it so paths with 2+ points don't have an awkward state where only 1 point exists.
	*/
	if ($data_path.selectedPath.points.length === 2) {
	  $store_undo.undo_stack.pop()
	  $store_undo.undo_pointer -= 1
	  startUndoState({paths: paths.filter(p => p.id !== $data_path.selectedPath.id)}, `Add Point to ${$data_path.selectedPath.id}`)
	} else {
	  startUndoState({paths}, `Add Point to ${$data_path.selectedPath.id}`)
	}

        appendPoint($data_path.selectedPath, pX, pY, $data_path.add_to)
	completeUndoState({paths})
      } else if ($data_path.hoveredPath && !$data_path.dontSelectPaths) {
        $data_path.selectedPath = paths[paths.indexOf($data_path.hoveredPath)]
        $data_path.style = { ...$data_path.selectedPath.style }
        $data_path.hoveredPath = null
      } else {
        addNewPath()
      }
    }
  }

  /* @returns the point removed */
  function remove_point_from(path: PathLayerPath, remove_from: 'start' | 'end'): {x: number, y: number} {
    let ret_point: {x: number, y: number} = {x: -1, y: -1}
    if (remove_from == 'end') {
      ret_point.y = path.points.pop()
      ret_point.x = path.points.pop()
    } else if (remove_from == 'start') {
      ret_point = {x: path.points[0], y: path.points[1]}
      path.points.splice(0, 2)
    }

    return ret_point
  }

  export function remove_latest_point(path: PathLayerPath) {

    if (path.points.length === 2){
      startUndoState({paths, selected_tool: Tools.PATH}, "Remove Path Point")
    } else {
      startUndoState({paths}, "Remove Path Point")
    }

    const removed_point = remove_point_from(path, $data_path.add_to)
    paths = paths


    /*
    push_undo_state({path_point: {
      path_id: path.id,
      action: 'remove',
      point: removed_point,
      path_end: $data_path.add_to,
      grab_selection: path.points.length === 0,
    }}, `Remove point from path ${path.id}`)
    */

    if (path.points.length == 0) {
      deletePath(path)
    } 

    if (path.points.length === 2) {
      completeUndoState({ paths, selected_tool: Tools.PATH })
    } else {
      completeUndoState({ paths })
    }


    $store_has_unsaved_changes = true
  }

  export function deletePath(path: PathLayerPath) {
    $data_path.selectedPath = null

    let pathIndex = paths.indexOf(path)
    paths.splice(pathIndex, 1)

    paths = paths

    $store_has_unsaved_changes = true
  }

  function getSnapPoint() {

    return getPathSnapPoint(
	store_panning.curWorldX(), 
	store_panning.curWorldY(),
	{
	  orientation: $tfield.orientation,
	  hexWidth: $tfield.hexWidth,
	  hexHeight: $tfield.hexHeight,
	  gap: $tfield.gap,
	}
    )
  }

  function addNewPath() {
    let pX = store_panning.curWorldX()
    let pY = store_panning.curWorldY()

    startUndoState({paths}, "Add Path")

    if ($data_path.snap) {
      let snapPoint = getSnapPoint()
      pX = snapPoint.x
      pY = snapPoint.y
    }

    paths.push({
      id: pathId,
      style: { ...$data_path.style },
      //points: [pX, pY],
      points: [],
      hitboxes: [],
      // TODO: what goin on with this ??
      dashes: $data_path.dashed ? [...$data_path.dashes] : null,
    })
    pathId++
    $data_path.selectedPath = paths[paths.length - 1]
    $data_path.hoveredPath = null

    appendPoint(paths.at(-1)!, pX, pY, $data_path.add_to)

    $store_has_unsaved_changes = true
    completeUndoState({paths, selected_tool: Tools.PATH})
  }

  /* idk */
  export function moveAllPaths(xMod: number, yMod: number) {
    paths.forEach((path) => {
      for (let pI = 0; pI < path.points.length; pI += 2) {
        path.points[pI] += xMod
        path.points[pI + 1] += yMod
      }
    })

    paths = paths
    $store_has_unsaved_changes = true
  }

  /* KEYBOARD */
  export function handleKeyboardShortcut(shortcutData: shortcut_data) {
    switch (shortcutData.function) {
      case 'toggleSnap':
        $data_path.snap = !$data_path.snap
        break

      case 'deleteLastPoint':
        if ($data_path.selectedPath) {
          remove_latest_point($data_path.selectedPath)
        }
        break

      case 'deletePath':
        if ($data_path.selectedPath) {
          deletePath($data_path.selectedPath)
        }
        break

      case 'deselect':
        $data_path.selectedPath = null
        break
    }
  }

  export function keydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Shift':
        $data_path.dontSelectPaths = true
        break
    }
  }

  export function keyup(e: KeyboardEvent) {
    switch (e.key) {
      case 'Shift':
        $data_path.dontSelectPaths = false
        break
    }
  }

  const HOVEREDSELECTORSTYLE: Partial<PIXI.LineStyle> = { width: 1, color: 0x555555 }
  const SELECTEDSELECTORSTYLE: Partial<PIXI.LineStyle> = { width: 2, color: 0x333333 }

  let path_containers: {[id: string]: PIXI.Container & {marked_for_death?: boolean}} = {}
  let cont_pixi_paths = new PIXI.Container()
  let grph_hovered_path = new PIXI.Graphics()
  let grph_selected_path = new PIXI.Graphics()

  let dashed_lines = {} // path id: dashed line object

  cont_all_paths.addChild(cont_pixi_paths, grph_hovered_path, grph_selected_path)


  /* Specially, because of the limited nature of path interactions, we can be pretty efficient with how we handle undo */
  /*
  export function handleUndo(point_data: UndoDataPathPoint) {
    const path = paths.find(p => p.id === point_data.path_id)

    if (point_data.action === 'add') {
      if (path.points.length === 2) {
	deletePath(path)
      } else {
	remove_point_from(path, point_data.path_end)
      }
    } else if (point_data.action === 'remove') {
      if (path === undefined) {
	appendPoint(path, point_data.point.x, point_data.point.y, point_data.path_end)
      }
    }

    paths = paths
  }

  export function handle_redo(point_data: UndoDataPathPoint) {
    const path = paths.find(p => p.id === point_data.path_id)
    if (point_data.action === 'add') {
      appendPoint(path, point_data.point.x, point_data.point.y, point_data.path_end)
    } else if (point_data.action === 'remove') {
      remove_point_from(path, point_data.path_end)
    }

    paths = paths
  }
  */

  export function applyPaths(new_paths: PathLayerPath[]) {
    paths = new_paths

    const path_that_was_selected = structuredClone($data_path.selectedPath)
    $data_path.selectedPath = null

    for (const path of paths) {
        const cont_path = path_containers[path.id]
	if (!cont_path) { 
	  continue 
	}

	if ((path_that_was_selected?.id ?? 'never') === path.id) {
	  $data_path.selectedPath = path
	}

        cont_path.off('pointerover')
        cont_path.on('pointerover', () => { $data_path.hoveredPath = path })
    }

    if (paths.at(-1)?.points.length === 2) {
      $data_path.selectedPath = paths.at(-1)
    }
  }

  function updatePathHandles() {
    grph_selected_path.clear()

    if ($data_path.selectedPath) {
      grph_selected_path.lineStyle(SELECTEDSELECTORSTYLE)
      grph_selected_path.beginFill(0xf2f2f2)

      let points = $data_path.selectedPath.points

      for (let pI = 0; pI < points.length; pI += 2) {
        grph_selected_path.drawCircle(points[pI], points[pI + 1], 4)
      }

      grph_selected_path.beginFill(0x8cc63f)
      if ($data_path.add_to == 'start') {
        grph_selected_path.drawCircle(points[0], points[1], 4)
      } else {
        grph_selected_path.drawCircle(points[points.length - 2], points[points.length - 1], 4)
      }

      grph_selected_path.endFill()
    }
  }

  afterUpdate(() => {
    if (!$data_path) return

    if ($data_path.selectedPath) {
      $data_path.selectedPath.style = structuredClone($data_path.style)
    }

    for (const [path_id, cont_path] of Object.entries(path_containers)) {
      cont_path.marked_for_death = true
    }

    // Update paths to match state
    for (const path of paths) {
      if (!path_containers[path.id]) {
        let cont_path = new PIXI.Container()
        cont_path.on('pointerover', () => { $data_path.hoveredPath = path })
        cont_path.on('pointerout', () => {
          $data_path.hoveredPath = null
        })

        let grph_path = new PIXI.Graphics()

        cont_path.addChild(grph_path)

        path_containers[path.id] = cont_path
        cont_pixi_paths.addChild(cont_path)
      }

      // Handle dashed lines
      // Make dashed line object if needed
      if (path.style.dashed) {
        if (dashed_lines[path.id] != null) {
          delete dashed_lines[path.id]
        }

        let cont_path = path_containers[path.id]
        let grph_path = cont_path.children[0] as PIXI.Graphics // we know it's graphics cos we only put one thing in the container
        dashed_lines[path.id] = new DashLine(grph_path, {
          dash: [path.style.dash_length, path.style.dash_gap],
        })
      }

      // Get rid of dashed line if not needed
      if (!path.style.dashed && dashed_lines[path.id] != null) {
        delete dashed_lines[path.id]
      }

      let cont_path = path_containers[path.id]
      cont_path.marked_for_death = false
      cont_path.eventMode = $store_selected_tool == 'path' && !$data_path.selectedPath ? 'static' : 'auto'
      cont_path.hitArea = findHitArea(path)

      let grph_path = cont_path.children[0] as PIXI.Graphics
      grph_path.clear()
      grph_path.lineStyle(path.style)

      let draw_on = grph_path
      if (dashed_lines[path.id]) draw_on = dashed_lines[path.id]

      draw_on.moveTo(path.points[0], path.points[1])
      for (let pI = 0; pI < path.points.length; pI += 2) {
        draw_on.lineTo(path.points[pI], path.points[pI + 1])
      }
    }

    for (const [path_id, cont_path] of Object.entries(path_containers)) {
      if (cont_path.marked_for_death) {
        cont_all_paths.removeChild(cont_path)
        cont_path.destroy()
        delete dashed_lines[path_id]
        delete path_containers[path_id]
      }
    }

    /* Selector Graphics */
    updatePathHandles()

    grph_hovered_path.clear()
    if ($data_path.hoveredPath && !$data_path.dontSelectPaths) {
      grph_hovered_path.lineStyle(HOVEREDSELECTORSTYLE)
      grph_hovered_path.beginFill(0xf2f2f2)
      for (let pI = 0; pI < $data_path.hoveredPath.points.length; pI += 2) {
        grph_hovered_path.drawCircle($data_path.hoveredPath.points[pI], $data_path.hoveredPath.points[pI + 1], 3)
      }
      grph_hovered_path.endFill()
    }
  })

  onMount(() => {
    grph_hovered_path.clear()
    grph_selected_path.clear()

    cont_all_paths.removeChildren(0)
    cont_pixi_paths = new PIXI.Container()
    cont_all_paths.addChild(cont_pixi_paths)
    cont_all_paths.addChild(grph_hovered_path)
    cont_all_paths.addChild(grph_selected_path)
  })
</script>
