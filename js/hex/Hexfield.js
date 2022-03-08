

class Hexagon {
    constructor(hexTex, c, q, r, w, h, o) {

        this.cont_hex = new PIXI.Container();

        this.q = q;
        this.r = r;

        this.orientation = o;

        this.width = w;
        this.height = h;

        this.fill = 0xffffff; // Default to white
        
        this.path = generateHexPath(this.width, this.height, this.orientation, this.screenCoords.x, this.screenCoords.y);
        
        this.terrainId = "";

        this.listenToTerrainTool = false;
        this.hovered = false;

        // BACKGROUND FILL

        this.spr_backgroundFill = new PIXI.Sprite(hexTex);
        this.spr_backgroundFill.anchor.set(0.5);
        this.spr_backgroundFill.position.set(this.screenCoords.x, this.screenCoords.y);
        this.spr_backgroundFill.tint = DEFAULTHEXCOLOR;
        
        
        // BACKGROUND SYMBOL
        
        this.spr_symbol = new PIXI.Sprite();
        this.spr_symbol.anchor.set(0.5);
        this.spr_symbol.position.set(this.screenCoords.x, this.screenCoords.y);


        // EVENTS

        this.cont_hex.interactive = true;
        this.cont_hex.hitArea = new PIXI.Polygon(this.path);

        this.cont_hex.on("mousedown", () => {

            if (this.listenToTerrainTool) {

                this.paintHexFromTools();

            } else if ( primaryToolData.selectedTool == "eraser" ) {
                this.revertToDefault();
                
            }


            console.log(`q: ${this.q} r: ${this.r} s: ${this.s}`);

        });
        
        this.cont_hex.on("pointerover", () => {
            if (primaryToolData.mouseDown) {

                if (this.listenToTerrainTool) {
                    this.paintHexFromTools();

                } else if (primaryToolData.selectedTool == "eraser") {
                    this.revertToDefault();
                }
            }

            this.hovered = true;

        })

        this.cont_hex.on("pointerout", () => {
            this.hovered = false;
        });


        // PACK IT IN

        this.cont_hex.addChild(this.spr_backgroundFill);
        this.cont_hex.addChild(this.spr_symbol);
        c.addChild(this.cont_hex);

    }

    paintHexFromTools() {
        //console.log(primaryToolData.terrain);
        this.terrainId = primaryToolData.terrain.tileId;

        this.spr_backgroundFill.tint = primaryToolData.terrain.backgroundColor;

        this.spr_symbol.texture = primaryToolData.terrain.tex_symbol;
        this.spr_symbol.tint = primaryToolData.terrain.symbolColor;

        // Scale the symbol
        if (primaryToolData.terrain.tex_symbol) {

            if (this.width < this.height) {
                this.spr_symbol.scale.set((this.width * 0.8) / primaryToolData.terrain.tex_symbol.width)
            } else {
                this.spr_symbol.scale.set((this.height * 0.8) / primaryToolData.terrain.tex_symbol.height)
            }
        }
    }

    revertToDefault() {
        this.terrainId = "";

        this.spr_backgroundFill.tint = DEFAULTHEXCOLOR;
        
        this.spr_symbol.texture = null;
        this.spr_symbol.tint = 0xffffff;
    }

    changeOrientation(newOrientation, newHexTexture) {
        this.orientation = newOrientation;
        this.path = generateHexPath(this.width, this.height, this.orientation, this.screenCoords.x, this.screenCoords.y);

        this.spr_backgroundFill.texture = newHexTexture;
        this.spr_backgroundFill.position.set(this.screenCoords.x, this.screenCoords.y)

        this.spr_symbol.position.set(this.screenCoords.x, this.screenCoords.y)

        this.cont_hex.hitArea = new PIXI.Polygon(this.path);
        
    }
    
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.path = generateHexPath(this.width, this.height, this.orientation, this.screenCoords.x, this.screenCoords.y);
        
        this.spr_backgroundFill.position.set(this.screenCoords.x, this.screenCoords.y);
        
