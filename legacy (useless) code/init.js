unction initialize(saveData, usingDefaultData = false) {
    PIXI.settings.PRECISION = 'highp';

    if (saveData == null) {
        console.log("No save data presented! Aborting.");
        return;
    };

    loadedMap = saveData;

    ////////////////////
    // Initialize App //
    console.log("Loading... Making Primary Application");
    primaryPixiApp = new PIXI.Application({
        width: $("#app-canvas").width(), height: $("#app-canvas").height(),
        antialias: false,
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
    console.log("Loading... Initializing Tool Data");
    primaryToolData = new ToolData(); // Remember that primary tool data will be updated when we make the offset container.

    ///////////////////
    // Load Textures //
    primaryLoader = new PIXI.Loader();
    PIXI.utils.clearTextureCache();

    //primaryLoader.reset();

    console.log("Loading... Loading Tilesets");
    // Load terrain symbol data (if any)
    for (const tilesetName in loadedTilesets) {
        const tileset = loadedTilesets[tilesetName];

        tileset.forEach(tile => {
            if (tile.symbol != null)
                primaryLoader.add(tile.id, tile.symbol.base64);
        });
    }

    console.log("Loading... Loading Iconsets");
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
    primaryLoader.onComplete.add(() => { // TODO
        console.log("Loading... Creating New Hex Array");
        primaryHexfield = new Hexfield(saveData.hexfield, generate = usingDefaultData);

        // Create the selectors
        console.log("Loading... Creating Brush Selector");
        terrainSelectorApp = new BrushSelector(loadedTilesets["default"]);
        $("#pnl_terrainButtons").empty();
        terrainSelectorApp.attachToHTMLById("#pnl_terrainButtons");

        console.log("Loading... Creating Icon Selector");
        iconSelectorApp = new IconSelector(loadedIconSets["default"]);
        $("#pnl_iconButtons").empty();
        iconSelectorApp.attachToHTMLById("#pnl_iconButtons");

        console.log("Loading... Creating Text Style Selector");
        textStyleSelectorApp = new TextStyleSelector(loadedTextStyles["default"]);
        $("#textstyle-selector").empty();
        textStyleSelectorApp.attachToHTMLById("#textstyle-selector");


        // ICONS
        primaryIconLayer = new IconLayer();
        primaryIconLayer.loadSaveData(saveData.icons);

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

        console.log("Done loading!");

        //console.log(saveData.hexarray);




        ////////////////////////////
        // Load Hexagons (if any) //
        //primaryHexArray.loadHexData(saveData.hexes);
    });

    primaryLoader.load();



    ///////////////////////
    // Set up path layer //
    console.log("Loading... Creating Path Layer");
    primaryPathLayer = new PathLayer(saveData.paths); // savedata go here
    let cont_pathContainer = primaryPathLayer.container;

    // Load Paths
    //primaryPathLayer.loadPaths(saveData.paths);
    primaryPathLayer.disableInteraction();



    ///////////////////////
    // Set up text layer //
    console.log("Loading... Creating Text Layer");
    primaryTextLayer = new TextLayer(primaryPixiApp.view.width, primaryPixiApp.view.height);
    let cont_textContainer = primaryTextLayer.getContainer();

    // Load Text
    primaryTextLayer.loadText(saveData.text);

    primaryTextLayer.disableInteraction();



    /////////////////////////////
    // Set up offset container //
    console.log("Loading... Adding everything to the offset container");
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


    //////////////////
    // Key Handlers //
    console.log("Loading... Attaching Key Handlers");

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



}