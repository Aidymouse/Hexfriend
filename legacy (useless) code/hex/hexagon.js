/* 
A hexes is made of parts:
* TERRAIN is comprised of 2 sprites, the background color and the terrain icon.
The background of the sprite is what is interactive.
* ICONS are the symbols on the front of the 
* OUTLINE is comprised on 1 sprite, which is the hexes outline.

*/

class Hexagon {
    constructor (bgTexture, outlineTexture, hitpolygon) {

        /////////////////////////////
        // Initialize Terrain Tile //

        // Background color
        this.spr_terrainBackground = new PIXI.Sprite(bgTexture);
        this.spr_terrainBackground.tint = DEFAULTHEXCOLOR;
        this.spr_terrainBackground.anchor.set(0.5);

        // Symbol, if any.
        this.spr_terrainSymbol = new PIXI.Sprite();
        this.spr_terrainSymbol.anchor.set(0.5);
        this.symbolTexName = "";
        
        // Define the hit area for the background hex. Events are tied to this hex.
        this.spr_terrainBackground.interactive = true;
        this.spr_terrainBackground.hitArea = hitpolygon;

        ///////////////////////////
        // Initialize highlight  //
        // I stg there's a more efficient way. We can probably put the highlight sprite in the hex array
        this.spr_highlight = new PIXI.Sprite(bgTexture)  
        this.spr_highlight.anchor.set(0.5);
        this.spr_highlight.alpha = 0.2;
        this.spr_highlight.visible = false;

        ///////////
        // Icons //
        this.cont_icons = new PIXI.Container();

        ////////////////////////
        // Initialize Outline //
        this.spr_outline = new PIXI.Sprite(outlineTexture);
        this.spr_outline.anchor.set(0.5);
        this.spr_outline.tint = DEFAULTOUTLINECOLOR;

        ///////////////////////
        // Hexagon Container //
        // This collects all elements of the hex into one container.
        // This container is added to the stage by the hex array.
        // The order of additions is important
        this.cont_hexContents = new PIXI.Container();
        this.cont_hexContents.addChild(this.spr_terrainBackground);
        this.cont_hexContents.addChild(this.spr_terrainSymbol);
        this.cont_hexContents.addChild(this.spr_highlight);
        this.cont_hexContents.addChild(this.cont_icons);
        this.cont_hexContents.addChild(this.spr_outline);        

        // All the data we need to save is here. It exactly mirrors the JSON file we save to
        this.saveData = { terrainId: "", iconIds: [], row: 0, column: 0 }

        ////////////
        // Events //

        // Mouse Over
        this.spr_terrainBackground.on('pointerover', () => {
            switch (primaryToolData.selectedTool) {
                case "terrain":
                    if (primaryToolData.mouseDown) {
                        this.updateTerrain();
                    } else {
                        this.showHighlight();
                    }
                    break;

                case "icon":
                    if (primaryToolData.mouseDown) {
                        if (primaryToolData.icon.eraserEnabled) {
                            this.clearIcons();
                        } else {
                            this.addIcon();
                        }
                    } else {
                        this.showHighlight();
                    }
                    break;

                case "eraser":
                    if (primaryToolData.mouseDown) {
                        this.completelyErase()
                    } else {
                        this.showHighlight();
                    }
            }

        });

        // Mouse Out
        this.spr_terrainBackground.on('pointerout', () => {
            switch (primaryToolData.selectedTool) {
                case "terrain":
                    this.hideHighlight();
                    break;
                    
                case "icon":
                    this.hideHighlight();
                    break;

                case "eraser":
                    this.hideHighlight();
                    break;
            }
        });

        // Click
        this.spr_terrainBackground.on('pointerdown', e => {
            if (e.data.button == 0) {
                switch (primaryToolData.selectedTool) {
                    case "terrain":
                        this.updateTerrain();
                        break;

                    case "icon":
                        if (primaryToolData.icon.eraserEnabled) {
                            this.clearIcons();
                        } else {
                            this.addIcon();
                        }
                        break;

                    case "eraser":
                        this.completelyErase();
                        break;
                }
            }
        });

        // Mouse Up
        this.spr_terrainBackground.on("pointerup", e => {
            if (e.data.button == 0) {
                switch (primaryToolData.selectedTool) {
                    case "terrain":
                        this.showHighlight();
                        break;
                    
                    case "icon":
                        this.showHighlight();
                        break;
                    
                    case "eraser":
                        this.showHighlight();
                        break;
                }
            }
        })

    }

    destroy() {
        
        destroyPixiChildren(this.cont_hexContents);
        destroyPixiChildren(this.cont_icons);
        
        this.cont_hexContents.destroy();
        this.cont_icons.destroy();

        //this.spr_highlight.destroy();
        //this.spr_outline.destroy();
        //this.spr_terrainBackground.destroy();
        //this.spr_terrainSymbol.destroy();

    }

