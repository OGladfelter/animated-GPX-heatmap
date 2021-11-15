// click divs to show / hide menus
document.getElementById("menuHeaderContainer3").addEventListener("click", function() {
    if (document.getElementById("customizeMenuTable").style.display == "table"){
        document.getElementById("customizeMenuTable").style.display = "none";
        document.getElementById("menuButton3").innerHTML = "+";
    }
    else{
       document.getElementById("customizeMenuTable").style.display = "table";
       document.getElementById("menuButton3").innerHTML = "-";
    }
});

// customization menu item - background color
document.getElementById("backgroundColor").addEventListener("input", function() { 
    document.getElementById("map").style.background = this.value;
    //document.getElementsByTagName("body")[0].style.backgroundColor = this.value;
});

// customization menu item - line color
document.getElementById("lineColor").addEventListener("input", function() { 
    var allColor = this.value;
    d3.selectAll("path").style("stroke",allColor); // update frontend color
    var lines = d3.selectAll("path");
    lines._groups[0].forEach(function(d){ // update lineColor attribute for proper highlighting and returning to color
        d.setAttribute("lineColor",allColor);
    });
    for (const key of Object.keys(paths)) { // update color attr in options, for screenshot
        paths[key].options.color = allColor; // now this line will show up as this color in the screenshot
    }
    for (i=0; i<$("#colorByActivityMenu input").length; i++){ // set all by activity color pickers to match this color
        $("#colorByActivityMenu input")[i].value = allColor;
    }
});

// customization menu - line thickness
$(function() {
    $("#thicknessSlider").slider({
        range: false,
        min: 0.5,
        max: 3,
        step: 0.5,
        value: 2,
        slide: function(e, ui) {
            d3.selectAll("path").style("stroke-width",ui.value+"px");
        }
    });
});

// customization menu - line opacity
$(function() {
    $("#alphaSlider").slider({
        range: false,
        min: 0.1,
        max: 1,
        step: 0.1,
        value: 0.3,
        slide: function(e, ui) {
            d3.selectAll("path").style("opacity",ui.value)
        }
    });
});