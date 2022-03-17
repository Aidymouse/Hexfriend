function updateToolButton(buttonId) {
    $(".toolButton").removeClass("selectedTool");
    $("#" + buttonId).addClass("selectedTool");
}

function updateToolPanel(panelId) {
    $(".tool-panel").removeClass("shown-panel");

    if (panelId == null) {
        $("#panels").addClass("hidden");
    } else {
        $("#panels").removeClass("hidden");
        $("#" + panelId).addClass("shown-panel");
    }
}

function updateShownControls(controlsId) {
    $(".controls-listing").addClass("hidden");
    $("#controls_" + controlsId).removeClass("hidden");
}

function updateSelectedBrush(terrainId){
    $(".terrainButton").removeClass("selectedTerrain");
    $("#" + terrainId).addClass("selectedTerrain");
    
}

function updateSelectedIcon(iconId){
    $(".iconButton").removeClass("selectedIcon");
    $("#" + iconId).addClass("selectedIcon");
    
}

// Show certain tool sections at certain times



// MAPS

function showMaps() {
    $("#maps").removeClass("hidden");
}

function hideMaps() {
    $("#maps").addClass("hidden");
}



// COLOR WRAPPERS

function updateColorWrappers() {

    $(".circle-color-input-wrapper").each((index, element ) => {
        let wrapperId = element.id;

        let colorId = wrapperId.slice(2);

        $("#"+wrapperId).css("background-color", $("#" + colorId).val() );

    });

}