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
    //primaryIconLayer.handleResize(newHexWidth, newHexHeight)
    primaryHexfield.setHexSize(newHexWidth, newHexHeight)
}

function setting_changeHexgridVisibility() {
    primaryHexfield.changeOutlineVisibility( $("#setting_hexgrid-visible").is(":checked") );
}

function setting_changeHexgridStroke() {
    primaryHexfield.changeGridStroke( PIXI.utils.string2hex($("#setting_hexgrid-stroke").val()) );
}

function setting_changeHexgridThickness() {
    let newGridThickness = $("#setting_hexgrid-thickness").val()
    primaryHexfield.changeOutlineThickness( parseInt(newGridThickness)  )
}

function setting_changeBlankHexColor() {
    let newBlankColor = PIXI.utils.string2hex( $("#setting_blank-hex-color").val() );
    primaryHexfield.changeBlankHexColor(newBlankColor);
}