        // Resize and reposition symbol
        this.spr_symbol.position.set(this.screenCoords.x, this.screenCoords.y);

        if (this.width < this.height) {
            this.spr_symbol.scale.set((this.width * 0.8) / this.spr_symbol.texture.width)
        } else {
            this.spr_symbol.scale.set((this.height * 0.8) / this.spr_symbol.texture.height)
        }

        this.cont_hex.hitArea = new PIXI.Polygon(this.path);
        // Recaclulate icon width and height
    }

    get x() {
        return this.screenCoords.x;
    }

    get y() {
        return this.screenCoords.y;
    }

    get s() {
        return -this.q - this.r;
    }

    get screenCoords() {
        
        if (this.orientation == "flatTop") {
            let hx = this.q * this.width * 0.75
            let hy = this.r * this.height / 2 - this.s * this.height / 2

            return {
                x: hx, //+ (hx > 0 ? -0.5 : 0.5) * this.q,
                y: hy//+ (this.s % 2 == 0 ? this.height/2 : 0)
                
            }
        } else if (this.orientation == "pointyTop") {
            return {
                x: this.q * this.width/2 - this.r * this.width/2,
                y: -this.s * this.height * 0.75 // Negative correct??
            }

        }

        console.log("Something has gone horribly wrong");
        console.log(this.orientation);
    }

    set texture(newTexture) {
        this.spr_backgroundFill.texture = newTexture;
    }

    getSaveData() {
        return {
            q: this.q,
            r: this.r,
            terrainId: this.terrainId
        }
    }

    loadSaveData(data) {
        if (data.terrainId != "") {
            
            primaryToolData.changeTerrain(data.terrainId);
            this.paintHexFromTools();
        }
    }

    destroy() {
        destroyPixiChildren(this.cont_hex);
        this.cont_hex.destroy();
    }

    
}



const GRIDLESSEXPANSION = 0.5;


class Hexfield {
    constructor(saveData, generate=false) {
        this.cont_main = new PIXI.Container();

        this.grph_main = new PIXI.Graphics();

        this.hexes = [];


        if (!generate) {
            
            this.hexWidth = saveData.hexWidth;
            this.hexHeight = saveData.hexHeight;
            this.orientation = saveData.orientation;

            this.gridData = saveData.gridData;

            // Generate new master hex
            this.tex_masterHex = this.generateMasterHexTexture();
            
            saveData.hexes.forEach(hexData => {
                let newHex = new Hexagon(this.tex_masterHex, this.cont_main, hexData.q, hexData.r, this.hexWidth, this.hexHeight, this.orientation);

                newHex.loadSaveData(hexData);

                this.hexes.push(newHex);
            });

        } else {
            // GENERATE HEXES
            
            //let radius = 20;
            //this.hexWidth = (Math.cos(Math.PI/3) * radius) * 4
            //this.hexHeight = (Math.sin(Math.PI/3) * radius) * 2

            this.hexWidth = 50;
            this.hexHeight = 45;

            let hexesOut = 10; // radius of hexes away from center

            this.orientation = "flatTop";
            this.gridData = {
                visible: true,
                stroke: 0x333333,
                strokeThickness: 2,
            }
            
            // Generate texture
            this.tex_masterHex = this.generateMasterHexTexture();

            for (let q = -hexesOut; q <= hexesOut; q++) {
                for (let r = -hexesOut; r <= hexesOut; r++) {

                    if (-q - r >= -hexesOut && -q - r <= hexesOut) {
                        this.hexes.push(new Hexagon(this.tex_masterHex, this.cont_main, q, r, this.hexWidth, this.hexHeight, this.orientation))
                    }

                }
            }
        
        }
        
        // HEX OUTLINES
        // Outlines are handled through a graphics object, becuase they are rarely changed.
        
        this.grph_main.beginFill(0xffffff);
        
        this.drawOutlines();
        this.grph_main.endFill();
        
        this.cont_main.addChild(this.grph_main);
    }

    get graphics() {
        return this.grph_main;
    }

    get container() {
        return this.cont_main;
    }


    // DATA

