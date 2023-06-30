import { LATESTSAVEDATAVERSION } from '../types/savedata';
import type { save_data } from '../types/savedata';
import { hex_raised } from '../types/terrain';

function convert_v5_to_v6(oldData: save_data): save_data {
	// Changes in this version:
	//	- tiles got set IDs seperate from their individual ID
	//  - symbol ID is not the same as tile ID anymore, rather they are sorted out by the tilesetcreator
	let new_data: save_data = JSON.parse(JSON.stringify(oldData));

	
	
	new_data.saveVersion = 6
	return new_data;

}

function convert_v6_to_v7(oldData: save_data): save_data {
	let new_data: save_data = JSON.parse(JSON.stringify(oldData));
	
	new_data.pathStyles = new_data.pathStyles.map(ps => {return {...ps, style: {...ps.style, dashed: false, dash_length: 15, dash_gap: 10}} })
	console.log(new_data.pathStyles)

	new_data.saveVersion = 7
	return new_data;
}

export function convertSaveDataToLatest(oldData: save_data): save_data {
	// Update to latest version
	let newData: save_data = JSON.parse(JSON.stringify(oldData));

	// LARGE HEXES // Missing in map version 2
	// Was named overlay prior to version 4
	if (!newData.TerrainField.largehexes) {
		if (newData.TerrainField.overlay) {
			newData.TerrainField.largehexes = JSON.parse(JSON.stringify(newData.TerrainField.overlay))
		} else {
			newData.TerrainField.largehexes = {
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
	if (!newData.overlay) {
		newData.overlay = {
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
	newData.pathStyles.forEach((pathStyle) => {
		pathStyle.id = pId;
		pId++;
	});

	let tId = 0;
	newData.textStyles.forEach((textStyle) => {
		textStyle.id = tId;
		tId++;
	});

	newData.saveVersion = 5;

	newData = convert_v5_to_v6(newData);
	newData = convert_v6_to_v7(newData);

	return newData;
}
