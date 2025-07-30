import { LATESTSAVEDATAVERSION } from '../types/savedata';
import type { save_data } from '../types/savedata';
import { hex_raised } from '../types/terrain';
import { ScaleMode } from '../helpers/imageSizing';

/** I better make sure I like these names because they can NEVER CHANGE! Or old save versions will need to know what they used to be */
function convert_v1_to_v5(oldData: save_data): save_data {
	console.log("Converting save: v4- to v5")

	if (!oldData.TerrainField.largehexes) {

        //@ts-ignore - Largehexes used to be called overlay
		if (oldData.TerrainField.overlay) {
            //@ts-ignore - Largehexes used to be called overlay
			oldData.TerrainField.largehexes = JSON.parse(JSON.stringify(oldData.TerrainField.overlay))
		} else {
			oldData.TerrainField.largehexes = {
				shown: false,
				style: {
					width: 3,
					color: 0x333333,
				},
				offset: {
					x: 0,
					y: 1,
				},
				diameterInHexes: 3,
				raised: hex_raised.EVEN,
				encompassEdges: false,
			};
		}
	}

	// OVERLAY
	// Didn't exist prior to version 5
	if (!oldData.overlay) {
		oldData.overlay = {
			base64: "",
			shown: true,
			x: 0,
			y: 0,
			scale: { x: 1, y: 1 },
			opacity: 0.5
		}
	}

	// PATH STYLE AND TEXT STYLE IDS // Missing in some map version 2's (yeah, ok, I'm shit with version numbers)
	let pId = 0;
    //@ts-ignore - Pre v13 it was pathStyles
	oldData.pathStyles.forEach((pathStyle) => {
		pathStyle.id = pId;
		pId++;
	});

	let tId = 0;
    //@ts-ignore - Pre v13 it was called textStyles
	oldData.textStyles.forEach((textStyle) => {
		textStyle.id = tId;
		tId++;
	});


	oldData.saveVersion = 5;

	return oldData
}

function convert_v5_to_v6(oldData: save_data): save_data {
	console.log("Converting save: v5 to v6")
	// Changes in this version:
	//	- tiles got set IDs seperate from their individual ID
	//  - symbol ID is not the same as tile ID anymore, rather they are sorted out by the tilesetcreator
	let new_data: save_data = JSON.parse(JSON.stringify(oldData));



	new_data.saveVersion = 6
	return new_data;

}

function convert_v6_to_v7(oldData: save_data): save_data {
	console.log("Converting save: v6 to v7")

	let new_data: save_data = JSON.parse(JSON.stringify(oldData));

    //@ts-ignore - Pre v13 it was called pathStyles
	new_data.pathStyles = new_data.pathStyles.map(ps => { return { ...ps, style: { ...ps.style, dashed: false, dash_length: 15, dash_gap: 10 } } })
	new_data.paths.forEach(p => {
        //@ts-ignore - 
		p.style.dashed = false
        //@ts-ignore - 
		p.style.dash_gap = 10
        //@ts-ignore - 
		p.style.dash_length = 15
	})
	console.log(new_data.path_styles)

	new_data.saveVersion = 7
	return new_data;
}

function convert_v7_to_v8(old_data: save_data): save_data {
	console.log("Converting save: v7 to v8")

	let new_data: save_data = JSON.parse(JSON.stringify(old_data))

	new_data.TerrainField.grid.gap = 0

	new_data.saveVersion = 8
	return new_data;
}

function convert_v8_to_v9(old_data: save_data): save_data {
	console.log("Converting save: v8 to v9")

	let new_data: save_data = JSON.parse(JSON.stringify(old_data))

	new_data.icon_hex_size_percentage = 80

	new_data.icons = new_data.icons.map(i => {
		if (i.pHex == undefined) {
			return { ...i, pHex: 80 }
		}

		return i
	})

	new_data.saveVersion = 9

	return new_data
}

