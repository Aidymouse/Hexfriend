// A hex matrix is just a 2d grid of hexes. A hex matrix selector is a collection of hexagonal buttons which spit data out when you click on a button.
// Myabe you register a callback?

// Did this really need to be a class??
class TextStyleSelector extends HexMatrixSelector {
    constructor(textStyles) {
        super();

        // Generate Buttons
        let b = textStyles.map(textStyle => {
            // Set up the text item
            // LOL can you tell I just copied the brush selector or what

            let txt_styleSample = new PIXI.Text("T", textStyle);

            txt_styleSample.anchor.set(0.5);

            // Text Item
 
            /*
            if (this.buttonWidth < this.buttonHeight) {
                txt_styleSample.style['fontSize'].set((this.buttonWidth * 0.8) / iconTexture.width);
            } else {
                txt_styleSample.style['fontSize'].set((this.buttonHeight * 0.8) / iconTexture.height);
            }
            */
            

            // Add button to the list of buttons and increase the tile index
            //this.selectorApp.stage.addChild(cont_button);

            //tileIndex += 1;

            txt_styleSample.on("click", () => {
                primaryTextLayer.handleStyleSelection(textStyle);
            });

            return txt_styleSample;
        });

        this.registerButtons(b);

        this.deselectButton();


    }

    destroyButtons() {
        this.buttons.forEach(cont_button => {
            cont_button.destroy();
        });
    }

    // Special - find a button with a given style
    selectButtonFromStyle(style) {
        
        let matchingTextStyleButton = this.buttons.find(button => 
            button.style.fill == style.fill &&
            button.style.stroke == style.stroke &&
            button.style.strokeThickness == style.strokeThickness &&
            button.style.fontFamily == style.fontFamily &&
            button.style.fontSize == style.fontSize
        )

        if (matchingTextStyleButton == undefined) {
            this.deselectButton();
        } else {
            this.setSelectedButton(matchingTextStyleButton);
        }
    }

    setSelectedButton(button) {
        this.selectedButton = button;
        this.updateSelectorHexPosition();
    }

    deselectButton() {
        this.selectedButton = null;
        this.spr_selector.visible = false;
    }

}