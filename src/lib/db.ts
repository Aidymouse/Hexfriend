import Dexie, { Table } from 'dexie';

export interface MapSave {
    id?: number
    mapString: string
    previewBase64: string
}

export class MapDexie extends Dexie {
    mapSaves!: Table<MapSave>

    constructor() {
        super("mapsdb")
        this.version(2).stores({
            mapSaves: "++id, mapString, previewBase64"
        })
    }
}

export const db = new MapDexie()