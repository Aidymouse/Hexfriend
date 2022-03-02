function showMapSettings() {
    $("#map-settings-container").removeClass("hidden");
}

function hideMapSettings() {
    $("#map-settings-container").addClass("hidden");
}


function setting_updateOrientation() {
    primaryHexfield.changeOrientation($('#setting_hex-orientation').val())
    
}

function setting_resizeHexes() {
    let newHexWidth = $("#setting_hex-width").val()
    let newHexHeight =  $("#setting_hex-height").val()
    primaryIconLayer.handleResize(newHexWidth, newHexHeight)
    primaryHexfield.setHexSize(newHexWidth, newHexHeight)
}

function setting_changeHexgridVisibility() {
    primaryHexfield.changeOutlineVisibility( $("#setting_show-hexgrid").is(":checked") );
}

function setting_changeHexgridThickness() {
    let newGridThickness = $("#setting_hexgrid-thickness").val()
    primaryHexfield.changeOutlineThickness( parseInt(newGridThickness)  )
}