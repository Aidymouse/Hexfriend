creatorData = {
    tileset: [
        // {display: "Hex Name", id: "title_hexname", bgColor: 0x000000, symbol: {color: 0x000000, symbol: "asdashdgijashg"} }
    ],
    title: "",
    version: 1,

    tilePreviews: [], // Indexes match tileset indexes
    selectedId: -1,

}

tilesetInitiated = false
const DEFAULTBG = 0xf2f2f2

let tilesetCreatorGraphics;

function initTilesetCreator() {
    const tilesetCreatorApp = new PIXI.Application({
        width: 400,
        height: 400,
        backgroundColor: 0x666666,
    })
    tilesetCreatorGraphics = new PIXI.Graphics()
    
    tilesetCreatorApp.stage.addChild(tilesetCreatorGraphics);

    $("#pixi-hex-preview").empty();
    $("#pixi-hex-preview").append(tilesetCreatorApp.view);

    //drawHexPreview();
}


function drawHexPreview(tileId) {
    tilesetCreatorGraphics.clear();
    tilesetCreatorGraphics.beginFill(creatorData.tileset[tileId].bgColor);
    tilesetCreatorGraphics.drawPolygon(generateHexPathWithRadius(140, "pointyTop", 200, 200) );
}

function renderTileButtons() {
    let newHtml = ""

    creatorData.tileset.forEach( (tileData, index) => {
        newHtml += `<button class="hex-button" id="` + index + `" onclick="hexButtonSelected(this.id)">` + tileData.display + `</button>`
    });

    newHtml += `<button class="hex-button" id="new-tile" onclick="createNewTile()">+</button>`

    $("#hex-buttons").empty()
    $("#hex-buttons").append(newHtml)

    selectCorrectButton();

}



// CALLED FROM HTML

function createNewTile() {
    creatorData.tileset.push({ display: "New Hex", id: creatorData.title + `_` + "newHex", bgColor: DEFAULTBG, symbol: null })

    // Add new tile button
    renderTileButtons();
}

function hexButtonSelected(id) {
    creatorData.selectedId = id;

    // Draw the large size preview of this hex
    drawHexPreview(creatorData.selectedId);
    selectCorrectButton();

    // Update the name of the hex
    $("#previewed-hex-name").val(creatorData.tileset[creatorData.selectedId].display );

    $("#hex-background").val(PIXI.utils.hex2string(creatorData.tileset[creatorData.selectedId].bgColor) );
    $("#label-bgColor").html("Background Color<br>" + $("#hex-background").val())
}

function updatePreviewedName() {
    creatorData.tileset[creatorData.selectedId].display = $("#previewed-hex-name").val()
    renderTileButtons();
}

function bgColorUpdated() {
    creatorData.tileset[creatorData.selectedId].bgColor = PIXI.utils.string2hex( $("#hex-background").val() )
    // TOOD: Update preview image and render buttons
    
    drawHexPreview(creatorData.selectedId);
    $("#label-bgColor").html("Background Color<br>" + $("#hex-background").val())

}


// CSS
function openTilesetCreator() {
    if (!tilesetInitiated) {
        initTilesetCreator();
        tilesetInitiated = true;
    }

    $("#tileset-creator").removeClass("hidden");
}

function hideTilesetCreator() {
    $("#tileset-creator").addClass("hidden");

}

function selectCorrectButton() {
    $(".hex-button").removeClass("selected-button")
    $(".hex-button#" + creatorData.selectedId).addClass("selected-button")
}


