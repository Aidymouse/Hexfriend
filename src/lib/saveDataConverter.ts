import { LATESTSAVEDATAVERSION } from '../types/savedata';
import type { save_data } from '../types/savedata';
import { hex_raised } from '../types/terrain';

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

	newData.saveVersion = LATESTSAVEDATAVERSION;
	return newData;
}
