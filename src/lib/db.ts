import Dexie, { type Table } from 'dexie';

export interface MapSaveInfo {
	id?: number;
	mapTitle: string;
	previewBase64: string;
	saveVersion: number;
}

export interface MapString {
	id?: number;
	mapString: string;
}

export class MapDexie extends Dexie {
	mapSaves!: Table<MapSaveInfo>;
	mapStrings!: Table<MapString>;

	constructor() {
		super('mapsdb');
		this.version(5).stores({
			/* I kinda dont know what im doing. These database IDs have to line up! 
            In theory they always should, but I'm sure dexie has a better way of sharing IDs between tables */
			mapSaves: '++id, mapTitle, previewBase64, saveVersion',
			mapStrings: '++id, mapString',
		});
	}
}

export const db = new MapDexie();
