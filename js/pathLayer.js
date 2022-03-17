class Path {
    constructor(pX, pY) {
        this.points = [pX, pY]

        this.style = {
            stroke: 0x000000,
            strokeThickness: 2
        }

        this.grph_path = new PIXI.Graphics();

        this.grph_path.interactive = true;
        this.grph_path.hitArea = this.generateHitAreaPath();

        // EVENTS

        this.grph_path.on("pointerover", () => {
            this.hovered = true;
            //print("Hover!!");
        });

        this.grph_path.on("pointerout", () => {
            this.hovered = false;
        })

    }

    getSaveData() {
        return {
            points: this.points,
            style: this.style
        }
    }

    loadPath(pathData) {
        this.points = pathData.points;
        this.style = pathData.style;
    }

    destroy() {
        this.grph_path.destroy();
    }

    get numberOfPoints() {
        return this.points.length/2
    }

    addPoint(x, y) {
        this.points.push(x)
        this.points.push(y)
    
        
    }

    removeLastPoint() {
        this.points.pop()
        this.points.pop()
    }

    drawSelf() {
        this.grph_path.clear();

        this.grph_path.lineStyle(this.style.strokeThickness, this.style.stroke);

        this.grph_path.moveTo(this.points[0], this.points[1])

        for (let p=1; p<this.numberOfPoints; p++) {
            let xIndex = p*2
            let yIndex = p*2+1

            this.grph_path.lineTo(this.points[xIndex], this.points[yIndex]);
        }

        this.grph_path.hitArea = this.generateHitAreaPath();

    }

    generateHitAreaPath() {
        // For each pair of points, generate a rectangle thats wider than the line they make
        // Combine all those rectangles into a single polygon
            // Bonus: add circles at all the points to make it smooth
        // Set that polygon as the hit area

        // Bonus: Make it more efficient by adding / subtracting from the path rather than generating the whole thing
    
    
        // but... for now...
        let lb = this.grph_path.getLocalBounds();

        //this.grph_drawer.hitArea.destroy();
        return new PIXI.Rectangle(lb.x, lb.y, lb.width, lb.height);
    }
}


const HOVEREDSTROKE = 0x333333;
const HOVEREDSTROKETHICKNESS = 2;
const HOVEREDFILL = 0xdddddd;
const HOVEREDRADIUS = 3;

const SELECTEDSTROKE = 0x000000;
const SELECTEDSTROKETHICKNESS = 2;
const SELECTEDFILL = 0xffffff;
const SELECTEDRADIUS = 3;

class PathLayer {
    constructor() {
        this.cont_pathLayer = new PIXI.Container();
        this.cont_paths = new PIXI.Container();

        this.paths = [];

        this.grph_selectors = new PIXI.Graphics();
        this.selectedPath = null;
        //this.hoveredPath is a getter

        this.cont_pathLayer.addChild(this.cont_paths);
        this.cont_pathLayer.addChild(this.grph_selectors);

    }

    // DATA

    destroy() {
        this.paths.forEach(p => {
            p.destroy();
        })

        this.grph_selectors.destroy();
        this.cont_pathLayer.destroy();
    }

    eraseAll() {
        this.paths.forEach(p => {
            p.destroy();
        })

        this.paths = [];
        this.setSelectedPath(null);
        this.calibrateSelectorGraphics();
    }

    loadSaveData(pathData) {
        pathData.forEach(pathData => {
            let newPath = new Path(0, 0);
            newPath.points = [...pathData.points];
            newPath.style = {...pathData.style};
            
            this.paths.push(newPath);
            this.cont_paths.addChild(newPath.grph_path);
            newPath.drawSelf();
        })
    }

    getSaveData() {
        return this.paths.map(p => {
            return {points: p.points, style: p.style}
        })
    }

    get container() {
        return this.cont_pathLayer;
    }

    get hoveredPath() {
        return this.paths.find(p => p.hovered);
    }

    // PATH SELECTION

    setSelectedPath(p) {
        this.selectedPath = p;
    }

    deselectPath() {
        if (this.selectedPath) {
            if (this.selectedPath.numberOfPoints == 1) this.deletePath(this.selectedPath);
        }

        this.setSelectedPath(null);
        this.calibrateSelectorGraphics();
        this.css_hideSelectedPathControls();
        
    }

