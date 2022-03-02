class TextLayer {
    constructor(width, height) {
        this.textObjects = [];
        this.focusedText = null; // Focused text is text that is currently editable
        this.hoveredText = null; // Hovered text is text that the mouse is hovering over

        this.appWidthReference = width // These will need to change when the window size changes :/
        this.appHeightReference = height
        
        // Set up event isteners
        this.spr_interactor = new PIXI.Sprite();
        this.spr_interactor.width = width;
        this.spr_interactor.height = height;
        this.spr_interactor.interactive = false;
        
        this.grph_selectorGraphics = new PIXI.Graphics(); // The selector graphics object is used to draw the box around text to indicate which is selected and / or hovered.
        
        // Initialize selector rectangles. We just manipulate these objects later rather than making new ones.
        // Scratch that, I actually *dont* do that for some reason??? Should probably refactor the hard selector and soft selector functions
        this.grph_selectorGraphics.lineStyle(5, 0x444444);
        //this.rect_hardSelector = this.grph_selectorGraphics.drawRect(0, 0, 0, 0);
        
        this.grph_selectorGraphics.lineStyle(2, 0x444444);
        //this.rect_softSelector = this.grph_selectorGraphics.drawRect(0, 0, 0, 0);

        this.cont_textContainer = new PIXI.Container();
        this.cont_textContainer.addChild(this.spr_interactor);
        this.cont_textContainer.addChild(this.grph_selectorGraphics);
        
        // Handle clicking to create new text. Note that this isn't called if we click on a text object itself
        /*
        this.spr_interactor.on("pointerdown", e => {
            //console.log("[TEXT] Clicked on Layer");

            if (e.data.button == 0){
                if (this.focusedText) {
                    if (this.focusedText.string == "") {
                        this.deleteFocusedText();
                    }
                    
                    this.focusedText = null;
                    this.clearSelectorGraphics();
                    this.css_hideSpecificTextControls();

                } else {
                    let newText = new Text(
                        
                        primaryToolData.worldX + this.cont_textContainer.x, primaryToolData.worldY + this.cont_textContainer.y, 

                        {
                            fontFamily: "Comic Sans MS", // change later lol
                            fontSize: Number($('#textSize').val()),
                            fill: $('#textColor').val(),
                            stroke: $('#textStroke').val(),
                            strokeThickness: Number($('#textStrokeThickness').val())
                        }
                    );

                    this.appendTextObject(newText);

                    this.setFocusedText(newText);
                    this.redrawSelectorRectangle();
                }
            }
        });
        */
        
        // Test for a new interactor size every time the mouse is moved.
        this.spr_interactor.on("pointermove", e => {
            this.expandInteractor();
        });

        // I dont know what this is for. As far as I know commenting the whole thing out doesnt break anything. Okay.
        /*
        this.spr_interactor.on("pointerup", e => {
            if (this.hoveredText) {
                // Why do we iterate here???
                this.textObjects.forEach(t => {
                    t.dragData.beingDragged = false;
                });
                //this.setFocusedText(this.hoveredText); // Dont think this is necessary
                this.changeHoveredText(null);
                this.clearSoftSelector();
            }
        });*/
        
        // The keyboard will type the full name of any key I press because thats how JS key events work. I'll make it a nicer text editor later.
        this.nonTypables = {
            Shift: true,
            Backspace: true,
            Alt: true,
            Control: true,
            Tab: true,
            CapsLock: true,
            Escape: true,
            Enter: true,
            Delete: true
        }

        // Controls, TODO
        this.controlsDown = {
            Shift: false, // For selecting
        }
        
    }



    // DATA MANAGEMENT

    destroy() {
        this.textObjects.forEach(to => to.destroy());
        destroyPixiChildren(this.cont_textContainer);
    }

    // Make a new text object out of saved JSON data
    loadText(textSaveData) {
        textSaveData.forEach(textData => {

            let newText = new Text(
                textData.x, textData.y,
                textData.style
            );

            newText.changeText(textData.string);

            this.appendTextObject(newText);

        });

    }

    getSaveData() {
        return this.textObjects.map(t => {return t.getSaveData()});
    }



    // EVENTS

    // Called from an event on the canvas
    mouseDown(e) {

        if (e.button == 0) {

            // CASE: Text object selected -> clicking on another text object
            if (this.focusedText && this.hoveredText) {
                this.deselectText();

                this.calibrateSelectorGraphics();
            }
 
            // CASE: Text Object Selected -> Clicking on no text
            else if (this.focusedText) {

                if (this.focusedText.string == "") {
                    this.deleteFocusedText();
                }

                this.focusedText = null;
                this.clearSelectorGraphics();
                this.css_hideSpecificTextControls();

            }

            // CASE: No text selected -> Not clicking on text
            else {
                let newText = new Text(

                    primaryToolData.worldX, primaryToolData.worldY,

                    {
                        fontFamily: "Comic Sans MS", // change later lol
                        fontSize: Number($('#textSize').val()),
                        fill: $('#textColor').val(),
                        stroke: $('#textStroke').val(),
                        strokeThickness: Number($('#textStrokeThickness').val())
                    }
                );

                this.appendTextObject(newText);

                this.setFocusedText(newText);
                this.redrawSelectorRectangle();
            }
        }
    }



    // INTERACTION CONTROL

    // Create a new text objects
    appendTextObject(textObject) {   
        this.textObjects.push(textObject);
        this.cont_textContainer.addChild(textObject.getContainer());
        
    }

    // Delete all text objects
    clearText() {
        // Length two because the interactor and selector graphics stay in the container. They're always added first so we know it's the first two.
        while (this.cont_textContainer.children.length > 2) {
            // Wait... maybe demonstrably innefficient :think:
            this.cont_textContainer.removeChild(this.cont_textContainer.children[2]);
            this.textObjects.pop();
        }
    }

    // Return the container 
    getContainer(){
        return this.cont_textContainer;
    }

    // Turn off all interactive elements for both the text selection layer and all text objects.
    // Also clean up the focuxed and hovered text
    disableInteraction() {
        this.spr_interactor.interactive = false;

        this.focusedText = null;
        this.hoveredText = null;

        this.textObjects.forEach(t => {
            t.disableInteraction();
        });

        this.clearSelectorGraphics();
    }

    // Enable all interactive elements for  both text selector and all text objects
    enableInteraction() {
        //this.spr_interactor.interactive = true;
        this.textObjects.forEach(t => {
            t.enableInteraction();
        });
    }

    disableAllOtherInteraction(exceptThisTextObject) {
        this.textObjects.forEach(t => {
            if (t != exceptThisTextObject) {
                t.disableInteraction();
            }
        });
    }

    // The text layer relies on a large interactive panel that covers all known text objects.
    /*
    expandInteractor() {
        let rightMostEdge = this.cont_textContainer.x + this.cont_textContainer.width;
        let bottomMostEdge = this.cont_textContainer.y + this.cont_textContainer.height;

        if (primaryToolData.worldX < this.cont_textContainer.x) {
            let addedWidth = this.cont_textContainer.x - primaryToolData.worldX;
            this.cont_textContainer.x = primaryToolData.worldX;
            this.cont_textContainer.width += addedWidth;

        } else if (primaryToolData.worldX > rightMostEdge) {
            let addedWidth = primaryToolData.worldX - rightMostEdge;
            this.cont_textContainer.width += addedWidth;
        }
        
        /* 
        if (PrimaryToolData.worldY < this.cont_textContainer.y) {
            let addedHeight = this.cont_textContainer.y - PrimaryToolData.worldY;
            this.cont_textContainer.y = PrimaryToolData.worldY;
            this.cont_textContainer.height += addedHeight;
        } 
    }
    */



    // HTML

    // Update the text controls with the style of the text we're currently focused on.
    // Called when we change focused text style
    giveTextStyleToHTML() {
        let focusedStyle = this.focusedText.getStyle();
    
        $("#textColor").val(focusedStyle.fill);
        $("#textSize").val(focusedStyle.fontSize);
        $("#textStroke").val(focusedStyle.stroke);
        $("#textStrokeThickness").val(focusedStyle.strokeThickness);

    }

    // The next two methods are used to show the controls on the page which only work with certain 
    css_showSpecificTextControls() {
        $("#text-selected-only-controls").removeClass("hidden");
    }

    css_hideSpecificTextControls() {
        $("#text-selected-only-controls").addClass("hidden");
    }

    // Change the style of focused text. This is called by a function in main, which is called by the html elements when they are edited.
    // It in turn calls a function in the text object which updates the style using whatever pedantic method pixi uses.
    changeFocusedTextStyle(styleName, newStyle) {
        if (this.focusedText) {
            this.focusedText.changeStyle(styleName, newStyle);
            this.redrawSelectorRectangle();

        }
    }


    // Text Removal
    

    // Keyboard Handling. Needs some hefty work at some stage. Maybe tie this to a text box somewhere on the page...
    handleKeyDown(event) {
        if (this.focusedText) {
            // Process the key
            if (this.nonTypables[event.key]) {
                switch (event.key) {
                    case "Backspace":
                        this.focusedText.backspace();
                        this.redrawSelectorRectangle();
                        break;
                    
                    case "Delete":
                        if (this.hoveredText == this.focusedText) {
                            this.changeHoveredText(null);
                        }
                        this.deleteFocusedText();
                        
                        break;
                    
                }

            } else {
                this.focusedText.appendCharacter(event.key)
                this.redrawSelectorRectangle();

            }
        }
    }

    



    // TEXT SELECTION

    // Deal with the selector
    // These methods are called by the text objects. That might be super hacky.
    setFocusedText(newText) {
        if (newText == null) {
            if (this.focusedText.string == "") {
                this.deleteFocusedText();
            }

            this.focusedText = null;

        } else {
            this.focusedText = newText;
            this.redrawSelectorRectangle();
            this.giveTextStyleToHTML();
    
            this.css_showSpecificTextControls();
        }

    }

    changeHoveredText(newText) {
        this.hoveredText = newText;
        //this.updateSoftSelector();
    }

    deleteFocusedText() {
        if (this.focusedText) {
            this.cont_textContainer.removeChild(this.focusedText.getContainer())
            this.textObjects.splice(this.textObjects.indexOf(this.focusedText))
            this.focusedText.destroy();
            delete this.focusedText;
            this.clearSelectorGraphics();
            this.updateSoftSelector();
            this.focusedText = null;

            //console.log("Hide!");
            this.css_hideSpecificTextControls();
        }
    }


    // SELECTOR

    // Just draw the selector rectangle again. Wait... why would we have to draw the whole thing again?
    // Only redraw if there is focused text to draw around, then update the soft selector.
    redrawSelectorRectangle() {
        if (this.focusedText) {
            this.grph_selectorGraphics.clear();
            this.grph_selectorGraphics.lineStyle(3, 0x444444);
            this.rect_hardSelector = this.grph_selectorGraphics.drawRect(
                this.focusedText.getX(), this.focusedText.getY(),
                this.focusedText.getWidth(), this.focusedText.getHeight()
            )
        }

        this.updateSoftSelector();
        
    }

    // Redraw the soft selector.
    // Only draw if there is some hoevered text.
    updateSoftSelector() {
        if (this.hoveredText) {
            this.grph_selectorGraphics.lineStyle(1, 0x444444);
            this.rect_softSelector = this.grph_selectorGraphics.drawRect(
                this.hoveredText.getX(), this.hoveredText.getY(),
                this.hoveredText.getWidth(), this.hoveredText.getHeight()
            )
        }
    }

    // Just delete the soft selector
    clearSoftSelector() {
        //console.log("TEXT: Clearing Soft Selector");
        this.grph_selectorGraphics.clear();
        this.redrawSelectorRectangle();
    }

    clearHardSelector() {
        this.grph_selectorGraphics.clear();
        this.redrawSelectorRectangle();
    }

    // Delete all selector graphics. Just get rid of everything.
    // Really needs a better name
    clearSelectorGraphics() {
        //console.log("TEXT: Clearing All Graphics")
    }
    
    // Called whenever the selector graphics need updating
    calibrateSelectorGraphics() {
        this.grph_selectorGraphics.clear();

        if (this.focusedText) {
            this.grph_selectorGraphics.clear();
            this.grph_selectorGraphics.lineStyle(3, 0x444444);
            this.rect_hardSelector = this.grph_selectorGraphics.drawRect(
                this.focusedText.getX(), this.focusedText.getY(),
                this.focusedText.getWidth(), this.focusedText.getHeight()
            )
        }

        if (this.hoveredText) {
            this.grph_selectorGraphics.lineStyle(1, 0x444444);
            this.rect_softSelector = this.grph_selectorGraphics.drawRect(
                this.hoveredText.getX(), this.hoveredText.getY(),
                this.hoveredText.getWidth(), this.hoveredText.getHeight()
            )
        }

    }


    

}