
// Planned Feature List //
// TEXT:
// Selecting Multiple Text
// Rotate Text
// Button to switch text stroke and fill
// Saving custom styles (and saving and loading them)

// PATH:
// More accurate path selecting

// MAPS:
// Make the delete map button look pretty

// MISC:
// Turning off hex grid
// Hexgrid layout types - rectangular, hex, etc
// Change hex by width/height OR radius
// Generate terrain
// Dynamically load tilesets and icon sets
// Keybaord shortcuts
// Highlight which hex is being hovered
// Add importing
// Rotate hex selectors to match hex field

// TODO // ranked //
// Font Selection - more fonts
// Path Styles
// Add individual erasers for terrain and icons
// Custom icon width and height
// Save As
// Save button in the settings
// Exporting to PNG
// Add confirmation to map deletion
// Trash can icon on map delete button
// Undoing
// Fix the memory leak :/ - got some progress
// Recalculate icon width and height when changing orientation of hexes.
// Dynamically load tile and icon sets and text styles (line 103)
// Fix placing multiple icons on the same tile
// Fix the fucky gridlessness

let primaryPixiApp;
let primaryRenderer;

let primaryHexfield;
let primaryIconLayer;
let primaryTextLayer;

let loadedTilesets = [];
let loadedIconsets = [];

let primaryToolData;

let terrainSelectorApp;
let iconSelectorApp;
let textStyleSelectorApp;

let primaryLoader;

let loadedMap = {};
let loadedMapId = -1;




