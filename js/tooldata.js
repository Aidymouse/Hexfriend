class ToolData {
    constructor() {
        this.selectedTool = "terrain"; // terrain, icon, path, text
        this.mouseDown = false;

        this.mouseX; // screen X
        this.mouseY; // screen Y

        this.rightMouseDown = false;

        this.shiftHeld = false;
        this.controlHeld = false;

        this.pan = {
            oldX: -1, // in screen space
            oldY: -1,  // in screen space
            xOffset: 0, // in world space!
            yOffset: 0 // in world space!
        }

        this.zoom = {
            scale: 1
        }

        this.terrain = {
            backgroundColor: 0xaaee44,
            tex_symbol: null,
            tileId: "",
            symbolColor: 0x44aa44,
            usingEditedTile: false,

            grph_preview: new PIXI.Graphics(),
            spr_preview: new PIXI.Sprite(),
            cont_preview: new PIXI.Container(),
        }

        this.terrain.spr_preview.anchor.set(0.5);
        this.terrain.cont_preview.addChild(this.terrain.grph_preview);
        this.terrain.cont_preview.addChild(this.terrain.spr_preview);

        this.icon = {
            tex_icon: null,
            color: 0x000000,
            iconId: "",
            //textureName: "", // Needed??

            eraserEnabled: false,
            snapToHex: $("#cb_iconSnap").is(":checked"),
            usingEditedIcon: false,
            spr_previewSprite: new PIXI.Sprite()
        }

        this.text = {
            dragging: false,
            oldX: -1, // in world space
            oldY: -1 // in world space
        }

        this.path = {
            color: 0x000000
        }
    }

    get worldX() {
        //console.log(this.mouseX, this.mouseY)
        return (this.mouseX - this.pan.xOffset) / this.zoom.scale;
    }

    get worldY() {
        return (this.mouseY - this.pan.yOffset) / this.zoom.scale;
    }

    changeTerrain(tileId) {
        let tilesetName = "default"; // Later we can find this by seperating the underscore
        let terrainTileData = loadedTilesets[tilesetName].find(element => element.id == tileId);

        this.terrain.tileId = tileId;

        this.terrain.backgroundColor = terrainTileData.bgColor;
        
        if (terrainTileData.symbol) {
            this.terrain.tex_symbol = primaryLoader.resources[terrainTileData.id].texture;
            //this.terrain.symbolTexName = terrainTileData.id;
            this.terrain.symbolColor = terrainTileData.symbol.color;
            //console.log("Okay");
        } else {
            this.terrain.tex_symbol = null;
            this.terrain.symbolTexName = "";
            this.terrain.symbolColor = 0x000000;
        }

        this.terrain.usingEditedTile = false;

        this.terrain.spr_preview.texture = this.terrain.tex_symbol;
        this.terrain.spr_preview.tint = this.terrain.symbolColor;
        this.terrain.spr_preview.visible = this.terrain.tex_symbol ? true : false;

        this.css_giveTerrainDataToPreivew();

    }

    changeIcon(iconId) {
        let iconsetName = "default";
        let iconData = loadedIconsets[iconsetName].find(element => element.id == iconId);
        
        this.icon.iconId = iconId;
        
        this.icon.tex_icon = primaryLoader.resources[iconData.id].texture;
        this.icon.color = iconData.color;
        this.icon.usingEditedIcon = false;

        this.icon.spr_previewSprite.texture = this.icon.tex_icon;
        this.icon.spr_previewSprite.tint = this.icon.color;

        this.css_giveIconDataToPreview();
    }

    // TERRAIN PREVIEW EDITS
    terrainPreview_changeBgColor() {
        this.terrain.backgroundColor = PIXI.utils.string2hex( $("#terrain-preview-bgColor").val() );
        this.terrain.usingEditedTile = true;

        this.terrainPreview_updatePreviewImage();
        updateColorWrappers();
    }
    
    terrainPreview_changeSymbolColor() {
        this.terrain.symbolColor = PIXI.utils.string2hex( $("#terrain-preview-symbolColor").val() );
        this.terrain.usingEditedTile = true;

        this.terrainPreview_updatePreviewImage();
        updateColorWrappers();

    }

    terrainPreview_drawPreviewHex() {

        this.terrain.grph_preview.clear();
        this.terrain.grph_preview.beginFill(this.terrain.backgroundColor);
        this.terrain.grph_preview.drawPolygon(generateHexPath(primaryHexfield.hexWidth, primaryHexfield.hexHeight, primaryHexfield.orientation, 0, 0));
        this.terrain.grph_preview.endFill();

        if (this.terrain.tex_symbol) {
            let newScale;
            if (primaryHexfield.hexWidth < primaryHexfield.hexHeight) {
                newScale = (primaryHexfield.hexWidth * 0.8) / this.terrain.tex_symbol.width;
            } else {
                newScale = (primaryHexfield.hexHeight * 0.8) / this.terrain.tex_symbol.height;
            }
            this.terrain.spr_preview.scale.set(newScale);

            //hex.spr_symbol.visible = true;
        }

        
    }

    terrainPreview_updatePreviewImage() {
        this.terrainPreview_drawPreviewHex();

        this.terrain.spr_preview.tint = this.terrain.symbolColor;

        let previewImage = primaryPixiApp.renderer.plugins.extract.base64(this.terrain.cont_preview, "image/png");
        $("#current-terrain-preview").attr("src", previewImage);
    }

    css_giveTerrainDataToPreivew() { 
        $("#terrain-preview-bgColor").val( PIXI.utils.hex2string( this.terrain.backgroundColor ) );


        if (this.terrain.symbolColor == "") {
            $("#terrain-preview-symbol-container").addClass("hidden");
            
        } else {
            
            $("#terrain-preview-symbolColor").val( PIXI.utils.hex2string( this.terrain.symbolColor ) );
            $("#terrain-preview-symbol-container").removeClass("hidden");
        }


        this.terrainPreview_updatePreviewImage();

        updateColorWrappers();

    }


    // ICON PREVIEW EDITS
    iconPreview_changeColor() {
        this.icon.color = PIXI.utils.string2hex( $("#icon-preview-color").val() );
        this.icon.usingEditedIcon = true;

        this.icon.spr_previewSprite.tint = this.icon.color;

        
        this.iconPreview_updatePreviewImage();
        updateColorWrappers();
    }
    
    iconPreview_updatePreviewImage() {
        let previewImage = primaryPixiApp.renderer.plugins.extract.base64(this.icon.spr_previewSprite, "image/png");
        $("#current-icon-preview").attr("src", previewImage);
    }

    css_giveIconDataToPreview() {
        $("#icon-preview-color").val( PIXI.utils.hex2string(this.icon.color) );
        
        this.iconPreview_updatePreviewImage();
        updateColorWrappers();
    }
}