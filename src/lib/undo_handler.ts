// Actions that should be undoable
//

import type { TerrainHex } from '../types/terrain'
import { UndoActions, type UndoAction } from '../types/undoTypes'

import { store_undo } from '../stores/undo'
import type { ComponentType } from 'svelte'
import { store } from '../stores/panning'

import TerrainLayer from '../layers/TerrainLayer.svelte'
import Settings from '../components/Settings.svelte'

/*
== General
Resizing Hexes
Changing Orientation
Changing Grid Settings

== Terrain
Placing Tiles
Removing Tiles
Changing tile style
Paintbucketing
Erase Paintbucketing
*/

/** The undo pointer points at the latest action that has been performed */
 
let local_undo

store_undo.subscribe((u) => (local_undo = u))

export const record_undo_action = (action: UndoAction) => {
  if (local_undo.undo_pointer !== local_undo.stack.length-1) {

    console.log('Recorded new action not in present')

    store_undo.update((u) => {
      u.stack = u.stack.slice(0, u.undo_pointer+1)
      console.log(u.stack)
      //u.undo_pointer += 1;
      return u
    })
  }

  store_undo.update((u) => {
    u.stack.push(action)
    u.undo_pointer += 1
    return u
  })

  console.log(local_undo)
}

// Take current acti
export const pop_undo_action = (): UndoAction | null => {
  if (local_undo.undo_pointer === -1) return null
  const action = local_undo.stack[local_undo.undo_pointer]
  store_undo.update((u) => {
    u.undo_pointer -= 1
    return u
  })
  return action
}

export const push_undo_action = (): UndoAction | null => {
  if (local_undo.undo_pointer >= local_undo.stack.length-1) return null

  store_undo.update((u) => {
    u.undo_pointer += 1
    return u
  })
  const action = local_undo.stack[local_undo.undo_pointer]
  return action
}

export type UndoComponents = {
  terrainLayer: TerrainLayer
  settings: Settings
}

const undo_routes: {[k in UndoActions]: keyof UndoComponents} = {
    // Settings
    [UndoActions.ToggleGrid]: 'settings',
    [UndoActions.ChangeGridThickness]: 'settings',
    [UndoActions.ChangeGridColor]: 'settings',
    [UndoActions.ChangeGridGap]: 'settings',
    [UndoActions.ToggleGridLargeHexes]: 'settings',
    [UndoActions.ChangeGridLargeHexSize]: 'settings',
    [UndoActions.ChangeGridLargeHexColor]: 'settings',
    [UndoActions.ChangeGridLargeHexWidth]: 'settings',
    [UndoActions.ChangeGridLargeHexOffset]: 'settings',
    [UndoActions.ToggleGridLargeHexEdgeEncompass]: 'settings',

    [UndoActions.ChangeHexBlankColor]: 'settings',
    [UndoActions.ChangeHexDimensions]: 'settings',
    [UndoActions.ChangeHexOrientation]: 'settings',
    [UndoActions.ChangeHexRaisedIndented]: 'settings',


    [UndoActions.PlaceTerrain]: 'terrainLayer'
}

/** Handles actually undoing */
export const handle_undo_action = (action: UndoAction, components: UndoComponents) => {
	switch (undo_routes[action.type]) {
		case 'settings': {
			components.settings.handle_undo(action)
			break
		}
		case 'terrainLayer': {
			components.terrainLayer.handle_undo(action)
			break
		}
		default: {
      			console.warn('Unhandled undo action', action.type)
      			break
		}
	}
}

export const handle_redo_action = (action: UndoAction, components: UndoComponents) => {
	switch (undo_routes[action.type]) {
		case 'settings': {
			components.settings.handle_redo(action)
			break
		}
		case 'terrainLayer': {
			components.terrainLayer.handle_redo(action)
			break
		}
		default: {
      			console.warn('Unhandled redo action', action.type)
      			break
		}
	}
}
