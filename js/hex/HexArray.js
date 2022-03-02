function generateHexPath(width, height, orientation){
    if (orientation == "pointyTop") {
        return [
            width / 2, 0,
            width, height * 0.25,
            width, height * 0.75,
            width / 2, height,
            0, height * 0.75,
            0, height * 0.25
        ];
    } else {
        return [
            width * 0.25, 0,
            width * 0.75, 0,
            width, height / 2,
            width * 0.75, height,
            width * 0.25, height,
            0, height / 2
        ];
    }
}

class HexArray {

    constructor(rows, columns, hexWidth, hexHeight, orientation) {
        
        this.hexWidth = hexWidth;
        this.hexHeight = hexHeight;
        this.orientation = orientation;
        
        this.columns = columns;
        this.rows = rows;

        // Generate the master hex graphic.
        // Every hexagon is a sprite, made with a texture, generated using this graphics object
        this.grph_masterBG = new PIXI.Graphics();
        this.grph_masterOutline = new PIXI.Graphics();

        // Make the hexes path
        this.hexPath = generateHexPath(hexWidth, hexHeight, orientation);

        this.tex_masterBG;
        this.tex_masterOutline;

        // Draw the background hex and outline hexes on graphics
        this.generateBGTexture();    
        this.generateMasterOutlineTexture();
        
        // Generate the hexagons hit area //
        this.hexHitArea;
        this.generateHexHitArea(); 
        
        // Generate the hexagons //
        this.cont_hexagons = new PIXI.Container();
        this.hexagons = []; // idk if needed
        
        this.generateHexes();
        
        this.cont_hexagons.x = hexWidth/2+15;
        this.cont_hexagons.y = hexHeight/2+15;
        
    } 
    
    generateBGTexture() {
        this.grph_masterBG.beginFill(0xffffff);
        this.grph_masterBG.drawPolygon(this.hexPath.map(p => p*2));
        this.grph_masterBG.endFill();
        this.tex_masterBG = primaryRenderer.generateTexture(this.grph_masterBG);
    }
    
    generateMasterOutlineTexture() {
        this.grph_masterOutline.lineStyle(1, 0xffffff); // These are defaults right now, line thickness may change later
        this.grph_masterOutline.drawPolygon(this.hexPath);
        this.tex_masterOutline = primaryRenderer.generateTexture(this.grph_masterOutline);
    }

    generateHexHitArea() {
        this.hexHitArea = new PIXI.Polygon([
            this.hexPath[0] - this.hexWidth / 2, this.hexPath[1] - this.hexHeight / 2,
            this.hexPath[2] - this.hexWidth / 2, this.hexPath[3] - this.hexHeight / 2,
            this.hexPath[4] - this.hexWidth / 2, this.hexPath[5] - this.hexHeight / 2,
            this.hexPath[6] - this.hexWidth / 2, this.hexPath[7] - this.hexHeight / 2,
            this.hexPath[8] - this.hexWidth / 2, this.hexPath[9] - this.hexHeight / 2,
            this.hexPath[10] - this.hexWidth / 2, this.hexPath[11] - this.hexHeight / 2,
        ]);
    }

    generateHexes() {

        for (let row = 0; row < this.rows; row++) {

            this.hexagons.push([]);

            for (let col = 0; col < this.columns; col++) {

                // Make the hexagon sprite
                let newHex = new Hexagon(this.tex_masterBG, this.tex_masterOutline, this.hexHitArea);

                let newHexSpriteX;
                let newHexSpriteY;

                switch (this.orientation) {
                    case "flatTop":
                        newHexSpriteX = col * this.hexWidth * 0.75 + 0.5;
                        newHexSpriteY = (col % 2 == 0 ? row * this.hexHeight : row * this.hexHeight + this.hexHeight / 2);
                        break;

                    case "pointyTop":
                        newHexSpriteX = (row % 2 == 0 ? col * this.hexWidth : col * this.hexWidth + this.hexWidth / 2);
                        newHexSpriteY = row * this.hexHeight * 0.75;
                        break;
                }

                newHex.saveData["row"] = row;
                newHex.saveData["column"] = col;

                newHex.move(newHexSpriteX, newHexSpriteY)

                this.hexagons[row].push(newHex);

                this.cont_hexagons.addChild(newHex.getContainer());
            }
        }

    }

    getSaveData() {
        return {
            rows: this.rows,
            columns: this.columns,
            hexWidth: this.hexWidth,
            hexHeight: this.hexHeight,
            orientation: this.orientation
        }
    }

    getHexSaveData() {
        let l = [];
        this.hexagons.forEach(row => {
            row.forEach(hex => {
                if (hex.saveData.terrainId != "" || hex.saveData.iconIds.length > 0) {
                    l.push(hex.saveData);
                }

            });
        });

        return l;
    }

    loadArrayData(arrayData) {
        //console.log(arrayData);

        this.hexWidth = arrayData.hexWidth;
        this.hexHeight = arrayData.hexHeight;
        this.orientation = arrayData.orientation;
        this.columns = arrayData.columns;
        this.rows = arrayData.rows;

        this.hexes = [];

        //this = new this(arrayData.columns, arrayData.rows, arrayData.hexWidth, arrayData.hexHeight, arrayData.orientation);
        this.hexPath = generateHexPath(this.hexWidth, this.hexHeight, this.orientation);
        this.generateBGTexture();
        this.generateMasterOutlineTexture();
        this.generateHexHitArea();

        // CHECK FOR MEMORY LEAKS
        clearPixiChildren(this.cont_hexagons);
        this.generateHexes();

        console.log("Loaded");

    }

    loadHexData(hexData) {

        hexData.forEach(hex => {
            let hexObj = this.getHex(hex.row, hex.column);
            hexObj.loadTerrain(hex.terrainId);
            hexObj.loadIcons(hex.iconIds);
        });
        // Save data is in form {"terrainId": "", "iconIds": [], "row": 0, "column": 0}

    }

    getHex(row, column) {
        return this.hexagons[row][column];
    }

    destroy() {
        this.hexagons.forEach(hexRow => {
            hexRow.forEach(hex => {
                hex.destroy();
            });
        });

        destroyPixiChildren(this.cont_hexagons);
        this.grph_masterBG.destroy();
        this.grph_masterOutline.destroy();
        this.tex_masterBG.destroy();
        this.tex_masterOutline.destroy();
    }

}