function convert_v9_to_v10(old_data: save_data): save_data {
	console.log("Converting save: v9 to v10")
	let new_data: save_data = JSON.parse(JSON.stringify(old_data))

	Object.keys(new_data.TerrainField.hexes).forEach(hex_id => {
		let hex = new_data.TerrainField.hexes[hex_id]
		if (hex.tile == null) return

		// Find tileset ID
		if (hex.tile.tileset_id == undefined) {

			//console.log(`Updating tile ${hex_id}`)

			// Attempt to find tile id. This is fallible if you have tiles with the same ID across two different tilesets
			for (const tileset of old_data.tilesets) {
				for (const tile of tileset.tiles) {
					if (tile.id == hex.tile.id) {
						hex.tile.tileset_id = tileset.id
						break
					}
					if (hex.tile.tileset_id == tileset.id) break
				}
			}

			// Fallback to default
			if (!hex.tile.tileset_id) hex.tile.tileset_id = "default"

		}


		// Remove unneeded stuff from the save data
		hex.tile.preview = ""
		if (hex.tile.symbol) {
			hex.tile.symbol.base64 = ""
			hex.tile.symbol.preview = ""
		}
	})

	new_data.saveVersion = 10

	return new_data
}

function convert_v10_to_v11(old_data: save_data): save_data {

	if (old_data.coords.offsets == null) {

		old_data.coords.offsets = {
			row_col: { row: 0, col: 0 },
			cube: { q: 0, r: 0, s: 0 }
		}

	}

	old_data.saveVersion = 11

	return old_data

}

function convert_v11_to_v12(old_data: save_data): save_data {
	Object.entries(old_data.TerrainField.hexes).forEach(([hex_id, hex]) => {
		if (hex.tile && hex.tile.symbol) hex.tile.symbol.rotation = 0;
	})

	old_data.saveVersion = 12

	return old_data;
}

function convert_v12_to_v13(old_data: save_data): save_data {
    console.log("Coverting save: v12 -> v13")
 
    /** Path Styles become Listed Path Styles */
    //@ts-ignore - Pre v13 it was called pathStyles. ALso the type got updated but they were compatible. The old version was an error but it makes conversion easier
    old_data.path_styles = [...old_data.pathStyles]
    //@ts-ignore - Pre v13 it was called pathStyles
    delete old_data.pathStyles


    /** Text style rename + alpha */
    //@ts-ignore - Pre v13 it was called textStyles
    old_data.text_styles = old_data.textStyles.map(ts => ({...ts, alpha: 1}))


    /** Icon Scale Modes */
	old_data.saveVersion = 13
    const newIcons = old_data.icons.map(i => {
        // @ts-ignore  - Icons pre v13 had pHex just on them rather than in a scale mode
        if (!i.scaleMode && i.pHex) {
            return {...i, scaleMode: ScaleMode.RELATIVE}
        }
    })

	return old_data;
}

export function convertSaveDataToLatest(oldData: save_data): save_data {
	// Update to latest version
	let newData: save_data = JSON.parse(JSON.stringify(oldData));

	if (newData.saveVersion < 5) { newData = convert_v1_to_v5(newData) }
	if (newData.saveVersion == 5) { newData = convert_v5_to_v6(newData) }
	if (newData.saveVersion == 6) { newData = convert_v6_to_v7(newData) }
	if (newData.saveVersion == 7) { newData = convert_v7_to_v8(newData) }
	if (newData.saveVersion == 8) { newData = convert_v8_to_v9(newData) }
	if (newData.saveVersion == 9) { newData = convert_v9_to_v10(newData) }
	if (newData.saveVersion == 10) { newData = convert_v10_to_v11(newData) }
	if (newData.saveVersion == 11) { newData = convert_v11_to_v12(newData) }
	if (newData.saveVersion == 12) { newData = convert_v12_to_v13(newData) }

	return newData;
}
