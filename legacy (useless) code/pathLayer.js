class PathLayer {
    constructor(interactorWidth, interactorHeight) {
        
        this.paths = [];
        this.selectedPath = null;
        this.cont_pathContainer = new PIXI.Container();

    }

    getSaveData() {
        return this.paths.map(t => t.getSaveData());
    }

    loadPaths(paths) {
        paths.forEach(pathData => {
            // Add points
            let newPath = new Path(0, 0);
            newPath.points = JSON.parse(JSON.stringify(pathData.points));

            //console.log(newPath.points);

            // Change style
            newPath.stroke = pathData.stroke
            newPath.strokeThickness = pathData.strokeThickness

            this.cont_pathContainer.addChild(newPath.grph_drawer);
            newPath.redraw();
            this.paths.push(newPath);
        });
    }

    get hoveredPath() {
        return this.paths.find(path => path.hovered);
    }

    newPath() {
        let newPath = new Path(primaryToolData.worldX, primaryToolData.worldY);
        this.cont_pathContainer.addChild(newPath.grph_drawer);
        this.paths.push(newPath);
        newPath.select();
        this.setSelectedPath(newPath);
    }

    destroy() {
        this.paths.forEach(pathObject => {
            pathObject.destroy();
        });
        
        destroyPixiChildren(this.cont_pathContainer);
    }

    getContainer() {
        return this.cont_pathContainer;
    }


    // EVENTS

    mouseDown(e) {
        if (e.button == 0) {
            
            let hoveredPath = this.paths.find(p => p.hovered);
            console.log(hoveredPath);
            // CASE: No path is selected and no path being clicked on
            // Note: in the case of a path being clicked on, the path handles itself
            if (this.selectedPath == null && hoveredPath == undefined) {
                // Make new Path
                this.newPath();

            }

            // CASE: A path is hovered, but not selected
            //   OR: A path is selected and no path is being clicked on e.g. a new point should be appended to a path
            else if (this.selectedPath != null) {
                this.selectedPath.addPoint(primaryToolData.worldX, primaryToolData.worldY);
                
            }
            


        }
    }


    // INTERACTION CONTROL

    enableInteraction() {
        this.enableAllPathInteraction();
    }

    disableInteraction() {
        this.disableAllPathInteraction();
    }

    disablePathInteractionExcept(thisPath) {
        this.paths.forEach(p => {
            if (p != thisPath) {
                p.disableInteraction();
            }
        });
    }

    disableAllPathInteraction() {
        this.paths.forEach(p => {
            p.disableInteraction();
        });
    }

    enableAllPathInteraction() {
        this.paths.forEach(p => {
            p.enableInteraction();
        });
    }    



    // PATH SELECTION
    
    setSelectedPath(newPath) {
        if (this.selectedPath != null) {
            this.selectedPath.deselect();
        }

        this.selectedPath = newPath;
        this.disablePathInteractionExcept(this.selectedPath);
        this.givePathStyleToHTML();

        console.log("Show!");
        this.css_showSpecificPathControls();
        this.css_updateShownControls();
    }
    
    deselectPath() {
        if (this.selectedPath != null) {
            this.selectedPath.deselect();
        }
        
        this.selectedPath = null;
        
        this.enableAllPathInteraction();

        //console.log("Hide!")
        this.css_hideSpecificPathControls();
        this.css_updateShownControls();
    }



    // HTML

    css_showSpecificPathControls() {
        $("#path-selected-only-controls").removeClass("hidden");
    }

    css_hideSpecificPathControls() {
        $("#path-selected-only-controls").addClass("hidden");

    }

    givePathStyleToHTML() {
        $("#pathStroke").val(PIXI.utils.hex2string(this.selectedPath.stroke));
        $("#pathStrokeThickness").val(this.selectedPath.strokeThickness);
    }


    css_updateShownControls() {

        if (this.selectedPath) {
            updateShownControls("path-selected");
        
        } else if (this.hoveredPath) {
            updateShownControls("path-only-hovered");
            
        } else {
            updateShownControls("path-none-selected");
        }
    }


    // PATH MANIPULATION

    deleteSelectedPath() {
        if (this.selectedPath) {
            this.paths.splice(this.paths.indexOf(this.selectedPath));
            this.selectedPath.destroy();
            this.cont_pathContainer.removeChild(this.selectedPath.grph_drawer);
            delete this.selectedPath;
            this.deselectPath();

        }
    }

    deleteLastPointOnSelectedPath() {
        if (this.selectedPath) {
            if (this.selectedPath.numberOfPoints() > 1) {
                this.selectedPath.removeLastPoint();
            } else {
                this.deleteSelectedPath();
                this.enableAllPathInteraction();
            }
        }
    }

    changeSelectedPathStyle(styleName, newStyle) {
        if (this.selectedPath) {
            if (styleName == "stroke") {
                this.selectedPath.stroke = newStyle;
                console.log(this.selectedPath.stroke);
            } else if (styleName == "strokeThickness") {
                this.selectedPath.strokeThickness = newStyle;
            }
            
            this.selectedPath.redraw();
        }

    }
}