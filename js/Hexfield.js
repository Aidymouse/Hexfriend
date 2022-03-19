const DEFAULTHEXWIDTH = 50;
const DEFAULTHEXHEIGHT = 45;

class Hexfield {
    constructor() {
        
        this.hexes = {}; // indexed list
        
        this.undoPacket = []; // this is data that gets given to the undo manager
        this.redoPacket = []; // 

        this.grph_outlines = new PIXI.Graphics();
        this.grph_hexes = new PIXI.Graphics();
        
        this.hexWidth = DEFAULTHEXWIDTH;
        this.hexHeight = DEFAULTHEXHEIGHT;
        
        this.blankHexColor = DEFAULTHEXCOLOR;

        let hexesOut = 10; // radius of hexes away from center

        this.orientation = "flatTop";
        this.gridData = {
            visible: true,
            stroke: 0x333333,
            strokeThickness: 2,
        }
        
        this.cont_symbolSprites = new PIXI.Container();
        // Generate texture
        //this.tex_masterHex = this.generateMasterHexTexture();
        
        
        
        this.cont_main = new PIXI.Container();
        
        
        this.cont_main.interactive = true;

        this.cont_main.on('pointerdown', e => { this.pointerdown(e) });
        this.cont_main.on('pointermove', () => { this.pointermove() });
        this.cont_main.on('pointerup', () => {this.pointerup()});
        
        this.cont_main.addChild(this.grph_hexes);
        this.cont_main.addChild(this.grph_outlines);
        this.cont_main.addChild(this.cont_symbolSprites);

        // Nothing is actually rendered until we load a save!

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
            blankHexColor: this.blankHexColor,
            gridData: {
                visible: this.gridData.visible,
                stroke: this.gridData.stroke,
                strokeThickness: this.gridData.strokeThickness
            },
            hexes: Object.keys(this.hexes).map(hexId => {
                let hex = this.hexes[hexId];

                return { q: hex.q, r: hex.r, terrainId: hex.paintedTerrainId, bgColor: hex.bgColor, symbolColor: hex.spr_symbol ? hex.spr_symbol.tint : null };

            })
        }
    }

    eraseAll() {
        Object.keys(this.hexes).forEach(hexId => {
            let hex = this.hexes[hexId];

            this.cont_symbolSprites.removeChild(hex.spr_symbol);
            hex.spr_symbol.destroy();
        });

        this.hexes = {};
    }

    loadSaveData(hexfieldData) {

        this.hexWidth = hexfieldData.hexWidth;
        this.hexHeight = hexfieldData.hexHeight;
        this.orientation = hexfieldData.orientation;
        this.gridData = {...hexfieldData.gridData};
        this.blankHexColor = hexfieldData.blankHexColor;

        // Load all the hexagons!
        hexfieldData.hexes.forEach(hex => {
            let hexId = this.coordsToHexId( {q: hex.q, r: hex.r, s: -hex.q-hex.r} );
            
            let newHex = { q: hex.q, r: hex.r, s: -hex.q - hex.r, bgColor: this.blankHexColor, spr_symbol: new PIXI.Sprite(), paintedTerrainId: hex.terrainId};

            newHex.spr_symbol.anchor.set(0.5);
            newHex.spr_symbol.visible = false; // Stays false until we draw it for the first time
            this.cont_symbolSprites.addChild(newHex.spr_symbol);


            // Update hex with correct tile
            let tileId = hex.terrainId;


            if (tileId) {

                let tilesetName = tileId.split("_")[0];
                //let tileName = tileId.split("_")[1];
    
                let hexTile = loadedTilesets[tilesetName].find(tile => tile.id == tileId);

                newHex.bgColor = hex.bgColor;

                if (hexTile.symbol) {
                    let s = newHex.spr_symbol;
                    let tex = primaryLoader.resources[hexTile.id].texture;

                    s.texture = tex;
                    s.tint = hex.symbolColor;
                    //s.visible = true;

                }

            }
            this.hexes[hexId] = newHex;
            //this.redrawHex(hexId); // Technically more efficient?
        });

        this.drawOutlines();
        this.renderAllHexesSlow();
    }


    // UNDO / REDO
    handleUndo(hexData) {
        hexData.forEach(hex => {
            
            let hexId = this.coordsToHexId({q: hex.q, r: hex.r, s: hex.s});
            //console.log(hexId);

            console.log(hexId);


            this.hexes[hexId].bgColor = hex.bgColor;
            this.hexes[hexId].spr_symbol.tint = hex.symbolColor;
            this.hexes[hexId].paintedTerrainId = hex.paintedTerrainId;

            // check terrain id against loaded tilesets
            if (hex.paintedTerrainId) {
                let tilesetName = hex.paintedTerrainId.split("_")[0];
                let hexTile = loadedTilesets[tilesetName].find(t => t.id == hex.paintedTerrainId);

                if (hexTile.symbol) {
                    this.hexes[hexId].spr_symbol.texture = primaryLoader.resources[hexTile.id].texture;
                    // change texture
                } else {
                    this.hexes[hexId].spr_symbol.visible = false;
                    this.hexes[hexId].spr_symbol.texture = null;
                }
            } else {
                this.hexes[hexId].spr_symbol.visible = false;
                this.hexes[hexId].spr_symbol.texture = null;
            }

            // Fix the symbols!

            this.redrawHex(hexId);

        });
    }


    // INTERACTION CONTROL
    disableInteraction() {
        this.cont_main.interactive = false;
    }
    
    enableInteraction() {
        this.cont_main.interactive = true;

    }

    pointerdown(e) {

        if (e.data.button == 0) { // :eft Mouse

            if (primaryToolData.selectedTool == "eraser") {
                this.applyEraser();
                return;
            }

            let clickedCoords = worldToAxial(primaryToolData.worldX, primaryToolData.worldY, this.orientation, this.hexWidth, this.hexHeight);
            let hexId = this.coordsToHexId(clickedCoords);
            
            // Validate that there really is a hex with this idea
            if (Object.keys(this.hexes).find(i => hexId == i) == null) return; // There is surely a better way to do this

            /*
            if (primaryToolData.selectedTool == "eraser") {
                this.hexes[hexId].bgColor = this.blankHexColor;
                this.hexes[hexId].paintedTerrainId = null;

                this.hexes[hexId].

                return;
            }*/

    

            // No need to do a tool check, tooldata ensures that if this event fires, we're using the correct tool
            if (this.hexes[hexId].paintedTerrainId != primaryToolData.terrain.tileId || 
                this.hexes[hexId].bgColor != primaryToolData.terrain.backgroundColor ||
                this.hexes[hexId].spr_symbol.tint != primaryToolData.terrain.symbolColor
                ) {

                    
                    let hex = this.hexes[hexId];

                // Add hex to the undo packet before edits
                this.undoPacket.push( {q: hex.q, r: hex.r, s: hex.s, bgColor: hex.bgColor, symbolColor: hex.spr_symbol.tint, paintedTerrainId: hex.paintedTerrainId } );
                
                //console.log(hexId);
    
                this.hexes[hexId].bgColor = primaryToolData.terrain.backgroundColor;
                this.hexes[hexId].paintedTerrainId = primaryToolData.terrain.tileId;
                
                this.hexes[hexId].spr_symbol.tint = primaryToolData.terrain.symbolColor;

                if (primaryToolData.terrain.tex_symbol) {
                    
                    this.hexes[hexId].spr_symbol.texture = primaryToolData.terrain.tex_symbol;
                    this.hexes[hexId].spr_symbol.visible = true;
                    
                } else {
                    this.hexes[hexId].spr_symbol.texture = null;
                    this.hexes[hexId].spr_symbol.visible = false;
                    
                }
                
                
                
                this.redoPacket.push( {q: hex.q, r: hex.r, s: hex.s, bgColor: hex.bgColor, symbolColor: hex.spr_symbol.tint, paintedTerrainId: hex.paintedTerrainId } );
                
                this.redrawHex(hexId);
            }

        }

    }

    pointermove() {
        if (primaryToolData.mouseDown) { this.pointerdown( {data: {button: 0}} ); }
    }

    pointerup() {
        // Add the undo stack!
        primaryUndoManager.pushUndoEvent("hexes_painted", this.undoPacket, this.redoPacket);
        this.undoPacket = [];
        this.redoPacket = [];
    }

    coordsToHexId(axialCoords) {
        return axialCoords.q.toString() + ":" + axialCoords.r.toString() +":"+axialCoords.s.toString();
    }

    applyEraser() {
        let hexId = this.coordsToHexId( worldToAxial(primaryToolData.worldX, primaryToolData.worldY, this.orientation, this.hexWidth, this.hexHeight) );

        if (this.hexes[hexId]) {

            this.hexes[hexId].bgColor = this.blankHexColor;
            this.hexes[hexId].spr_symbol.texture = null;
            this.hexes[hexId].spr_symbol.visible = false;
            this.hexes[hexId].paintedTerrainId = null;
            this.redrawHex(hexId);
        }
    }


    // CONFIG
    // Called from HTML
    setHexSize(newWidth, newHeight) {
        this.hexWidth = newWidth;
        this.hexHeight = newHeight;
        this.renderAllHexes();
        this.drawOutlines();
    }

    changeOrientation(newOrientation) {
        this.orientation = newOrientation;
        this.renderAllHexes();
        this.drawOutlines();
    }

    changeOutlineThickness(newThickness) {
        this.gridData.strokeThickness = newThickness;
        this.drawOutlines();
    }

    changeOutlineVisibility(visible) {
        this.gridData.visible = visible;
        this.drawOutlines(); // will clear outlines if not visible
    }

    changeGridStroke(newColor) {
        this.gridData.stroke = newColor;
        this.drawOutlines();
    }

    changeBlankHexColor(newColor) {
        this.blankHexColor = newColor;
        Object.keys(this.hexes).forEach(hexId => {
            let hex = this.hexes[hexId];
            console.log(hex);
            if (hex.paintedTerrainId == null) {
                hex.bgColor = newColor;
                this.redrawHex(hexId);
            }
        });
    }



    // DRAW

    drawOutlines() {
        this.grph_outlines.clear();
        if (!this.gridData.visible) return;

        Object.keys(this.hexes).forEach(hexId => {
            let hex = this.hexes[hexId];
            let hexCoords = axialToWorld(hex.q, hex.r, hex.s, this.orientation, this.hexWidth, this.hexHeight);

            this.grph_outlines.lineStyle(this.gridData.strokeThickness, this.gridData.stroke);
            this.grph_outlines.drawPolygon(generateHexPath(this.hexWidth, this.hexHeight, this.orientation, hexCoords.x, hexCoords.y));
        });
    }

    renderAllHexesSlow(delay=2) {
        this.grph_hexes.clear();

        Object.keys(this.hexes).forEach( (hexId, index) => {

            setTimeout(() => { this.redrawHex(hexId); }, index*delay);
            

        });
    }

    renderAllHexes() {
        this.grph_hexes.clear();

        Object.keys(this.hexes).forEach(hexId => {

            this.redrawHex(hexId);


        });
    }
    
    redrawHex(hexId) {
        let hex = this.hexes[hexId];
        let hexCoords = axialToWorld(hex.q, hex.r, hex.s, this.orientation, this.hexWidth, this.hexHeight);

        this.grph_hexes.beginFill(hex.bgColor);
        this.grph_hexes.drawPolygon( generateHexPath(this.hexWidth, this.hexHeight, this.orientation, hexCoords.x, hexCoords.y) );
        this.grph_hexes.endFill();

        if (hex.spr_symbol.texture) {
            let newScale;
            if (this.hexWidth < this.hexHeight) {
                newScale = (this.hexWidth * 0.8) / hex.spr_symbol.texture.width;
            } else {
                newScale = (this.hexHeight * 0.8) / hex.spr_symbol.texture.height;
            }
            hex.spr_symbol.scale.set(newScale);

            let hexCoords = axialToWorld(hex.q, hex.r, hex.s, this.orientation, this.hexWidth, this.hexHeight);
            hex.spr_symbol.position.set(hexCoords.x, hexCoords.y);
            hex.spr_symbol.visible = true;
        }
    }
}