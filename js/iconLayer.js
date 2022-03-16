class Icon {
    constructor(saveData) {
        
        if (saveData) {
            
            primaryToolData.changeIcon(saveData.iconId);
            
        }
        
        this.iconId = primaryToolData.icon.iconId;
        
        this.spr_icon = new PIXI.Sprite( primaryToolData.icon.tex_icon );
        this.spr_icon.tint = primaryToolData.icon.color;
        
        if (primaryHexfield.hexWidth < primaryHexfield.hexHeight) {
            this.spr_icon.scale.set((primaryHexfield.hexWidth * 0.8) / primaryToolData.icon.tex_icon.width);
        } else {
            this.spr_icon.scale.set((primaryHexfield.hexHeight * 0.8) / primaryToolData.icon.tex_icon.height);
        }
        
        this.spr_icon.anchor.set(0.5);
        
        // Set sprites position
        
        if (saveData) {
            this.spr_icon.position.set(saveData.x, saveData.y);
            
        } else if (primaryToolData.icon.snapToHex) {
            let hoveredHex = primaryHexfield.hoveredHex; 
            this.spr_icon.position.set(hoveredHex.x, hoveredHex.y);

        } else {
            this.spr_icon.position.set(primaryToolData.worldX, primaryToolData.worldY);
        
        }

        this.spr_icon.interactive = true;

        // Event Handlers
        this.spr_icon.on("pointerdown", () => {
            if (primaryToolData.selectedTool == "eraser") {
                primaryIconLayer.deleteIcon(this)

                // Check for hexagon too. Pretty fucking hacky...
                primaryHexfield.eraseHex( primaryHexfield.coords_worldToAxial(primaryToolData.worldX, primaryToolData.worldY) )
            }
        });

        this.spr_icon.on("pointerover", () => {
            if (primaryToolData.selectedTool == "eraser" && primaryToolData.mouseDown) {
                primaryIconLayer.deleteIcon(this)
            }
        });

    
    }

    get icon() {
        return this.spr_icon;
    }


    getSaveData() {
        return {
            iconId: this.iconId,
            x: this.spr_icon.x,
            y: this.spr_icon.y
        }
    }

}


class IconLayer {
    constructor() {
        this.cont_icons = new PIXI.Container();

        this.icons = [];

    }

    get container() {
        return this.cont_icons;
    }

    eraseAll() {
        this.icons.forEach(icon => {
            this.deleteIcon(icon);
        })
    }

    addIcon(saveData) {

        if (saveData || !(primaryToolData.icon.snapToHex && primaryHexfield.hoveredHex == undefined) ) {
            let newIcon = new Icon(saveData);        
    
            this.icons.push(newIcon);
            this.cont_icons.addChild(newIcon.icon);
        }

    }

    deleteIcon(icon) {
        this.cont_icons.removeChild(icon.icon);
        this.icons[this.icons.indexOf(icon)] = null;
        icon.icon.destroy();

        console.log();
    }
    
    // DATA
    
    destroy() {
        this.cont_icons.destroy();

        //this.icons.forEach(i => delete i);
    }

    getSaveData() {
        return this.icons.map(icon => icon.getSaveData());
    }

    loadSaveData(iconData) {
        iconData.forEach(iconSave => {
            this.addIcon(iconSave);
        });
    }

    // CHANGES

    handleResize(newHexWidth, newHexHeight) {
        // Compare to old width and height
        let oldWidth = primaryHexfield.hexWidth;
        let oldHeight = primaryHexfield.hexHeight;

        let widthChange = newHexWidth / oldWidth;
        let heightChange = newHexHeight / oldHeight;

        this.icons.forEach(icon => {
            icon.icon.position.set(icon.icon.position.x * widthChange, icon.icon.position.y * heightChange)

            if (primaryHexfield.hexWidth < primaryHexfield.hexHeight) {
                icon.icon.scale.set((primaryHexfield.hexWidth * 0.8) / icon.icon.texture.width);
            } else {
                icon.icon.scale.set((primaryHexfield.hexHeight * 0.8) / icon.icon.texture.height);
            }
        })
    }
}