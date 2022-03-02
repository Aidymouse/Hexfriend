class Text {
    constructor(x, y, textStyle) {
        this.string = "";
        
        this.dragData = {
            beingDragged: false,
            oldX: 0,
            oldY: 0
        }

        this.style = new PIXI.TextStyle(textStyle);
        
        // This text is later placed in a text container which is used by the textlayer to add.
        // But why???
        this.txt_text = new PIXI.Text("", this.style);
        this.txt_text.interactive = true;


        // Bug where if you try to drop text on text that's in front of it in the Z-direction, it'll get stuck on your mouse. A bit annoying.
        // Set up necessary data for dragging text across the screen
        // I probably could offload this work to only happen once we actually start dragging?
        this.txt_text.on("pointerdown", () => {
            this.dragData.beingDragged = true;
            
            // Fixes a Z-level issue. You can't drop text behind other text unless this happens
            primaryTextLayer.disableAllOtherInteraction(this);
            console.log("Okay");
            
            
            let worldX = primaryToolData.worldX;
            let worldY = primaryToolData.worldY;
            this.dragData.oldX = worldX;
            this.dragData.oldY = worldY;
        });

        // Move the text when it's dragged across the screen
        this.txt_text.on("pointermove", () => {
            if (this.dragData.beingDragged) {
                
                let worldX = primaryToolData.worldX;
                let worldY = primaryToolData.worldY;

                //this.cont_textContents.x += worldX - this.dragData.oldX
                //this.cont_textContents.y += worldY - this.dragData.oldY

                this.txt_text.x += worldX - this.dragData.oldX;
                this.txt_text.y += worldY - this.dragData.oldY;

                this.dragData.oldX = worldX;
                this.dragData.oldY = worldY;

                primaryTextLayer.clearSoftSelector();
                primaryTextLayer.updateSoftSelector();
                primaryTextLayer.redrawSelectorRectangle();
            }

        });

        // Set everything back to rights after the mouse has come up.
        // Since selection text is basically the same as dragging but without moving, we also selected text here
        this.txt_text.on("pointerup", () => {
            this.dragData.beingDragged = false;
            primaryTextLayer.setFocusedText(this);
            primaryTextLayer.enableInteraction();
        });

        // If mouse leaves a text object, set the currently hovered text to nothing, and clear the soft selector.
        this.txt_text.on("pointerout", () => {
            if (this.dragData.beingDragged) {
                // Nothing happens on purpose! Don't want to lose selection
            } else {
                primaryTextLayer.changeHoveredText(null);
                primaryTextLayer.clearSoftSelector();
            }
        });

        // Set the hovered text when the cursor goes over a text
        this.txt_text.on("pointerover", () => {
            primaryTextLayer.changeHoveredText(this);
            primaryTextLayer.updateSoftSelector();
        });

        //this.cont_textContents = new PIXI.Container();
        //this.cont_textContents.addChild(this.txt_text);
        this.moveTo(x, y);
        
    }

    destroy() {
        this.txt_text.destroy();
    }
    
    getSaveData() {
        return {
            string: this.string,
            x: this.txt_text.x,
            y: this.txt_text.y,
            style: {
                fontFamily: this.style.fontFamily,
                fontSize: this.style.fontSize,
                fill: PIXI.utils.string2hex(this.style.fill),
                stroke: this.style.stroke,
                strokeThickness: this.style.strokeThickness,   
            }

        }
    }

    getStyle() {
        return this.style;
    }

    // Dealing with text
    appendCharacter(key) {
        // Process the key

        // Add it
        this.string += key;
        this.txt_text.text = this.string;
    }

    changeText(newString) {
        this.string = newString;
        this.txt_text.text = newString;

    }

    backspace() {
        this.string = this.string.substring(0, this.string.length-1);
        this.txt_text.text = this.string;
    }

    // Dealing with style
    changeStyle(styleName, newStyle) {
        this.style[styleName] = newStyle;
    }

    // Various Helpers
    moveTo(newX, newY){
        this.txt_text.x = newX;
        this.txt_text.y = newY;
        //this.cont_textContents.x = newX;
        //this.cont_textContents.y = newY;
    }

    getX() {
        //return this.cont_textContents.x;
        return this.txt_text.x;
    }

    getY() {
        //return this.cont_textContents.y;
        return this.txt_text.y;
    }

    getWidth() {
        //return this.cont_textContents.width;
        return this.txt_text.width;
    }

    getHeight() {
        //return this.cont_textContents.height;
        return this.txt_text.height;
    }

    disableInteraction() {
        this.txt_text.interactive = false;
    }

    enableInteraction() {
        this.txt_text.interactive = true;
    }

    getContainer() { // Called by TextLayer object.
        //return this.cont_textContents;
        return this.txt_text;
    }

    

    

}