class IconLayer {
    constructor() {

        this.icons = [];

        this.cont_iconSprites = new PIXI.Container();

    }



    // DATA
    get container() {
        return this.cont_iconSprites;
    }

    getSaveData() {
        return this.icons.map(icon => { return {iconId: icon.spriteId, x: icon.sprite.position.x, y: icon.sprite.position.y} });
    }

    loadSaveData(iconData) {
        iconData.forEach(icon => {

            let iconSetId = icon.iconId.split("_")[0];
            console.log( loadedIconsets );
            let iconColor = loadedIconsets[iconSetId].find(i => i.id == icon.iconId).color;
            let texture = primaryLoader.resources[icon.iconId].texture;

            // A bit hacky, we just make a new icon (with null texture (?)) and change a bunch of stuff to match the save data
            // But it means we can re-use the adding icon code - only one place to edit!
            // In theory...
            this.addIcon();

            let latestIcon = this.icons[this.icons.length-1];
            latestIcon.sprite.tint = iconColor;
            latestIcon.sprite.texture = texture;
            latestIcon.sprite.position.set(icon.x, icon.y);
            
        });
    }

    eraseAll() {
        this.icons.forEach(icon => {
            this.cont_iconSprites.removeChild(icon.sprite);
        });

        this.icons = [];
    }



    // ICONS
    addIcon() {

        let iconX, iconY;

        if ( $("#cb_iconSnap").is(":checked") ) {
            let h = worldToAxial( primaryToolData.worldX, primaryToolData.worldY, primaryHexfield.orientation, primaryHexfield.hexWidth, primaryHexfield.hexHeight );
        
            let hexCoords = axialToWorld(h.q, h.r, h.s, primaryHexfield.orientation, primaryHexfield.hexWidth, primaryHexfield.hexHeight);

            iconX = hexCoords.x;
            iconY = hexCoords.y;

        } else {
            iconX = primaryToolData.worldX;
            iconY = primaryToolData.worldY;

        }


        let newIcon = { spriteId: primaryToolData.icon.iconId, sprite: new PIXI.Sprite( primaryToolData.icon.tex_icon ) }
        newIcon.sprite.position.set(iconX, iconY);
        newIcon.sprite.tint = primaryToolData.icon.color;
        newIcon.sprite.anchor.set(0.5);

        newIcon.sprite.interactive = true;

        let iconScale; 
        
        if (primaryHexfield.hexWidth < primaryHexfield.hexHeight) {
            iconScale = (primaryHexfield.hexWidth * 0.8) / primaryToolData.icon.tex_icon.width;
        } else {
            iconScale = (primaryHexfield.hexHeight * 0.8) / primaryToolData.icon.tex_icon.height;
        }

        newIcon.sprite.scale.set(iconScale);
        
        //newIcon.sprite.hitArea = new PIXI.Polygon(path);
        
        newIcon.sprite.on("pointerdown", (e) => { this.pointerdownOnIcon(e, newIcon)} );

        newIcon.sprite.on("pointerover", (e) => { this.pointermoveOnIcon(e, newIcon) });
          

        this.cont_iconSprites.addChild(newIcon.sprite);

        this.icons.push( newIcon );
    }

    pointermoveOnIcon(e, icon) {
        
        if (primaryToolData.mouseDown) {
            this.pointerdownOnIcon({data: {button: 0}}, icon);
        }

    }

    pointerdownOnIcon(e, icon) {

        if (e.data.button == 0 && primaryToolData.selectedTool == "eraser") {
            // Erase Icon!
            //console.log(icon);

            this.deleteIcon(icon);
        }

    }

    deleteIcon(iconObj) {

        let iconIndex = this.icons.indexOf(iconObj);
        
        this.cont_iconSprites.removeChild(iconObj.sprite);
        iconObj.sprite.destroy();
        
        this.icons.splice(iconIndex, iconIndex);

    } 

}