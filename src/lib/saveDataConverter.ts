import { LATESTSAVEDATAVERSION } from '../types/savedata';
import type { save_data } from '../types/savedata';
import { hex_raised } from '../types/terrain';

function convert_v1_to_v5(oldData: save_data): save_data {
	console.log("Converting save: v4- to v5")

	if (!oldData.TerrainField.largehexes) {
		if (oldData.TerrainField.overlay) {
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
			scale: {x: 1, y: 1}, 
			opacity: 0.5
		}
	}

	// PATH STYLE AND TEXT STYLE IDS // Missing in some map version 2's (yeah, ok, I'm shit with version numbers)
	let pId = 0;
	oldData.pathStyles.forEach((pathStyle) => {
		pathStyle.id = pId;
		pId++;
	});

	let tId = 0;
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
	
	new_data.pathStyles = new_data.pathStyles.map(ps => {return {...ps, style: {...ps.style, dashed: false, dash_length: 15, dash_gap: 10}} })
	new_data.paths.forEach(p => {
		p.style.dashed = false
		p.style.dash_gap = 10
		p.style.dash_length = 15
	})
	console.log(new_data.pathStyles)
	
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

export function convertSaveDataToLatest(oldData: save_data): save_data {
	// Update to latest version
	let newData: save_data = JSON.parse(JSON.stringify(oldData));

	if (newData.saveVersion < 5) { newData = convert_v1_to_v5(newData) }
	if (newData.saveVersion == 5) { newData = convert_v5_to_v6(newData) }
	if (newData.saveVersion == 6) { newData = convert_v6_to_v7(newData) }
	if (newData.saveVersion == 7) { newData = convert_v7_to_v8(newData) }

	return newData;
}
