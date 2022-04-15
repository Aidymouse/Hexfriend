// Every hex has a percentange chance that its neighbour will be a different terrain type

/*
let genFunction: {[key: string]: {[key:string]: number} } = {
    'default_plains': {'default_plains': 25, 'default_desert': 25, 'default_water': 25, 'default_tree': 25, 'default_deepwater': 0},
    'default_desert': { 'default_plains': 30, 'default_desert': 30, 'default_water': 20, 'default_tree': 20, 'default_deepwater': 0 },
    'default_water': { 'default_plains': 10, 'default_desert': 10, 'default_water': 10, 'default_tree': 20, 'default_deepwater': 50 },
    'default_tree': { 'default_plains': 15, 'default_desert': 5, 'default_water': 20, 'default_tree': 60, 'default_deepwater': 0 },
    'default_deepwater': { 'default_plains': 0, 'default_desert': 0, 'default_water': 50, 'default_tree': 0, 'default_deepwater': 50 },
}
*/

let genFunction: { [key: string]: { [key: string]: number } } = {
    'default_plains': { 'default_plains': 50, 'default_desert': 0, 'default_water': 15, 'default_tree': 20, 'default_deepwater': 15 },
    'default_desert': { 'default_plains': 30, 'default_desert': 30, 'default_water': 20, 'default_tree': 20, 'default_deepwater': 0 },
    'default_water': { 'default_plains': 35, 'default_desert': 0, 'default_water': 40, 'default_tree': 25, 'default_deepwater': 0 },
    'default_tree': { 'default_plains': 25, 'default_desert': 0, 'default_water': 10, 'default_tree': 65, 'default_deepwater': 0 },
    'default_deepwater': { 'default_plains': 50, 'default_desert': 0, 'default_water': 0, 'default_tree': 0, 'default_deepwater': 50 },
}

function genHexId(q: number, r: number, s: number): string {
    return q.toString() + ":" + r.toString() + ":" + s.toString()
}

function rand(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getHexNeighbours(q: number, r: number, s: number): string[] {

    return [
        genHexId(q+1, r, s-1),
        genHexId(q+1, r-1, s),
        genHexId(q, r-1, s+1),
        genHexId(q-1, r, s+1),
        genHexId(q-1, r+1, s),
        genHexId(q, r+1, s-1)
    ];
}

export function generateTerrain(tfield, tileset) {
    let addedNeighbours = []; 
    let coloredHexes = []; // hexid's

    addedNeighbours.push( {generateFrom: null, hexId: '0:0:0'} )

    let c = 0;

    while (addedNeighbours.length != 0) {
        c ++;
        let cur = addedNeighbours.pop()
        let hex = tfield.hexes[cur.hexId]
        // Color self, then add neighbours

        // Color self
        let coloredBy: string
        if (cur.generateFrom == null) {
            //console.log(n.hex)
            coloredBy = 'default_plains'
            colorWith(hex, 'default_plains', tileset)

        } else {
            let terrainNum: number = rand(1, 100)
            var cumChance = 0

            for (let [id, chance] of Object.entries(genFunction[cur.generateFrom])) {
                cumChance += chance

                if (terrainNum <= cumChance) {
                    colorWith(hex, id, tileset)
                    coloredBy = id
                    tfield.hexes = tfield.hexes
                    break
                } 
                    
            }
        }


        // Push neighbours
        let hexNeighbours = getHexNeighbours(hex.q, hex.r, hex.s)

        hexNeighbours.forEach(nId => {
            if (tfield.hexes[nId] != undefined) {
                if (coloredHexes.find(c => c == nId) == undefined && addedNeighbours.find(c => c.hexId == nId) == undefined) {
                    addedNeighbours.push( {generateFrom: coloredBy, hexId: nId} )
                }
            }
        })

        // Add self to the list of colored hexes

        coloredHexes.push(cur.hexId)
    }
}


function colorWith(hex, tileid, tileset){
    let tile = tileset.find(tile => tile.id == tileid);
    //console.log(tile);
    
    hex.bgColor = tile.bgColor;

    if (tile.symbol) {
        hex.symbol = {...tile.symbol};
        hex.symbolId = tile.id
    } else {
        hex.symbol = null
        hex.symbolId = null
    }


}