    mouseDown(e) {
        // CASE: Selected path -> add new point
        if (this.selectedPath) {
            this.selectedPath.addPoint(primaryToolData.worldX, primaryToolData.worldY);
            this.selectedPath.drawSelf();
            this.calibrateSelectorGraphics();

        // CASE: Clicking on hovered path -> select it
        } else if (this.hoveredPath && !primaryToolData.shiftHeld ) {


            this.setSelectedPath(this.hoveredPath);
            this.calibrateSelectorGraphics();

            this.giveSelectedPathStyleToHTML();
            this.css_showSelectedPathControls();

        // CASE: No selected or hovered path -> Add new one
        } else {
            let newPath = new Path(primaryToolData.worldX, primaryToolData.worldY);

            this.cont_paths.addChild(newPath.grph_path);
            this.paths.push(newPath);
            this.setSelectedPath(newPath);
            this.calibrateSelectorGraphics();
            
            this.updateSelectedPathStyleFromHTML();
            this.css_showSelectedPathControls();
        }


    }

    mouseMove(e) {
        this.calibrateSelectorGraphics();
    }
    
    shiftChange() { // Fires when shift is pressed
        this.calibrateSelectorGraphics();
    }

    disableInteraction() {
        this.paths.forEach(p => {
            p.grph_path.interactive = false;
        })
    }

    enableInteraction() {
        this.paths.forEach(p => {
            p.grph_path.interactive = true;
        })
    }

    // PATH MANIPULATION

    deletePath(path) {
        if (path == this.selectedPath) {
            this.setSelectedPath(null);
            this.calibrateSelectorGraphics();
            this.css_hideSelectedPathControls();
        }
        this.cont_paths.removeChild(path.grph_path);
        this.paths.splice(this.paths.indexOf(path));
        path.destroy();
    }

    removeLastSelectedPoint() {
        if (this.selectedPath) {
            if (this.selectedPath.numberOfPoints > 1) {
                this.selectedPath.removeLastPoint();
                this.selectedPath.drawSelf();
                this.calibrateSelectorGraphics();
            } else {

                // Because there's only one point, this will delete the path as well
                this.deselectPath();
            }
        }
    }

    updateSelectedPathStyleFromHTML() {
        if (this.selectedPath) {
            this.selectedPath.style.stroke = PIXI.utils.string2hex( $("#pathStroke").val() );
            this.selectedPath.style.strokeThickness = Number($("#pathStrokeThickness").val());
            this.selectedPath.drawSelf();
        }
    }

    // DRAWING

    calibrateSelectorGraphics() {
        this.grph_selectors.clear();

        if (primaryToolData.selectedTool != "path") {
            return;
        }

        if (this.selectedPath) {
            
            this.grph_selectors.lineStyle(SELECTEDSTROKETHICKNESS, SELECTEDSTROKE);
            this.grph_selectors.beginFill(SELECTEDFILL);
            
            for (let p=0; p<this.selectedPath.numberOfPoints; p++) {
                let x = this.selectedPath.points[p*2];
                let y = this.selectedPath.points[p*2+1];
                
                this.grph_selectors.drawCircle(x, y, SELECTEDRADIUS);
            }
            updateShownControls("path-selected");
            
        } else if (this.hoveredPath && !primaryToolData.shiftHeld ) {
            this.grph_selectors.lineStyle(HOVEREDSTROKETHICKNESS, HOVEREDSTROKE);
            this.grph_selectors.beginFill(HOVEREDFILL);

            for (let p = 0; p < this.hoveredPath.numberOfPoints; p++) {
                let x = this.hoveredPath.points[p * 2];
                let y = this.hoveredPath.points[p * 2 + 1];

                this.grph_selectors.drawCircle(x, y, HOVEREDRADIUS);
            }
            updateShownControls("path-only-hovered")
        } else {
            updateShownControls("path-none-selected");
        }
        
        
    }

    // HTML, CSS
    css_showSelectedPathControls() {
        $("#path-selected-only-controls").removeClass("hidden");
    }

    css_hideSelectedPathControls() {
        $("#path-selected-only-controls").addClass("hidden");
    }

    giveSelectedPathStyleToHTML() {
        $("#pathStroke").val( PIXI.utils.hex2string(this.selectedPath.style.stroke) );
        $("#pathStrokeThickness").val(this.selectedPath.style.strokeThickness);
    }
}