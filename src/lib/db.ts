import Dexie, { Table } from 'dexie';

export interface MapSave {
    id?: number
    mapTitle: string
    previewBase64: string
}

export interface MapString {
    id?: number
    mapString: string
}

export class MapDexie extends Dexie {
    mapSaves!: Table<MapSave>
    mapStrings!: Table<MapString>

    constructor() {
        super("mapsdb")
        this.version(4).stores({ 
            /* I kinda dont know what im doing. These database IDs have to line up! 
            In theory they always should, but I'm sure dexie has a better way of sharing IDs between tables */
            mapSaves: "++id, mapTitle, previewBase64",
            mapStrings: "++id, mapString"

        })
    }
}

export const db = new MapDexie()