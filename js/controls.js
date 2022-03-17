/* The control tips in the bottom right side of the screen */

function controls_showControl(controlName) {
    $(".controls-listing").addClass("hidden");
    $("#controls_" + controlName).removeClass("hidden");
}