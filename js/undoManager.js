/* Holds all functionality for undoing */

class UndoManager {
    constructor() {


        // Events are not actually popped from the undostack
        this.eventStack = []; // String with event names.
        this.eventPointer = 0;

        // We add to this stack when we do ANYTHING
        // Events: hexPainted

    }

    reset() {
        this.eventStack = [];
        this.eventPointer = 0;
    }

    pushEvent(event, undo, redo) {
        if (this.eventPointer != this.eventStack.length) {
            
            this.eventStack.splice(this.eventPointer);
        }

        this.eventStack.push({ name: event, undoData: undo, redoData: redo });
        this.eventPointer += 1;



    }

    processUndo() {
        if (this.eventPointer == 0) {
            return;
        }

        this.eventPointer -= 1;
        let event = this.eventStack[this.eventPointer];
        
        switch(event.name) {
            case "hexes_painted":
                this.undoHexesPainted(event.undoData);
                break;

            case "icon_placed":
                this.undoIconPlaced(event.undoData);
                break;
        }


    }

    processRedo() {
        if (this.eventPointer == this.eventStack.length) {
            return;
        }

        let event = this.eventStack[this.eventPointer];
        this.eventPointer += 1;

        switch(event.name) {
            case "hexes_painted":
                this.undoHexesPainted(event.redoData);
                break;

            case "icon_placed":
                this.redoIconPlaced(event.redoData);
                break;
        }
        
    }

    // HEX METHODS
    undoHexesPainted(hexData) {
        primaryHexfield.handleUndo(hexData);
    }

    // ICON METHODS
    undoIconPlaced(id) {
        primaryIconLayer.deleteIconViaUndo(id);
    }

    redoIconPlaced(iconData) {
        primaryIconLayer.placeViaRedo(iconData);
    }


}