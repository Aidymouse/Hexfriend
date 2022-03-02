// A hex matrix is just a 2d grid of hexes. A hex matrix selector is a collection of hexagonal buttons which spit data out when you click on a button.


// This class handles everything about the hexagon selectors apart from whats in each button and what happens when the buttons are clicked.
// It handles:
// - The selector graphic
// - positioning of the buttons

// - (TODO) resizing the selector

// The selector just needs a collection of button objects so it knows what to display

class HexMatrixSelector {
    constructor() {
        this.selectorApp = new PIXI.Application({
            forceCanvas: true,
            width: 250,
            height: 200,
            antialias: true,
            transparent: true,
        });

        this.selectedButton = null;        
        this.hoveredButton = null;

        //////////////////////////////////////
        // Set up button attribute defaults //
        this.buttonWidth = 50
        this.buttonHeight = 45

        this.maxRowItems = 5; //Math.floor(this.selectorApp.stage.width / (this.buttonWidth*0.75));

        /////////////////////////
        // Set up the selector // 
        // Do it after the buttons so it's on top of everything, not that it should matter
        let selectorMargin = 0;
        let selectorPath = generateHexPath(this.buttonWidth + selectorMargin * 2, this.buttonHeight + selectorMargin * 2, "flatTop", 0, 0);

        let grph_selectorGraphics = new PIXI.Graphics();
        grph_selectorGraphics.lineStyle(2, 0xFFFFFF);
        grph_selectorGraphics.drawPolygon(selectorPath);

        let tex_selector = this.selectorApp.renderer.generateTexture(grph_selectorGraphics);

        this.spr_selector = new PIXI.Sprite(tex_selector);
        this.spr_selector.anchor.set(0.5);

        this.selectorApp.stage.addChild(this.spr_selector);
        
        // Set up the soft selector
        grph_selectorGraphics.clear();
        grph_selectorGraphics.lineStyle(1, 0xFFFFFF);
        grph_selectorGraphics.drawPolygon(selectorPath);
        let tex_softSelector = this.selectorApp.renderer.generateTexture(grph_selectorGraphics);
        this.spr_softSelector = new PIXI.Sprite(tex_softSelector);
        this.spr_softSelector.anchor.set(0.5);
        this.spr_softSelector.visible = false;
        
        this.selectorApp.stage.addChild(this.spr_softSelector);

        // Clean Up. We've generated the sprite, we dont need the graphics anymore.
        grph_selectorGraphics.destroy();

    }

    registerButtons(b) {
        this.buttons = b;

        const gridSpacer = 7;
        const marginFromEdge = 10;

        let hexPath = generateHexPath(this.buttonWidth, this.buttonHeight, "flatTop", 0, 0);

        // The polygon that controls makes the.
        // Since hex coordinates correspond to the center of the nex, the hit area must be translated up and left by half the hexagons square.
        let hexHitArea = new PIXI.Polygon(hexPath);

        //let tileIndex = 0;
        this.buttons.forEach((b, tileIndex) => {

            let tileRow = (tileIndex - tileIndex % this.maxRowItems) / this.maxRowItems; // The row of tiles that this hex is on.
            let localRowIndex = tileIndex % this.maxRowItems; // The index from the left that this tile is in it's row

            // Update buttons position
            //let buttonX = tileIndex % this.maxRowItems;
            //let buttonY = (tileIndex - tileIndex % this.maxRowItems) / this.maxRowItems;

            b.x = marginFromEdge / 2 + this.buttonWidth / 2 + (gridSpacer * localRowIndex) + localRowIndex * this.buttonWidth * 0.75;
            b.y = marginFromEdge + this.buttonHeight / 2 + (gridSpacer * tileRow) + tileRow * this.buttonHeight + (localRowIndex % 2 == 0 ? 0 : this.buttonHeight / 2 - 0.5 + gridSpacer / 2) - gridSpacer / 2;

            b.interactive = true;
            b.hitArea = hexHitArea;

            // Set up events
            b.on("click", () => {
                this.selectedButton = b;
                this.updateSelectorHexPosition();
            });

            b.on("pointerout", () => {
                this.hoveredButton = null;
                this.updateSoftSelector();
            });

            b.on("pointerover", () => {
                this.hoveredButton = b;
                this.updateSoftSelector();
            });

            // Add this button the selector app
            this.selectorApp.stage.addChild(b);

        });
        this.selectedButton = this.buttons[0];

        this.spr_softSelector.zOrder = this.buttons.length + 1
        this.spr_selector.zOrder = this.buttons.length + 2

        this.updateSelectorHexPosition();
    }

    // Put the hex matrix selector into  
    attachToHTMLById(htmlId) {
        $(htmlId).append(this.selectorApp.view);
    }

    // This method is overridden by individual selectors
    destroyButtons() {}

    destroy() {
        this.destroyButtons();
        this.spr_selector.destroy();
        this.spr_softSelector.destroy();
        this.selectorApp.destroy();
    }

    //////////////////////////
    // Selector Hex Methods //
    updateSelectorHexPosition() {
        this.spr_selector.visible = true;
        
        this.spr_selector.x = this.selectedButton.x;
        this.spr_selector.y = this.selectedButton.y;
    }

    updateSoftSelector() {
        if (this.hoveredButton) {
            this.spr_softSelector.x = this.hoveredButton.x;
            this.spr_softSelector.y = this.hoveredButton.y;
            this.spr_softSelector.visible = true;
        } else {
            this.spr_softSelector.visible = false;
        }
    }

    //////////////////////
    // Resizing Methods //
    updateWidth() {
        

    }
}