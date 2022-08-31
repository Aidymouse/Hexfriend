import { LATESTSAVEDATAVERSION } from '../types/savedata';
import type { save_data } from '../types/savedata';
import { hex_raised } from '../types/terrain';

export function convertSaveDataToLatest(oldData: save_data): save_data {
	// Update to latest version
	let newData: save_data = JSON.parse(JSON.stringify(oldData));

	// OVERLAY // Missing in map version 2
	if (!newData.TerrainField.overlay) {
		newData.TerrainField.overlay = {
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
