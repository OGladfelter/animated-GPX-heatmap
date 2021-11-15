var zoomExtent = 13, speed = 4, startingColor = 'red', endingColor = '#290099';
var map = L.map('map', {minZoom:zoomExtent, maxZoom:zoomExtent, maxBoundsViscosity:1, zoomControl:false});
map.setMaxBounds([[40.647789,-74.022393], [40.730217,-73.912763]]);
map.dragging.disable();

// map options - terrain, light, and dark
mapTilesTerrain = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: zoomExtent,
    continuousWorld: false,
    noWrap: true
});
mapTilesLight = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    maxZoom: zoomExtent,
    continuousWorld: false,
    noWrap: true
});
mapTilesDark = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    maxZoom: zoomExtent,
    continuousWorld: false,
    noWrap: true
});
map.addLayer(mapTilesLight); // default to light map

// read and map data
d3.csv("data/activities_sample.csv", function(data){

    // filter out activities without a summary polyline
    data = data.filter(d => d.summary_polyline != "");

    // setView of map on a given position (using start_latitude,start_longitude)
    map.setView([parseFloat(data[0]['start_latitude']), parseFloat(data[0]['start_longitude'])], zoomExtent);
        
    data.forEach(function(d){
        d.start_latitude = (+d.start_latitude).toFixed(2);
        d.start_longitude = (+d.start_longitude).toFixed(2);
        d.start_point = d.start_latitude + ", " + d.start_longitude;
        d.miles = (d.distance / 1609).toFixed(1);
    });

    // DRAW THE ACTIVITY LINES ONTO THE MAP
    paths = {}
    for (i=0; i<data.length; i++){
        
        var coordinates = L.Polyline.fromEncoded(data[i].summary_polyline).getLatLngs();

        paths[data[i].id] = L.polyline(
            coordinates,
            {
                color: startingColor,
                weight: 2,
                opacity: 1,
                lineJoin: 'round',
                name: data[i].name,
                activity: data[i].type,
            },
        )
        .on('click', function() { 
            console.log(this.options.name);
        })
        .addTo(map)
        .bindTooltip(data[i].name + "<br>" + data[i].miles + " miles<br>" + data[i].start_date_local.split("T")[0], {sticky: true, className: 'myCSSClass'});
    }

    function delayLength(i, total_length = 0){
        //Use recursion to find sum of all previous line lengths
        if (i==0){
          return total_length
        } 
        else{
          return (speed * d3.selectAll("path")._groups[0][i - 1].getTotalLength()) + delayLength(i-1, total_length)
        }
    }

    // set opacity of all lines and animate them
    d3.selectAll("path")
        .style("opacity", 1)
        .attr('stroke-dasharray', function(d, i){ return this.getTotalLength();}) // line starts completely in a dash offset
        .attr('stroke-dashoffset', function(d){ return this.getTotalLength();})
        .transition()
        .duration(function(d){ return speed * this.getTotalLength();}) // makes animation time correspond to length of run line
        .ease(d3.easeLinear)
        .delay(function(d,i){return delayLength(i)}) // remove this to start all lines animations at the same time
        .attr('stroke-dashoffset', 0) // transition dash offset to 0, creating animation illusion
        .transition()
        .duration(1000)
        .style("opacity", 0.3) // fade line out
        .style("stroke", endingColor); // fade line to endingColor value    
    ////////////////////////////////////////////////////////////////////////////////

    ////////////////////////// interactive stuff ////////////////////////

    // hover over any path to highlight it
    d3.selectAll("path").on("mouseover", function(){
        d3.select(this).style('stroke', 'yellow');
        d3.select(this).style('opacity', 1);
        d3.select(this).raise();
    })
    .on("mouseout", function(){
        d3.select(this).style('stroke', this.getAttribute("lineColor") ? this.getAttribute("lineColor") : document.getElementById("lineColor").value);
        d3.select(this).style('opacity', $('#alphaSlider').slider("option", "value"));
    });

    // customization menu item - click radio buttons to turn map tiles on/off
    document.getElementById("noMapButton").addEventListener("click", function() { 
        // remove leaflet map tiles
        map.removeLayer(mapTilesDark);
        map.removeLayer(mapTilesLight);
        map.removeLayer(mapTilesTerrain);
        document.getElementById("backgroundColorPicker").style.opacity = 1;
        document.getElementById("backgroundColorPicker").style.pointerEvents = 'initial';
    });
    document.getElementById("lightMapButton").addEventListener("click", function() { 
        // add leaflet map tiles
        map.removeLayer(mapTilesDark);
        map.removeLayer(mapTilesTerrain);
        map.addLayer(mapTilesLight);
        document.getElementById("backgroundColorPicker").style.opacity = 0.2;
        document.getElementById("backgroundColorPicker").style.pointerEvents = 'none';
    });
    document.getElementById("darkMapButton").addEventListener("click", function() { 
        // add leaflet map tiles
        map.removeLayer(mapTilesLight);
        map.removeLayer(mapTilesTerrain);
        map.addLayer(mapTilesDark);
        document.getElementById("backgroundColorPicker").style.opacity = 0.2;
        document.getElementById("backgroundColorPicker").style.pointerEvents = 'none';
    });
    document.getElementById("terrainMapButton").addEventListener("click", function() { 
        // add leaflet map tiles
        map.removeLayer(mapTilesLight);
        map.removeLayer(mapTilesDark);
        map.addLayer(mapTilesTerrain);
        document.getElementById("backgroundColorPicker").style.opacity = 0.2;
        document.getElementById("backgroundColorPicker").style.pointerEvents = 'none';
    });

});