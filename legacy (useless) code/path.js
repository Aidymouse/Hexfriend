class Path {
    constructor(p1X, p1Y) {
        
        this.points = [p1X, p1Y];
        this.selected = false;
        this.hovered = false;

        this.stroke = PIXI.utils.string2hex($('#pathStroke').val());
        this.strokeThickness = 5;
        
        this.grph_drawer = new PIXI.Graphics();
        this.grph_drawer.interactive = true;

        this.grph_drawer.on("click", () => {
            //console.log("Clicked me!! :)")
            this.select();
            primaryPathLayer.setSelectedPath(this);
        });

        this.grph_drawer.on("pointerover", () => {
            this.hovered = true;
            this.redraw();
        });
        
        this.grph_drawer.on("pointerout", () => {
            this.hovered = false;
            this.redraw();
        });
    }

    getSaveData() {
        return {
            points: this.points,
            stroke: this.stroke,
            strokeThickness: this.strokeThickness
        }
    }

    addPoint(x, y) {
        this.points.push(x);
        this.points.push(y);
        
        this.redraw();
    }

    removeLastPoint() {
        this.points.pop();
        this.points.pop();

        this.redraw();
    }

    numberOfPoints() {
        return this.points.length/2;
    }

    updateSoftSelectorPoints() {
        this.grph_drawer.lineStyle(1, 0xff0000, 1);
        this.grph_drawer.beginFill(0xffffff);
        for (let pIndex = 0; pIndex < this.points.length; pIndex += 2) {
            this.grph_drawer.drawCircle(this.points[pIndex], this.points[pIndex + 1], 2);
        }

    }

    updateHardSelectorPoints() {
        this.grph_drawer.lineStyle(2, 0x000000, 1);
        this.grph_drawer.beginFill(0xffffff);
        for (let pIndex = 0; pIndex < this.points.length; pIndex += 2) {
            this.grph_drawer.drawCircle(this.points[pIndex], this.points[pIndex + 1], 4);
        }
        
        this.grph_drawer.beginFill(0xff0000);
        this.grph_drawer.drawCircle(this.points[this.points.length - 2], this.points[this.points.length - 1], 4)
    }

    redraw() {
        this.grph_drawer.clear();
        this.grph_drawer.lineStyle(this.strokeThickness, this.stroke, 1);
        this.grph_drawer.moveTo(this.points[0], this.points[1]);

        for (let pIndex = 0; pIndex < this.points.length; pIndex += 2) {
            this.grph_drawer.lineTo(this.points[pIndex], this.points[pIndex + 1]);
        }

        if (this.hovered) {
            this.updateSoftSelectorPoints();
        }

        if (this.selected) {
            this.updateHardSelectorPoints();
        }

        this.updateHitArea();

    }

    destroy() {
        this.grph_drawer.destroy();
        delete this;
    }

    // Selection Methods
    select() {
        this.selected = true;
        this.grph_drawer.interactive = false;
        this.redraw();
    }
    
    deselect() {
        this.selected = false;
        this.grph_drawer.interactive = true;
        this.redraw();
    }

    enableInteraction() {
        this.grph_drawer.interactive = true;
    }
    
    disableInteraction() {
        this.hovered = false;
        this.redraw();
        this.grph_drawer.interactive = false;
    }

    updateHitArea() { // needs to be better
        let lb = this.grph_drawer.getLocalBounds();

        //this.grph_drawer.hitArea.destroy();
        this.grph_drawer.hitArea = new PIXI.Rectangle(lb.x, lb.y, lb.width, lb.height);
    }
}