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