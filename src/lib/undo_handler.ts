// Actions that should be undoable
//

import type { TerrainHex } from "../types/terrain"
import { UndoActions, type UndoAction } from "../types/undoTypes"

import { store_undo } from "../stores/undo"
import type { ComponentType } from "svelte"
import { store } from "../stores/panning";

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



let local_undo;

store_undo.subscribe(u => local_undo = u)


export const record_undo_action = (action: UndoAction) => {

	store_undo.update((u) => {
		u.stack.push(action)
		u.undo_pointer += 1;
		return u
	})


	console.log(local_undo)

}

// Move back, return
export const pop_undo_action = (): UndoAction | null => {
	if (local_undo.undo_pointer === 0) return null
	store_undo.update(u => {
		u.undo_pointer -= 1
		return u
	})
	const action = local_undo.stack[local_undo.undo_pointer] 
	return action
}

export const push_undo_action = (): UndoAction | null => {
	if (local_undo.undo_pointer >= local_undo.stack.length) return null

	const action = local_undo.stack[local_undo.undo_pointer] 
	store_undo.update(u => {
		u.undo_pointer += 1
		return u
	})
	return action
}



/** Handles actually undoing */
export const handle_undo_action = (action: UndoAction, comp_terrainLayer: ComponentType) => {
	console.log("UNDO", action)
	switch (action.type) {
		case UndoActions.ChangeHexDimensions: {
			break;
		}
		default: {
			console.warn("Unhandled undo action", action.type)
			break;
		}
	}
}

export const handle_redo_action = (action: UndoAction, comp_terrainLayer: ComponentType) => {
	console.log("REDO", action)
	switch (action.type) {
		case UndoActions.ChangeHexDimensions: {
			break;
		}
		default: {
			console.warn("Unhandled undo action", action.type)
			break;
		}
	}
}