    ////////////////////////
    // Terrain Management //
    loadTerrain(terrainId) {
        if (terrainId != "") {
            primaryToolData.changeTerrain(terrainId);
            this.updateTerrain();
        }
    }

    updateTerrain() {
        // Update save data
        this.saveData.terrainId = primaryToolData.terrain.tileId;

        this.spr_highlight.visible = false;

        // Update Terrain Background Color
        this.backgroundColor = primaryToolData.terrain.backgroundColor;
        this.spr_terrainBackground.tint = this.backgroundColor;

        // Update Symbol
        this.spr_terrainSymbol.texture = primaryToolData.terrain.tex_symbol;
        this.spr_terrainSymbol.tint = primaryToolData.terrain.symbolColor;

        // Scale the symbol
        if (primaryToolData.terrain.tex_symbol) {
            let hexWidth = this.spr_terrainBackground.width;
            let hexHeight = this.spr_terrainBackground.height;

            let iconWidth = primaryToolData.terrain.tex_symbol.width;
            let iconHeight = primaryToolData.terrain.tex_symbol.height;

            if (hexWidth < hexHeight) {
                this.spr_terrainSymbol.scale.set((hexWidth*0.8) / iconWidth)
            } else {
                this.spr_terrainSymbol.scale.set((hexHeight*0.8) / iconHeight)
            }
        }


    }     

    // Icons //
    loadIcons(iconIds) {
        this.saveData.iconIds = iconIds;

        iconIds.forEach(id => {
            primaryToolData.changeIcon(id);
            this.addIcon();
        });
    }

    addIcon() {
        // Append Icon to list of icon names
        this.saveData.iconIds.push(primaryToolData.icon.iconId);

        let newIcon = new PIXI.Sprite(primaryToolData.icon.tex_icon);
        newIcon.anchor.set(0.5);
        newIcon.tint = primaryToolData.icon.color;
        
        let hexWidth = this.spr_terrainBackground.width;
        let hexHeight = this.spr_terrainBackground.height;

        if (hexWidth < hexHeight) {
            newIcon.scale.set( (hexWidth * 0.7) / newIcon.width )
        } else {
            newIcon.scale.set( (hexHeight * 0.7) / newIcon.height )
        }

        this.cont_icons.addChild(newIcon);

    }

    clearIcons() { // Idk if this is good in memory, but I'll leave it for now
        this.cont_hexContents.removeChild(this.cont_icons);
        this.cont_icons = new PIXI.Container();
        this.cont_hexContents.addChild(this.cont_icons);
        while (this.saveData.iconIds > 0) {
            this.saveData.iconIds.pop()
        }
    }

    // Eraser //
    completelyErase() {
        // Deal with the highlight
        this.spr_highlight.visible = false;

        // Revert terrain background to default color and erase terrain texture
        this.spr_terrainSymbol.texture = null;
        this.spr_terrainBackground.tint = DEFAULTHEXCOLOR;
        this.saveData.terrainId = "";

        // Delete all icons
        this.clearIcons();
    }

    // Non Event Based //
    showHighlight() {
        this.spr_highlight.visible = true;
    }

    hideHighlight() {
        this.spr_highlight.visible = false;
    }

    move(newX, newY) {
        this.cont_hexContents.x = newX
        this.cont_hexContents.y = newY
    }

    getContainer() {
        return this.cont_hexContents;
    }
}


// Helpers
function addHexColor(c1, c2) {
    let hexString = shiftColor(c1.toString(16), c2.toString(16), 'add')
    return parseInt(hexString, 16)
}

// Credit to KFox112 on Stackoverflow //
function shiftColor(base, change, direction) {
    const colorRegEx = /^\#?[A-Fa-f0-9]{6}/;

    // Missing parameter(s)
    if (!base || !change) {
        return '000000';
    }

    // Invalid parameter(s)
    if (!base.match(colorRegEx) || !change.match(colorRegEx)) {
        return '000000';
    }

    // Remove any '#'s
    base = base.replace(/\#/g, '');
    change = change.replace(/\#/g, '');

    // Build new color
    let newColor = '';
    for (let i = 0; i < 3; i++) {
        const basePiece = parseInt(base.substring(i * 2, i * 2 + 2), 16);
        const changePiece = parseInt(change.substring(i * 2, i * 2 + 2), 16);
        let newPiece = '';

        if (direction === 'add') {
            newPiece = (basePiece + changePiece);
            newPiece = newPiece > 255 ? 255 : newPiece;
        }
        if (direction === 'sub') {
            newPiece = (basePiece - changePiece);
            newPiece = newPiece < 0 ? 0 : newPiece;
        }

        newPiece = newPiece.toString(16);
        newPiece = newPiece.length < 2 ? '0' + newPiece : newPiece;
        newColor += newPiece;
    }

    return newColor;
}