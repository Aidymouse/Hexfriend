// A hex matrix is just a 2d grid of hexes. A hex matrix selector is a collection of hexagonal buttons which spit data out when you click on a button.

// Terrain Selector

class TerrainSelector extends HexMatrixSelector {
    constructor (tileset) {
        super();

        let hexPath = generateHexPath(this.buttonWidth, this.buttonHeight, "flatTop", 0, 0);

        // Generate the master hex sprite, used to draw button backgrounds
        let grph_masterSpawner = new PIXI.Graphics();
        grph_masterSpawner.beginFill(0xFFFFFF);
        grph_masterSpawner.drawPolygon(hexPath);
        grph_masterSpawner.endFill();

        let tex_masterHex = this.selectorApp.renderer.generateTexture(grph_masterSpawner);

        
        let b = tileset.map(terrainTile => {
            // Set up the container. We need to use a container because hexes can be made up of two sprites
            let cont_button = new PIXI.Container();
            
            // Set up background sprite, including event
            let spr_bgSprite = new PIXI.Sprite(tex_masterHex);
            spr_bgSprite.tint = terrainTile.bgColor;
            spr_bgSprite.anchor.set(0.5);
            
            cont_button.addChild(spr_bgSprite);
            
            // Add symbol, if there is one
            if (terrainTile.symbol) {
                let symbolTexture = primaryLoader.resources[terrainTile.id].texture;
                let spr_symbol = new PIXI.Sprite(symbolTexture);
                spr_symbol.anchor.set(0.5);
                spr_symbol.tint = terrainTile.symbol.color;
                
                //TODO: Update size (do it in the same manner as drawing on the screen does)
                if (this.buttonWidth < this.buttonHeight) {
                    spr_symbol.scale.set((this.buttonWidth * 0.8) / symbolTexture.width);
                } else {
                    spr_symbol.scale.set((this.buttonHeight * 0.8) / symbolTexture.height);
                }

                cont_button.addChild(spr_symbol);
            }

            // Set up functionality for each button
            cont_button.on("click", () => {
                primaryToolData.changeTerrain(terrainTile.id);
            });
            
            // Add button to the list of buttons and increase the tile index
            //this.selectorApp.stage.addChild(cont_button);
            
            //tileIndex += 1;
            
            return cont_button;
        });
        
        this.registerButtons(b);
        
        grph_masterSpawner.destroy();
        //tex_masterHex.destroy();
        
        

    }

    destroyButtons() {
        this.buttons.forEach(cont_button => {
            destroyPixiChildren(cont_button);
            cont_button.destroy();
        });
    }

    

}