class Text {
    constructor(x, y, style) {
        this._string = "";
        this.style = new PIXI.TextStyle(style);

        this.hovered = false;

        this.txt_text = new PIXI.Text("", this.style);
        this.txt_text.interactive = true;

        this.txt_text.on("pointerout", () => {
            primaryTextLayer.setHoveredText(null);
            primaryTextLayer.calibrateSelectorGraphics();
        })

        this.txt_text.on("pointerover", () => {
            primaryTextLayer.setHoveredText(this);
            primaryTextLayer.calibrateSelectorGraphics();
        });

        // Reposition
        this.txt_text.x = x;
        this.txt_text.y = y;
    }

    setText(newText) {
        this._string = newText;
    }

    backspace() {
        this.string = this.string.substring(0, this.string.length - 1);
    }

    getSaveData() {
        return {
            string: this._string,
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

    destroy() {
        this.txt_text.destroy();
    }

    appendCharacter(char) {
        this._string += char;
        this.txt_text.text = this._string;
    }

    get x() {
        return this.txt_text.x;
    }

    set x(newX) {
        this.txt_text.x = newX;
    }

    get y() {
        return this.txt_text.y;
    }

    set y(newY) {
        this.txt_text.y = newY;
    }

    get width() {
        return this.txt_text.width;
    }

    get height() {
        return this.txt_text.height;
    }

    /**
     * @param {string} newString
     */
    set string(newString) {
        this._string = newString;
        this.txt_text.text = newString;
    }

    get string() {
        return this._string;
    }
}



class TextLayer {
    constructor(width, height) {
        this.textObjects = [];
        this.selectedText = null; // Selected text is text that is currently editable
        this.hoveredText = null; // Hovered text is text that the mouse is hovering over


        // SELECTOR GRAPHICS
        
        this.grph_selectorGraphics = new PIXI.Graphics(); // The selector graphics object is used to draw the box around text to indicate which is selected and / or hovered.

        // Initialize selector rectangles. We just manipulate these objects later rather than making new ones.
        // Scratch that, I actually *dont* do that for some reason??? Should probably refactor the hard selector and soft selector functions
        this.grph_selectorGraphics.lineStyle(5, 0x444444);
        //this.rect_hardSelector = this.grph_selectorGraphics.drawRect(0, 0, 0, 0);

        this.grph_selectorGraphics.lineStyle(2, 0x444444);
        //this.rect_softSelector = this.grph_selectorGraphics.drawRect(0, 0, 0, 0);


        // Container that holds everything to do with text (probably a terrible idea, Z-level speaking)
        this.cont_textContainer = new PIXI.Container();
        this.cont_textContainer.addChild(this.grph_selectorGraphics);


        // TEXT CONTROL

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
    
    eraseAll() {
        this.textObjects.forEach(to => to.destroy());
        this.setHoveredText(null);
        this.setSelectedText(null);
        this.calibrateSelectorGraphics();
        this.textObjects = [];
    }

    // Make a new text object out of saved JSON data
    loadSaveData(textSaveData) {

        textSaveData.forEach(textData => {

            let newText = new Text(
                textData.x, textData.y,
                textData.style
            );

            newText.string = textData.string;


            this.appendTextObject(newText);

        });

    }

    getSaveData() {
        return this.textObjects.map(t => { return t.getSaveData() });
    }

    

    // EVENTS

    mouseMove() {
        if (primaryToolData.text.dragging) {
            let dx = primaryToolData.text.oldX - primaryToolData.worldX;
            let dy = primaryToolData.text.oldY - primaryToolData.worldY;

            this.selectedText.x = this.selectedText.x - dx;
            this.selectedText.y = this.selectedText.y - dy;

            primaryToolData.text.oldX = primaryToolData.worldX;
            primaryToolData.text.oldY = primaryToolData.worldY;

            this.calibrateSelectorGraphics();
        }
    }

    mouseUp(e) {
        // Turn off any dragging variables
        if (e.button == 0) {
            primaryToolData.text.oldX = -1;
            primaryToolData.text.oldY = -1;
            primaryToolData.text.dragging = false;

        }
    }

    // Called from an event on the canvas
    mouseDown(e) {

        console.log(this.hoveredText, this.selectedText)

        if (e.button == 0) {

            // CASE: Text object selected -> clicking on another text object
            //   OR: No text selected -> Clicking on text
            if (this.hoveredText) {
                this.setSelectedText(this.hoveredText);
                //this.setHoveredText(null);
                this.calibrateSelectorGraphics();
                this.detectSelectedTextStyle(this.selectedText.style);

                primaryToolData.text.oldX = primaryToolData.worldX;
                primaryToolData.text.oldY = primaryToolData.worldY;
                primaryToolData.text.dragging = true;
            }

            // CASE: Text Object Selected -> Clicking on no text
            else if (this.selectedText) {

                if (this.selectedText.string == "") {
                    this.deleteSelectedText();
                }

                this.setSelectedText(null);
                this.calibrateSelectorGraphics();
                this.css_hideSpecificTextControls();

            }

            // CASE: No text selected -> Not clicking on text
            else {
                let newText = new Text(

                    primaryToolData.worldX, primaryToolData.worldY,

                    {
                        fontFamily: $("#text_font-family").val(), // change later lol
                        fontSize: Number($('#textSize').val()),
                        fill: $('#textColor').val(),
                        stroke: $('#textStroke').val(),
                        strokeThickness: Number($('#textStrokeThickness').val())
                    }
                );

                this.appendTextObject(newText);

                this.setSelectedText(newText);
                
                this.calibrateSelectorGraphics();
            }
        }
    }

    // Keyboard Handling. Needs some hefty work at some stage. Maybe tie this to a text box somewhere on the page...
    handleKeyDown(event) {
        if (this.selectedText) {
            // Process the key
            if (this.nonTypables[event.key]) {
                switch (event.key) {
                    case "Backspace":
                        this.selectedText.backspace();
                        this.calibrateSelectorGraphics();
                        break;

                    case "Delete":
                        if (this.hoveredText == this.selectedText) {
                            this.changeHoveredText(null);
                        }
                        this.deleteSelectedText();
                        break;

                }

            } else {
                this.selectedText.appendCharacter(event.key)
                this.calibrateSelectorGraphics();

            }
        }
    }



    // TEXT OBJECT SELECTION

    // Deal with the selector
    // These methods are called by the text objects. That might be super hacky.
    setSelectedText(newText) {
        if (this.selectedText) {
            if (this.selectedText.string == "") {
                this.deleteSelectedText();
            }
        }

        if (newText == null) {
            this.selectedText = null;

        } else if (newText != null) {
            this.selectedText = newText;
            this.calibrateSelectorGraphics();
            this.giveTextStyleToHTML();
            this.css_showSpecificTextControls();
        }

    }

    setHoveredText(newText) {
        this.hoveredText = newText;
    }

    deleteSelectedText() {
        if (this.selectedText) {
            this.cont_textContainer.removeChild(this.selectedText.txt_text)
            this.textObjects.splice(this.textObjects.indexOf(this.selectedText))
            this.selectedText.destroy();
            delete this.selectedText;
            this.calibrateSelectorGraphics();
            this.selectedText = null;

            //console.log("Hide!");
            this.css_hideSpecificTextControls();
        }
    }
    


    // INTERACTION CONTROL

    // Create a new text objects
    appendTextObject(textObject) {
        this.textObjects.push(textObject);
        this.cont_textContainer.addChild(textObject.txt_text);

    }    

    // Return the container 
    getContainer() {
        return this.cont_textContainer;
    }

    // Turn off all interactive elements for both the text selection layer and all text objects.
    // Also clean up the focuxed and hovered text
    disableInteraction() {
        this.textObjects.forEach(t => {
            t.txt_text.interactive = false;
        });
        
        this.setSelectedText(null);
        this.setHoveredText(null);

        this.calibrateSelectorGraphics();
    }

    // Enable all interactive elements for  both text selector and all text objects
    enableInteraction() {
        //this.spr_interactor.interactive = true;
        this.textObjects.forEach(t => {
            t.txt_text.interactive = true;
        });
    }

    disableAllOtherInteraction(exceptThisTextObject) {
        this.textObjects.forEach(t => {
            if (t != exceptThisTextObject) {
                t.txt_text.interactive = false;
            }
        });
    }



    // HTML

    // Update the text controls with the style of the text we're currently selected on.
    // Called when we change selected text style
    giveTextStyleToHTML() {
        let selectedStyle = this.selectedText.style;

        $("#textColor").val(selectedStyle.fill);
        $("#textSize").val(selectedStyle.fontSize);
        $("#textStroke").val(selectedStyle.stroke);
        $("#textStrokeThickness").val(selectedStyle.strokeThickness);
        $("#text_font-family").val(selectedStyle.fontFamily);

    }

    // The next two methods are used to show the controls on the page which only work with certain 
    css_showSpecificTextControls() {
        $("#text-selected-only-controls").removeClass("hidden");
    }

    css_hideSpecificTextControls() {
        $("#text-selected-only-controls").addClass("hidden");
    }

    // Change the style of selected text. This is called by a function in main, which is called by the html elements when they are edited.
    // It in turn calls a function in the text object which updates the style using whatever pedantic method pixi uses.
    changeSelectedTextStyle(styleName, newStyle) {
        if (this.selectedText) {
            this.selectedText.style[styleName] = newStyle;
            this.calibrateSelectorGraphics();

            this.detectSelectedTextStyle(this.selectedText.style);
        }
    }
   


    // SELECTOR

    // Called whenever the selector graphics need updating
    calibrateSelectorGraphics() {
        this.grph_selectorGraphics.clear();

        if (this.selectedText) {
            this.grph_selectorGraphics.clear();
            this.grph_selectorGraphics.lineStyle(3, 0x444444);
            this.rect_hardSelector = this.grph_selectorGraphics.drawRect(
                this.selectedText.x, this.selectedText.y,
                this.selectedText.width, this.selectedText.height
            )
        }

        if (this.hoveredText) {
            this.grph_selectorGraphics.lineStyle(1, 0x444444);
            this.rect_softSelector = this.grph_selectorGraphics.drawRect(
                this.hoveredText.x, this.hoveredText.y,
                this.hoveredText.width, this.hoveredText.height
            )
        }

    }


    // TEXT STYLE

    // Called from the Text Style Selector
    handleStyleSelection(textStyle) {
        // Firstly, update the selected text's style if we have one
        if (this.selectedText != null) {
            this.selectedText.style['fill'] = textStyle.fill
            this.selectedText.style['stroke'] = textStyle.stroke
            this.selectedText.style['strokeThickness'] = textStyle.strokeThickness
            this.selectedText.style['fontSize'] = textStyle.fontSize
            this.selectedText.style['fontFamily'] = textStyle.fontFamily
            console.log(this.selectedText.style);
            
            // We calibrate because thickness could have changed
            this.calibrateSelectorGraphics();
        }

        console.log('Ok')

        // Secondly, update the HTML to match
        $("#textColor").val(PIXI.utils.hex2string(textStyle.fill));
        $("#textSize").val(textStyle.fontSize);
        $("#textStroke").val(PIXI.utils.hex2string(textStyle.stroke));
        $("#textStrokeThickness").val(textStyle.strokeThickness);
        $("#text_font-family").val(textStyle.fontFamily);
        //$("#fontSize").val(textStyle.fontSize);


    }

    // 
    detectSelectedTextStyle(textStyle) {
        textStyleSelectorApp.selectButtonFromStyle(textStyle);
    }


}