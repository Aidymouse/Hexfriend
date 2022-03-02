// A hex matrix is just a 2d grid of hexes. A hex matrix selector is a collection of hexagonal buttons which spit data out when you click on a button.
// Myabe you register a callback?

// Did this really need to be a class??
class IconSelector extends HexMatrixSelector {
    constructor (iconset) {
        super();
        
        // Generate Hex
        let hexPath = generateHexPath(this.buttonWidth, this.buttonHeight, "flatTop", 0, 0);

        let grph_masterSpawner = new PIXI.Graphics();
        grph_masterSpawner.beginFill(0xFFFFFF);
        grph_masterSpawner.drawPolygon(hexPath);
        grph_masterSpawner.endFill();

        let tex_masterHex = this.selectorApp.renderer.generateTexture(grph_masterSpawner);

        // Generate Buttons
        let b = iconset.map(iconData => {
            // Set up the container. We need to use a container because hexes can be made up of two sprites
            // LOL can you tell I just copied the brush selector or what
            let cont_iconButton = new PIXI.Container();

            let spr_bg = new PIXI.Sprite(tex_masterHex);
            spr_bg.anchor.set(0.5);
            spr_bg.alpha = 0;

            cont_iconButton.addChild(spr_bg);

            // Make the icon sprite
            let iconTexture = primaryLoader.resources[iconData.id].texture;
            let spr_icon = new PIXI.Sprite(iconTexture);
            spr_icon.anchor.set(0.5);
            spr_icon.tint = iconData.color;
            if (this.buttonWidth < this.buttonHeight) {
                spr_icon.scale.set((this.buttonWidth * 0.8) / iconTexture.width);
            } else {
                spr_icon.scale.set((this.buttonHeight * 0.8) / iconTexture.height);
            }

            cont_iconButton.addChild(spr_icon);

            cont_iconButton.on("click", () => {
                primaryToolData.changeIcon(iconData.id);
            });
            
            // Add button to the list of buttons and increase the tile index
            //this.selectorApp.stage.addChild(cont_button);
            
            //tileIndex += 1;
            
            return cont_iconButton;
        });

        tex_masterHex.destroy();
        grph_masterSpawner.destroy();

        this.registerButtons(b);

        
        

    }

    destroyButtons() {
        this.buttons.forEach(cont_button => {
            destroyPixiChildren(cont_button);
            cont_button.destroy();
        });
    }

}