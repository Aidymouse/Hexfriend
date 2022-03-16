const DEFAULTHEXCOLOR = 0xf2f2f2; // aka the background color of each hex. We'll need to save this.
const DEFAULTOUTLINECOLOR = 0x333333; // we'll need to save this too at some stage

const CURRENTSAVEDATAFORMATVERSION = 2; // Used to solve conflicts when loading earlier map versions, if it happens to change

const DEFAULTSAVEDATA = {
    title: null,
    version: CURRENTSAVEDATAFORMATVERSION,

    hexfield: {
        hexWidth: 50,
        hexHeight: 45,
        orientation: "flatTop", // or "pointyTop"
        blankHexColor: DEFAULTHEXCOLOR,
        gridData: {
            visible: true,
            stroke: 0x333333,
            strokeThickness: 2
        },
        hexes: []
    },

    tilesets: {
    },

    iconSets: {

    },

    icons: [],
    text: [],
    paths: []
}

let hexesOut = 10;

for (let q = -hexesOut; q <= hexesOut; q++) {
    for (let r = -hexesOut; r <= hexesOut; r++) {

        if (-q - r >= -hexesOut && -q - r <= hexesOut) {
            let hexId = q.toString() + ":" + r.toString() + ":" + (-q - r).toString();

            DEFAULTSAVEDATA.hexfield.hexes.push( {q: q, r: r, terrainId: null} );
        }

    }
}