// Hardcoded default tilesets - might put these in a different file
// Tilesets should really be loaded into the database huh...
const defaultTileset = [
    { display: "Plains", id: "default_plains", bgColor: 0xaaee44, symbol: null },
    { display: "Tree", id: "default_tree", bgColor: 0xaaee44, symbol: { color: 0x44aa44, base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKVSURBVHhe7Z2LUsIwEEXBz9Lv199CV8kMlIKkZXfPJvfMdEBmSkpObl5WOZ5Op4Pg8HZ+FBAkBIaEwJAQGBICQ0JgSAiMzHXI3oKP58ehiE7I+89hIl7RCl71PigiE+JZ0DIta2WVSFRUQrytX77/vbLs9XZgGWlQ76lorJwIIZEfektZdo6NbQgixhBcK3xA+jijdcg16Y1HQm5JlSIh66RJiRAy5Irai6iEVJSSkpLILsuktOPDXhC3ZGwups9kOghPdvSgjlmAUYkSYqmw4/P3pzqENyCt1P8ntNvyTkh1GUZLd8hn8RQygowl7mK8hIwoI4ToWdYouDU4DyGzpMPlcyohMCQEhoTAkBAYHkLCN+RGwishkrIRzy7LpEhMJxFjSBMjOU8QNajbIkrbKU8QIUQiOvAWIhmdRHVZI+IyJnoKUTo2oIRsw23G6Pk79eoJSZmmKyEwPIVoIbgB74RISicRXZZJseMV9/P2Ct7aINIaUsa9vUZvoZcV1HOunbenrHCyhCy5dxFrldMrxHjmnFQRDYqQHrYIKYOmvTAkBIaEwJAQGBICo5qQclPCXpQQGBICo5KQ4bsrQwmBISEwJASGhMCoImSKAd1QQmBICAwJgVFByJ7xo9zYo4TAoAuZZnbVUEJgzCCkVMrIQqbrroxZuqwycqlCPCqwxH9Epd656HVR+DsZiQnxbCH4rosmJKLC0FJIQiIryspCiplllnUPnBSKkMyKQUkhCCFUiF0DQszsXdaSdDHZQhCtcoU0MUrIY8KlSMgttpq/PEIhbJ1kXwBqO4WQkNYSI74ozMpo5bUDBXVz0XZm93w9klX819/TWlT8O/Wh0aAOQ0JgSAgMCYEhITAkBIaEwJAQFIfDN2Shgz9c4BjXAAAAAElFTkSuQmCC" } },
    { display: "Desert", id: "default_desert", bgColor: 0xffee44, symbol: null },
    { display: "Fire Tree", id: "default_firetree", bgColor: 0xffee44, symbol: { color: 0xcc7744, base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKVSURBVHhe7Z2LUsIwEEXBz9Lv199CV8kMlIKkZXfPJvfMdEBmSkpObl5WOZ5Op4Pg8HZ+FBAkBIaEwJAQGBICQ0JgSAiMzHXI3oKP58ehiE7I+89hIl7RCl71PigiE+JZ0DIta2WVSFRUQrytX77/vbLs9XZgGWlQ76lorJwIIZEfektZdo6NbQgixhBcK3xA+jijdcg16Y1HQm5JlSIh66RJiRAy5Irai6iEVJSSkpLILsuktOPDXhC3ZGwups9kOghPdvSgjlmAUYkSYqmw4/P3pzqENyCt1P8ntNvyTkh1GUZLd8hn8RQygowl7mK8hIwoI4ToWdYouDU4DyGzpMPlcyohMCQEhoTAkBAYHkLCN+RGwishkrIRzy7LpEhMJxFjSBMjOU8QNajbIkrbKU8QIUQiOvAWIhmdRHVZI+IyJnoKUTo2oIRsw23G6Pk79eoJSZmmKyEwPIVoIbgB74RISicRXZZJseMV9/P2Ct7aINIaUsa9vUZvoZcV1HOunbenrHCyhCy5dxFrldMrxHjmnFQRDYqQHrYIKYOmvTAkBIaEwJAQGBICo5qQclPCXpQQGBICo5KQ4bsrQwmBISEwJASGhMCoImSKAd1QQmBICAwJgVFByJ7xo9zYo4TAoAuZZnbVUEJgzCCkVMrIQqbrroxZuqwycqlCPCqwxH9Epd656HVR+DsZiQnxbCH4rosmJKLC0FJIQiIryspCiplllnUPnBSKkMyKQUkhCCFUiF0DQszsXdaSdDHZQhCtcoU0MUrIY8KlSMgttpq/PEIhbJ1kXwBqO4WQkNYSI74ozMpo5bUDBXVz0XZm93w9klX819/TWlT8O/Wh0aAOQ0JgSAgMCYEhITAkBIaEwJAQFIfDN2Shgz9c4BjXAAAAAElFTkSuQmCC" } },
    { display: "Water", id: "default_water", bgColor: 0xabcde1, symbol: null },
    { display: "Deep Water", id: "default_deepwater", bgColor: 0x17458a, symbol: null },
]

// Hardcoded default icon set
const defaultIconSet = [
    { display: "House", id: "default_house", color: 0x000000, base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMOSURBVHhe7ZpdbtQwFIUTQEVF8ECXUzbDDlhHt9InNsFaWAJCQppeo7GUTmfyY1/b59jnk65S5aWJP5/reJL5dDpNAod356MAQULA6ElI6L30/bcXIUsRj+cjJT0s6tduYD4f6WBOSBct6hJWIVsiaNsWY8vae8GUbYstIUdmD2VKmBKScqF0KWFJSOqsoZltkV72Id3AICR3llOlBF0IXcvJZZSWRSMWWchw6QiMtKhTCEYVUmrw4KUgChmyVUVGalkRaOFoQmoNFqwUJCG1BwlSCoqQVoMD94swgpCWM/WXFZSU1kIQ2gaUlJZCkHo4jJRWQhAXVAgpLd4YIsq4pNmbxtoJYZARaHadNYWwyIg0ud5aQthkRKpfd2khYZFklRGputCXXtTZZSypstCXTEhPMgJVklJKSG8yAlX2KSVaVo8ylhRtXd4Jab7TrUDRCecpJMgIsR6BYlK8hIwkoyhea0jv68Yt3NcTj4SMKiPgfu+lHntHwlVKrpCR07HEbRxyhEjGa1zGI1XICPuNJqQ+ZSkdt8l68kpJiNKxTtZkTUmI0rGPpKQcTYhk7CdprHIfe8U6h6UcEaJ0VGCvEMlI59DYqWWBsUeI0pHP7jHcEqI9R2W29iFKhy+be5O1hCgd/mxO8LWEKB3luJkUPWW14eZkl5B2XJVy5MdFtbAyvGpfqe9DrjG6sKz3IBHPluVyQaPjvYaMKsXtvrWogyEhYEgIGBIChoSAISFgSAgYEgKGhIAhIWBICBgSAoaEgCEhYEgIGBIChoSAISFgSAgY7ELCu+xY38KJBrh+R+D5GVCkxudAW4NQ85MkVyG9tqyWicmCMSFHZyTa9azClpCUm3cdsNLoKQsMJiE5M50mJUoIGBKSj+tDA4sQqoU5h5ESQiGVQchpnudpWT3DsDH8YxI+nf/Owu615CbRZaaUEHJJ7j/4bfXD6qfVP6s7qwerD1ZB1Eerz1ZfrULi703gsx3fICEOHG1Rdj9BUJD2/v+Jafpr9cXqyep7OOGIe/+EFxLwWjfw73WaXgA0M6p+MsbyoAAAAABJRU5ErkJggg==" },
    { display: "Red Pillar", id: "default_red_pillar", color: 0xff0000, base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJeSURBVHhe7ZxhToNAGERbj6UX6JF7Ab1WZc2SoGkJW8vyZnZe0hT+KM3zm1kocr7dbqfA4a2+BwgRAiNCYEQIjAiBoSKkLAWHWA6qTYi9lEQWjAiBoSjEOrYUhAx1bSeRBUNViO3UyAm5Xq91y5NEFgy6kIfRNE3Ke920gv4F1a+DW8bV5XIpb+efHSMSWTAiBIa0EMceke2QgmOPJLJgkIWsTocrmRAYDkLQJdiK+iqrbvmQyIJhIcTpfIR8HrJ5leV0PkKdEKuibiEdAsNJiMVUuZR63dKHKGTY/iikQ2C4CZGfLhshLj2SyIJhJ0T9Mgrt0snDg9kaSeqXURJZMCIEBknIK7NTdvnrWOp1S5NEFowIgUERskfmS/aI5YQo90giCwZBiOwSdQ/cJ0ROtq0Q1R45WojlP27+h6OFfNb3UHHvEDmOFNKrcKWK3XpCFIs9kQXjKCE5GXxAJgTGKEJkJtJeiFqxHyEk/bFCOgRGhMDoLeTpuKp3JP4HiagcYkKUij2RBSNCYPQUkuXuBkabEPwfxTBCVIo9HQKjl5DczLCRXkJecjPDC04O8YwYWehiH0qIQrH3EJL+aKCHkNwM18CIHYJmVCHYYt9bCO6D04s9kQUjQmCMLATZI3sKwRYnuUcSWTCGFEK+SLnnA8x2+cHPxs2KBNTDzuyF/BGBf9LcnpFVPvz86k4RUV6TwI9p97DjaOWoZy4+/UvXJmQ5DUXEtP9Vd2UgPASz6QDuCVGLpTVknko6sxTiJGKGJmSm5aAsRMxQhSy5d4BWEpYoCBmKXDqBESEoTqdvi9ml8cBIeugAAAAASUVORK5CYII=" },
    //{ display: "Green Pillar", id: "default_green_pillar", color: 0x00ff00, base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJeSURBVHhe7ZxhToNAGERbj6UX6JF7Ab1WZc2SoGkJW8vyZnZe0hT+KM3zm1kocr7dbqfA4a2+BwgRAiNCYEQIjAiBoSKkLAWHWA6qTYi9lEQWjAiBoSjEOrYUhAx1bSeRBUNViO3UyAm5Xq91y5NEFgy6kIfRNE3Ke920gv4F1a+DW8bV5XIpb+efHSMSWTAiBIa0EMceke2QgmOPJLJgkIWsTocrmRAYDkLQJdiK+iqrbvmQyIJhIcTpfIR8HrJ5leV0PkKdEKuibiEdAsNJiMVUuZR63dKHKGTY/iikQ2C4CZGfLhshLj2SyIJhJ0T9Mgrt0snDg9kaSeqXURJZMCIEBknIK7NTdvnrWOp1S5NEFowIgUERskfmS/aI5YQo90giCwZBiOwSdQ/cJ0ROtq0Q1R45WojlP27+h6OFfNb3UHHvEDmOFNKrcKWK3XpCFIs9kQXjKCE5GXxAJgTGKEJkJtJeiFqxHyEk/bFCOgRGhMDoLeTpuKp3JP4HiagcYkKUij2RBSNCYPQUkuXuBkabEPwfxTBCVIo9HQKjl5DczLCRXkJecjPDC04O8YwYWehiH0qIQrH3EJL+aKCHkNwM18CIHYJmVCHYYt9bCO6D04s9kQUjQmCMLATZI3sKwRYnuUcSWTCGFEK+SLnnA8x2+cHPxs2KBNTDzuyF/BGBf9LcnpFVPvz86k4RUV6TwI9p97DjaOWoZy4+/UvXJmQ5DUXEtP9Vd2UgPASz6QDuCVGLpTVknko6sxTiJGKGJmSm5aAsRMxQhSy5d4BWEpYoCBmKXDqBESEoTqdvi9ml8cBIeugAAAAASUVORK5CYII=" },
]

const defaultTextStyles = [
    //{ fontFamily: 'Comic Sans MS', fontSize: 36, fill: 0x000000, strokeThickness: 0, stroke: 0x000000, align: 'center' },
    //{ fontFamily: 'Arial', fontSize: 36, fill: 0x000000, strokeThickness: 0, stroke: 0x000000, align: 'center' },
    { fontFamily: 'Comic Sans MS', fontSize: 36, fill: 0xff0000, strokeThickness: 5, stroke: 0x00ff00, align: 'center' },
    //{ fontFamily: 'Comic Sans MS', fontSize: 36, fill: 0x000000, strokeThickness: 0, stroke: 0x000000, align: 'left' },
    //{ fontFamily: 'Comic Sans MS', fontSize: 200, fill: 0x000000, strokeThickness: 0, stroke: 0x000000, align: 'left' },
]

var db = new Dexie("HexfriendDatabase");

db.version(2).stores({
    maps: `
        ++id,
        mapString
    `,
});

//////////////////////////////
// Initialization Functions //
function initialize() {
    PIXI.settings.PRECISION = 'highp';

    ////////////////////
    // Initialize App //
    console.log("Initializing... Making Primary Application");
    primaryPixiApp = new PIXI.Application({
        width: $("#app-canvas").width(), height: $("#app-canvas").height(),
        //antialias: false,
        forceCanvas: false
    });

    $("#app-canvas").empty();
    $("#app-canvas").append(primaryPixiApp.view);
    //console.log(primaryPixiApp.view.id = "mainCanvas")

    primaryRenderer = primaryPixiApp.renderer;

    // TODO: dynamically load sets
    loadedTilesets = {
        "default": defaultTileset
    }

    loadedIconSets = {
        "default": defaultIconSet
    }

    loadedTextStyles = {
        "default": defaultTextStyles
    }


    //////////////////////////
    // Initialize Tool Data //
    console.log("Initializing... Initializing Tool Data");
    primaryToolData = new ToolData(); // Remember that primary tool data will be updated when we make the offset container.

    ///////////////////
    // Load Textures //
    primaryLoader = new PIXI.Loader();

    //primaryLoader.reset();

    console.log("Initializing... Loading Tilesets");
    // Load terrain symbol data (if any)
    for (const tilesetName in loadedTilesets) {
        const tileset = loadedTilesets[tilesetName];

        tileset.forEach(tile => {
            if (tile.symbol != null)
                primaryLoader.add(tile.id, tile.symbol.base64);
        });
    }

    console.log("Initializing... Loading Iconsets");
    // Load Icon Data
    for (const iconSetName in loadedIconSets) {
        const iconSet = loadedIconSets[iconSetName];

        iconSet.forEach(icon => {
            primaryLoader.add(icon.id, icon.base64);
        });
    }



    //////////////////////
    // Set up hex array //
    //primaryHexArray = new HexArray(saveData.hexarray.rows, saveData.hexarray.columns, saveData.hexarray.hexWidth, saveData.hexarray.hexHeight, saveData.hexarray.orientation);


    // In here, do things that only work after the textures have loaded
    



    ///////////////////////
    // Set up path layer //
    console.log("Initializing... Creating Path Layer");
    primaryPathLayer = new PathLayer(); // savedata go here
    let cont_pathContainer = primaryPathLayer.container;

    // Load Paths
    //primaryPathLayer.loadPaths(saveData.paths);
    primaryPathLayer.disableInteraction();



    ///////////////////////
    // Set up text layer //
    console.log("Initializing... Creating Text Layer");
    primaryTextLayer = new TextLayer(primaryPixiApp.view.width, primaryPixiApp.view.height);
    let cont_textContainer = primaryTextLayer.getContainer();
    primaryTextLayer.disableInteraction();




    /////////////////////////////
    // Set up offset container //
    console.log("Initializing... Adding everything to the offset container");
    cont_offset = new PIXI.Container();


    // Calculate initial offset
    cont_offset.calculateBounds()
    //let offsetBounds = primaryHexArray.cont_hexagons.getBounds();
    let offsetBounds = { x: 0, y: 0, width: 0, height: 0 }
    //console.log(cont_offset);

    let initialXOffset = primaryPixiApp.view.width / 2 - offsetBounds.width / 2
    let initialYOffset = primaryPixiApp.view.height / 2 - offsetBounds.height / 2

    primaryToolData.pan.xOffset = initialXOffset;
    primaryToolData.pan.yOffset = initialYOffset;

    cont_offset.x = primaryToolData.pan.xOffset;
    cont_offset.y = primaryToolData.pan.yOffset;

    //console.log(primaryPixiApp.view.width)

    primaryPixiApp.stage.addChild(cont_offset);



    ////////
    // Extra Bits
    /*
    console.log("Loading... All the little bits on top");


    /////////////////////////////////////////
    // Give relevant data to the HTML page //

    // Update map title
    $("#setting_map-title").val(saveData.title);

    // Map Settings
    $("#setting_map-title").val(saveData.title);

    //$("#setting_hex-orientation").value();

    $("#setting_hex-width").val(saveData.hexfield.hexWidth);
    $("#setting_hex-height").val(saveData.hexfield.hexHeight);

    $("#setting_show-hexgrid").prop("checked", saveData.hexfield.gridData.visible);
    $("#setting_hexgrid-thickness").val(saveData.hexfield.gridData.strokeThickness);
    */

    //////////////////
    // Key Handlers //
    console.log("Initializing... Attaching Key Handlers");

    // Events from the canvas propgate down into the core components
    primaryPixiApp.view.addEventListener("mousedown", e => {
        switch (e.button) {

            case 0: // Left
                primaryToolData.mouseDown = true;

                // ICON TOOL
                if (primaryToolData.selectedTool == "icon") {
                    primaryIconLayer.addIcon();
                }

                // PATH TOOL
                else if (primaryToolData.selectedTool == "path") {
                    primaryPathLayer.mouseDown(e);
                }

                // TEXT TOOL
                else if (primaryToolData.selectedTool == "text") {
                    primaryTextLayer.mouseDown(e);
                }


                break;

            case 2: // Right
                e.stopPropagation();
                primaryToolData.rightMouseDown = true;
                primaryToolData.pan.oldX = primaryToolData.mouseX;
                primaryToolData.pan.oldY = primaryToolData.mouseY;
                break;
        }

    });

    // Reset the mouse variables when the mouse leaves the canvas
    primaryPixiApp.view.addEventListener("mouseleave", () => {
        primaryToolData.mouseDown = false;
        primaryToolData.rightMouseDown = false;
    });

    // Update the mouse variable when mice buttons come up
    primaryPixiApp.view.addEventListener("mouseup", e => {
        switch (e.button) {
            case 0: // Left
                primaryToolData.mouseDown = false;

                if (primaryToolData.selectedTool == "text") {
                    primaryTextLayer.mouseUp(e);
                }

            case 2: // Right
                primaryToolData.rightMouseDown = false;

        }
    });

    // The mouse tool data is local to the main canvas.
    primaryPixiApp.view.addEventListener("mousemove", e => {
        // Update screen position of mouse
        primaryToolData.mouseX = e.x - $("#app-canvas").position().left;
        primaryToolData.mouseY = e.y - $("#app-canvas").position().top;

        //console.log(primaryToolData.worldX, primaryToolData.worldY)

        // Handle Panning
        if (primaryToolData.rightMouseDown) {
            let screenX = primaryToolData.mouseX;
            let screenY = primaryToolData.mouseY;

            primaryToolData.pan.xOffset += (screenX - primaryToolData.pan.oldX);
            primaryToolData.pan.yOffset += (screenY - primaryToolData.pan.oldY);

            primaryToolData.pan.oldX = screenX;
            primaryToolData.pan.oldY = screenY;

            // Container is moved based on offsets
            cont_offset.x = primaryToolData.pan.xOffset;
            cont_offset.y = primaryToolData.pan.yOffset;
        }


        // EVENTS
        if (primaryToolData.selectedTool == "text") {
            primaryTextLayer.mouseMove();
        } else if (primaryToolData.selectedTool == "path") {
            primaryPathLayer.mouseMove();
        }

    });

    // Zooming in and out
    primaryPixiApp.view.addEventListener("wheel", e => {

        let worldXBeforeZoom = primaryToolData.worldX;
        let worldYBeforeZoom = primaryToolData.worldY;

        let scaleFactor = 1.15;
        if (e.deltaY < 0) {
            primaryToolData.zoom.scale = cont_offset.scale.x * scaleFactor;
        } else {
            primaryToolData.zoom.scale = cont_offset.scale.x / scaleFactor;
        }

        primaryToolData.zoom.scale = Math.max(primaryToolData.zoom.scale, 0.2);

        let worldXAfterZoom = primaryToolData.worldX;
        let worldYAfterZoom = primaryToolData.worldY;

        // I have no fucking idea why we need to multiply by scale here
        let dx = (worldXAfterZoom - worldXBeforeZoom) * primaryToolData.zoom.scale;
        let dy = (worldYAfterZoom - worldYBeforeZoom) * primaryToolData.zoom.scale;

        //console.log("===")
        //console.log(worldXBeforeZoom, worldYBeforeZoom);
        //console.log(worldXAfterZoom, worldYAfterZoom);

        //console.log(dx, dy)
        //console.log("===")

        primaryToolData.pan.xOffset += dx;
        primaryToolData.pan.yOffset += dy;

        // Container scale is set based on data in tool data
        cont_offset.scale.set(primaryToolData.zoom.scale);
        cont_offset.x = primaryToolData.pan.xOffset;
        cont_offset.y = primaryToolData.pan.yOffset;



    });

    primaryLoader.onComplete.add(() => { // TODO
        console.log("Initializing... Creating New Hex Array");
        primaryHexfield = new Hexfield();

        // Create the selectors
        console.log("Initializing... Creating Brush Selector");
        terrainSelectorApp = new BrushSelector(loadedTilesets["default"]);
        $("#pnl_terrainButtons").empty();
        terrainSelectorApp.attachToHTMLById("#pnl_terrainButtons");

        console.log("Initializing... Creating Icon Selector");
        iconSelectorApp = new IconSelector(loadedIconSets["default"]);
        $("#pnl_iconButtons").empty();
        iconSelectorApp.attachToHTMLById("#pnl_iconButtons");

        console.log("Initializing... Creating Text Style Selector");
        textStyleSelectorApp = new TextStyleSelector(loadedTextStyles["default"]);
        $("#textstyle-selector").empty();
        textStyleSelectorApp.attachToHTMLById("#textstyle-selector");


        // ICONS
        primaryIconLayer = new IconLayer();

        // Set default selections
        // Do this dynamically at some stage
        primaryToolData.changeIcon(loadedIconSets["default"][0].id);
        primaryToolData.changeTerrain(loadedTilesets["default"][0].id);

        cont_offset.addChild(primaryHexfield.container);
        cont_offset.addChild(cont_pathContainer);
        cont_offset.addChild(primaryIconLayer.container);
        cont_offset.addChild(cont_textContainer);


        // Tooldata was re-initialised, but the selected tool was not. Update tool to match HTML
        let buttonId = $(".selectedTool").attr("id");
        changeTool(buttonId.replace("btn_", ""));

        console.log("Done initializing!");

        //console.log(saveData.hexarray);

        loadSave(DEFAULTSAVEDATA);


        ////////////////////////////
        // Load Hexagons (if any) //
        //primaryHexArray.loadHexData(saveData.hexes);
    });

    primaryLoader.load();

}


function loadMap(saveData) {

}

$(() => {
    
    
    initialize();
    
    
    /////////////////
    // Save a File //
    
    $("#btn_save").on("click", () => {
        console.log(loadedMapId);

        generatedMapData = generateSave();

        if (generatedMapData == null) {
            console.log("Save Cancelled")
            return
        }

        if (loadedMapId != -1) {
            // We are saving a previously opened map
            console.log("Replacing: " + loadedMapId);
            db.maps.update(loadedMapId, {mapData: JSON.stringify(generatedMapData)}).then(() => {

                loadedMap = generatedMapData
                
                $("#setting_map-title").val(loadedMap.title);
                alert("Saved map!")
            });
            
            // New Map
        } else {
            
            db.maps.put({ mapData: JSON.stringify(generatedMapData) }, 1).then((id) => {
                console.log("Saved New: " + id)
                loadedMapId = id
                loadedMap = generatedMapData
                
                $("#setting_map-title").val(loadedMap.title);
                alert("saved?");
            });
        }

    });

    // Export a file
    $("#btn_export").on("click", () => {
        generatedMapData = generateSave();

        if (generatedMapData == null) {
            // THis can happen if the map doesnt yet have a name and we try to export it
            console.log("Export cancelled");
            return
        }

        download(JSON.stringify(generatedMapData), generatedMapData['title'] + ".hf", "application/json");
        
    });
    

    // Load a file! //////////////////////////////////////
    /*
    $("#btn_load").on("change", event => {
        // Load new hexes
        let file = event.target.files[0];
        //console.log(file);

        let saveReader = new FileReader();
        saveReader.onload = function (e) {
            let contents = e.target.result;
            //console.log(contents);
            let saveObject = JSON.parse(contents);
            loadSave(saveObject);
        }
        
        saveReader.readAsText(file);

    });*/

    /////////////////////////////
    // Register Event Handlers //
    $(document).bind("contextmenu", e => {
       return false; 
    });

    // Keyboard events
    $(document).bind("keydown", e => {
        if (e.key == 'F5' || e.key == "F12") {
            // Nothing here on purpose makes sure the keys always work.
        } else if (primaryToolData.selectedTool == "text") {
            e.preventDefault();
            primaryTextLayer.handleKeyDown(e);
        }
    });

    // Just update the tool data.
    // Different componenets of the app use the tool data to update themselves.


});

// Find credit for this code perhaps
function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function generateSave() {
    // Generate Preview

    let savedMapTitle = loadedMap['title'];
    let settingsMapTitle = $("#setting_map-title").val();
    let mapTitle;

    console.log(settingsMapTitle == "");

    // Figure out which name to use! //

    // If there's no name, prompt for one
    if (savedMapTitle == null && settingsMapTitle == "") { 
        mapTitle = prompt("Title: ")
    
        if (mapTitle == null) { // Cancalled saving!
            return null;
        }
    
    // If there's a saved name and the settings is nothing, use the saved name
    // I don't know how this could happen, because theoretically the settings name should change to the saved name always, but it's here just in case
    } else if (settingsMapTitle == "") {
        mapTitle = savedMapTitle;
    
    // Use the name from the map settings
    } else {
        mapTitle = settingsMapTitle;
    }


    let saveObject = {
        title: mapTitle,
        version: CURRENTSAVEDATAFORMATVERSION,
        preview: primaryPixiApp.renderer.plugins.extract.base64(primaryPixiApp.stage),    
        hexfield: primaryHexfield.getSaveData(),
        icons: primaryIconLayer.getSaveData(),
        tilesets: defaultTileset,
        iconsets: defaultIconSet,
        text: primaryTextLayer.getSaveData(),
        paths: primaryPathLayer.getSaveData(),
    }


    let hexMapTitle = $("#txt_hexmapTitle").val();
    if (hexMapTitle == "") hexMapTitle = "Untitled Map"
    
    //console.log(hexMapTitle)
    //console.log(JSON.stringify(saveObject))


    return saveObject;

    
    //download(JSON.stringify(saveObject), hexMapTitle + ".hexfriend", 'application/json')


    console.log("== Done Generating Save Data ==============");
}

function loadSavedMaps() {
    console.log("Loading saved maps");

    let mapsMenuContent = ``;
    
    db.maps.each(item => {
        //console.log(JSON.parse(item.mapData).title);

        let mapData = JSON.parse(item.mapData);

        //console.log(mapData.preview);

        mapsMenuContent += `<div class="map-entry">
        
        
        <div class="map-entry-body" onclick="loadMap(` + item.id + `)">
        
            <p>` + mapData.title + `</p>
            <div class="map-preview-container">
                <img class="map-preview-image" src="` + mapData.preview + `">
            </div>
        </div>

        <div class="buttons-container">
            <button class="delete-button" onclick="deleteMap(` + item.id + `)">D</button>
        </div>
        `

        
        if (mapData.version != CURRENTSAVEDATAFORMATVERSION) {
            mapsMenuContent += `<div class="map-warning-container">

            <div class="warning-box">!</div>
            <div class="warning-message">This save is on an older version and may not load correctly.</div>

            </div>`
            
        }

        mapsMenuContent += `
        </div>
        `


    }).then(() => {

        //mapsMenuContent += `<div class="map-entry new-map" onclick="newMap()"><p>+</p></div>`
        //console.log(mapsMenuContent);
        $("#loadedMaps").html(mapsMenuContent);
    });

}

function loadMap(mapId) {

    console.log(mapId)

    db.maps.get(mapId).then(map => {
        loadedMapId = mapId;
        loadSave(JSON.parse(map.mapData));
    });
}

function deleteMap(mapId) {
    db.maps.delete(mapId).then(() => {
        loadSavedMaps();
    });

}

function loadSave(saveData, newMap = false) {
    // Delete everything - clean up

    loadedMap = saveData;

    primaryHexfield.eraseAll();

    primaryIconLayer.eraseAll();

    primaryTextLayer.eraseAll();

    primaryPathLayer.eraseAll();

    
    //terrainSelectorApp.eraseAll();
    //iconSelectorApp.eraseAll();
    
    console.log(saveData);
    
    // Erase all loaded tilesets?
    // I think we can just keep the ones we've got loaded.
    // Tilesets have to have a name anyway so we'll coordinate with that

    // Need to coordinate selectorapps here too

    primaryHexfield.loadSaveData(saveData.hexfield);
    primaryIconLayer.loadSaveData(saveData.icons);
    primaryTextLayer.loadSaveData(saveData.text);
    primaryPathLayer.loadSaveData(saveData.paths);

    console.log("\nLOADING FILE")

    //console.log(saveData.hexfield);


    hideMaps();
}

function newMap() {
    loadedMapId = -1;
    loadedMap = {};

    loadSave(DEFAULTSAVEDATA);


}

// Enable each tool, and do any setup we might need
function changeTool(newTool) {
    primaryTextLayer.disableInteraction();
    primaryHexfield.disableInteraction();
    
    primaryPathLayer.deselectPath();
    primaryPathLayer.disableInteraction();
    
    switch (newTool) {
        case "terrain":
            primaryHexfield.enableInteraction();
            primaryToolData.selectedTool = "terrain";
            break;
            
        case "icon":
            primaryToolData.selectedTool = "icon";
            break;
            
        case "path":
            primaryPathLayer.enableInteraction();
            primaryToolData.selectedTool = "path";
            break;

        case "text":
            primaryTextLayer.enableInteraction();
            primaryToolData.selectedTool = "text";
            break;
                
        case "eraser":
            primaryToolData.selectedTool = "eraser";
            break;
    }
}

// Update text tool
function updateTextStyleFromHTML(styleName, newStyle) {   
    primaryTextLayer.changeSelectedTextStyle(styleName, newStyle);
}

// Update path tool
function updatePathStyle(styleName, newStyle) {
    primaryPathLayer.changeSelectedPathStyle(styleName, newStyle);
}
