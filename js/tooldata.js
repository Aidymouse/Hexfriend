class ToolData {
    constructor() {
        this.selectedTool = "terrain"; // terrain, icon, path, text
        this.mouseDown = false;

        this.mouseX; // screen X
        this.mouseY; // screen Y

        this.rightMouseDown = false;

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
        }

        this.icon = {
            tex_icon: null,
            color: 0x000000,
            iconId: "",
            //textureName: "", // Needed??

            eraserEnabled: false,
            snapToHex: $("#cb_iconSnap").is(":checked")
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
        }

    }

    changeIcon(iconId) {
        let iconsetName = "default";
        let iconData = loadedIconsets[iconsetName].find(element => element.id == iconId);

        this.icon.iconId = iconId;

        this.icon.tex_icon = primaryLoader.resources[iconData.id].texture;
        this.icon.color = iconData.color;
    }

}