    getSaveData() {
        return {
            hexWidth: this.hexWidth,
            hexHeight: this.hexHeight,
            orientation: this.orientation,
            gridData: {
                visible: this.gridData.visible,
                stroke: this.gridData.stroke,
                strokeThickness: this.gridData.strokeThickness
            },
            hexes: this.hexes.map(hex => hex.getSaveData() )
        }
    }

    destroy () {
        this.hexes.forEach(hex => hex.destroy());
        clearPixiChildren(this.cont_main);
        this.grph_main.destroy();
        this.tex_masterHex.destroy();

    }
    
    get hoveredHex() {
        return this.hexes.find(hex => hex.hovered);
    }



    // OUTLINES

    drawOutlines() {
        this.grph_main.clear();
        
        if (this.gridData.visible) {
            this.grph_main.lineStyle(this.gridData.strokeThickness, this.gridData.stroke);

            this.hexes.forEach(hex => {
                this.grph_main.drawPolygon(hex.path);
            });
            
        }
    }

    changeOutlineVisibility(visible) {
        this.gridData.visible = visible;

        this.drawOutlines();
    }
    
    changeOutlineThickness(newThickness) {
        this.gridData.strokeThickness = newThickness;
        this.drawOutlines();
    }

    changeOutlineStroke(newStroke) {
        this.gridData.stroke = newStroke;
        this.drawOutlines();
    }



    // INTERACTION CONTROL

    enableInteraction() {
        this.hexes.forEach(hex => {
            hex.listenToTerrainTool = true;
            //hex.cont_hex.interactive = true;
        });
    }
    
    disableInteraction() {
        this.hexes.forEach(hex => {
            hex.listenToTerrainTool = false;
            //hex.cont_hex.interactive = false;
        });
    }



    // HEX MANIPULATION

    generateMasterHexTexture() {
        return generateHexTexture(generateHexPath(this.hexWidth, this.hexHeight, this.orientation, 0, 0));
    }

    eraseHex(coordinates) {
        // This function is called from iconLayer.js. It's a work around because the eraser is meant to erase both icons and terrain in one go, but the event
        // listener will stop if it hits an icon first. Therefore, in the icons "pointerdown" and "pointerover" event listeners, we convert the world X and Y
        // to hex coords and call this method.

        // Optimisation, there are certainly some values of q, r, or s we can throw away automatically by checking against some already saved bounds

        let hex = this.hexes.find(hex => coordinates.q == hex.q && coordinates.r == hex.r && coordinates.s == hex.s);
        hex.revertToDefault();

    }

    changeOrientation(newOrientation) {
        this.orientation = newOrientation;

        //console.log(this.tex_masterHex)
        this.tex_masterHex = this.generateMasterHexTexture();
        
        //let s = new PIXI.Texture.from('img/terrain/tree.png');
        
        //console.log(this.tex_masterHex);
        
        this.hexes.forEach(hex => {
            hex.changeOrientation(newOrientation, this.tex_masterHex)
        });
        
        this.drawOutlines();
        
        // TODO: ecaluclate icon width and height
    }
    
    setHexSize(width, height) {
        this.hexWidth = width;
        this.hexHeight = height;
        
        this.tex_masterHex = this.generateMasterHexTexture();

        this.hexes.forEach(hex => {
            hex.texture = this.tex_masterHex;
            hex.setSize(width, height);
        });

        this.drawOutlines();

    }


    // COORDINATES

    coords_worldToAxial(worldX, worldY) {
        if (this.orientation == "flatTop") {
            // This is the inversion of the hexagons screenCoords getter
            // Of course, substituting -q-r in as S

            let q = worldX / (this.hexWidth * 0.75)
            let r = ((2*worldY)/this.hexHeight - q)/2

            return cube_round( AxialToCube(q, r) );

        } else if (this.orientation == "pointyTop") {
            // How the fuck am i gonna do this
            let q;
            let r;
            
            x = this.q * this.width / 2 - this.r * this.width / 2,
            y = -this.s * this.height * 0.75 // Negative correct??
            return null 

        }
    }

}