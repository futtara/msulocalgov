////////// Configuration //////////
var cfg = {
  'year': 2013,
  'field': 'Population',
  'lastField': '',
  'maxNames': 5
  // 'data': added via ajax
};

// Initialize style configuration
setMapColors(cfg.field);

var map;
var mapAspectRatio = .55;
var info;
var features;
var counties;
var cities;
//var montanaBounds = [[49, -104.1], [44.3, -116.1]];
//var resizeEnd;
var default_info_html = '<b>' + name_label + ' Information</b><br /><span>&nbsp;&nbsp;Hover over a ' + category + '</span>';

////////// Utility //////////
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
var numberFormat = d3.format("0,000");
function mixFormat(n) { return (isNumber(n) ? numberFormat(n) : n); }

function zoomToFill(event) {
  var w = $("#chart").width();
  // Calculate appropriate zoom
  var zoomlevel = -3.2 + Math.log(w)/Math.log(2);
  map.setZoom(zoomlevel);

  // Reset height of #map div for proper layout
  $("#map").height(Math.round(w * mapAspectRatio));
}

/*
// Map size responds to window width
$(window).resize(function() {
  clearTimeout(resizeEnd);
  resizeEnd = setTimeout(function() { zoomToFill(); }, 300);
});
*/

////////// Controls //////////
function buildControls() {
  var controls_div = $("#controls");

  // Build field selectbox
  controls_div
  .append( $("<label>") 
    .text("Data displayed")
  .append( $("<div>")
  .attr("class", "field")
  .append( $("<div>")
  .attr("class", "select")
  .append( $("<select>") 
    .attr("onchange", "updateField(this.options[this.selectedIndex].value)") ))));
  var field_select_div = $(".field select");
  $.each(map_fields, function(index, field) {
    field_select_div
      .append($("<option></option>")
      .attr("value", field)
      .text(field));
   });
  field_select_div.children().eq(0).attr("selected", true);

  // Build year selectbox
  controls_div
  .append( $("<label>") 
    .text("Year")
  .append( $('<div>')
  .attr("class", 'year')
  .append( $('<div>')
  .attr("class", 'select')
  .append( $('<select>')
    .attr("onchange", "updateYear(this.options[this.selectedIndex].value)") ))));
  var year_select_div = $('.year select')
    .append($("<option></option>")
    .attr("value", 'all')
    .attr("disabled", true)
    .text(''));
  $.each(all_years, function(index, year) {
    year_select_div
      .append($("<option></option>")
      .attr("value", year)
      .text(year));
   });
  year_select_div.children().eq(23).attr("selected", true);

  // Build info panel
  $("#chart")
    .append( $("<div>")
    .attr("id", "map-info"));
  //var info_div = $("#map-info")
    //.html(default_info_html);
} // buildControls

// Set up tooltip div for mouseover info display
var tooltipDiv = d3.select("body").append("div")
  .attr("class", "tooltip");

////////// Update functions //////////
function getColorFromName(p) {
  if (cfg.data && p.Type == name_label) {
    d = cfg.data[cfg.year][p.Name][cfg.field];
    return (getColor(d));
  }
  else {
    return '#eee';
  }
}

function getColor(d) {
  if (typeof cfg.breaks[0] === 'number') {
    for (var i = cfg.breaks.length - 1; i >= 0; i--) {
      if (d >= cfg.breaks[i]) {
        return cfg.colors[i];
      }
    }
  }
  else {
    for (var i = cfg.breaks.length - 1; i >= 0; i--) {
      if (d == cfg.breaks[i]) {
        return cfg.colors[i];
      }
    }
  }

  return cfg.colors[0]; // default
}

function mapStyleCity(feature) {
  return {
    fillColor: getColorFromName(feature.properties),
    weight: 1,
    opacity: 1,
    color: 'black',
    fillOpacity: 1
  };
}

function mapStyleCounty(feature) {
  return {
    fillColor: getColorFromName(feature.properties),
    weight: 1,
    opacity: 1,
    color: 'black',
    dashArray: '3',
    fillOpacity: 1
  };
}

function setMapColors(field) {
  cfg['breaks'] = map_attr[cfg.field].breaks;
  cfg['colors'] = map_attr[cfg.field].colors;
}

////////// Legend //////////
// Build legend panel
var legend_div = document.getElementById('legend');
function legend_update() {
  var html = '<ul>';

  if (typeof cfg.breaks[0] === 'number') {
    for (var i = 0; i < cfg.breaks.length; i++) {
      html +=
        '<li><span class="marker" style="background:' + getColor(cfg.breaks[i]) + '">&nbsp;&nbsp;&nbsp;</span> ' + mixFormat(cfg.breaks[i]) + (cfg.breaks[i + 1] ? ' - ' + mixFormat(cfg.breaks[i + 1]) + '</li>' : '+');
    }
  }
  else {
    var vals = d3.values(cfg.data[cfg.year]);
    var distinct_vals = {};
    vals.map(function(el) { 
               if (el[cfg.field] in distinct_vals) {
                 distinct_vals[el[cfg.field]]++;
               }
               else {
                 distinct_vals[el[cfg.field]] = 1;
               }
             });
    for (var i = 0; i < cfg.breaks.length; i++) {
      if (cfg.breaks[i] in distinct_vals) {
        html += '<li><span class="marker" style="background:' + getColor(cfg.breaks[i]) +
                '">&nbsp;&nbsp;&nbsp;</span> ' + cfg.breaks[i] + '</li>';
      }
    }
  }
  html += '</ul>';
  legend_div.innerHTML = html;
} // legend_update

function updateField(field) {
  cfg.field = field;
  setMapColors(cfg.field);
  counties.setStyle(mapStyleCounty);
  cities.setStyle(mapStyleCity);
  legend_update();
}

// Assumes all or none availability
function haveFieldData(data, field) {
  if (data[cfg.year][all_names[0]][field] ||
      data[cfg.year][all_names[1]][field] ||
      data[cfg.year][all_names[2]][field]) {
    return true;
  }
  else {
    return false;
  }
}

function updateYearCallback(data) {
  cfg['data'] = data;

  if (!haveFieldData(cfg.data, cfg.field)) {
    var errmsg = "Error, no data for " + cfg.field + " for " + cfg.year;
    document.getElementById('map-info').innerHTML = errmsg;
  }
  else {
    // Update style configuration
    updateField(cfg.field);
    //legend_update();
  }
}

function getUrl() {
  var apihost = "http://lgc-localgovdata.rhcloud.com";
  var request = "/data/json/" + category + "/";
  var fieldList = category == 'city' ? 'County' : 'County Seat';
  for (var i = 0, len = map_fields.length; i < len; i++) {
      fieldList += "," + map_fields[i];
  }
  request += "all/year/" + escape(cfg.year) + "/fields/" + escape(fieldList);
  return (apihost + request);
}

function updateYear(year) {
  cfg.year = year;
  var url = getUrl();

  $.ajax( {
      "url": url,
      //"error": myErr,
      "success": updateYearCallback,
      "dataType": "json"
  } );

  //document.getElementById('map-info').innerHTML = default_info_html;
  //info.update();
}

////////// Chart //////////
function getFeatures() {
  $.getJSON("../../data/LGC-GeoData.json", function(data) {
    features = data;
  });
}

function drawChart(geo) {
  ////////// Create layers for counties and cities //////////
  counties = L.geoJson(geo, {
    filter: function(feature, layer) { return (feature.properties.Type == 'County'); },
    onEachFeature: onEachFeature
  });
  cities = L.geoJson(geo, {
    filter: function(feature, layer) { return (feature.properties.Type == 'City'); },
    pointToLayer: function (feature, latlng) {                    
      return new L.CircleMarker(latlng, {
        radius: 7,
        fillColor: "#000000",
        color: "#000000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.4
      });
    },
    onEachFeature: onEachFeature
  });
/*
  function coords(feature) {
    latCenter = layer.getBounds().getCenter().lat;
    lngCenter = layer.getBounds().getCenter().lng;
  }

  // Get county name coords from bounding box
  county_names = L.geoJson(geo, {
    pointToLayer: function (feature, latlng) {                    
      return new L.Marker(coords(feature), {
        icon: L.divIcon({
            className: 'name-icon',
            html: feature.properties.Name
            //iconSize: [40, 40]
        })
      });
    }//,
    //onEachFeature: onEachFeature
  });
  city_names = L.geoJson(geo, {
    filter: function(feature, layer) { return (feature.properties.Type == 'City'); },
    pointToLayer: function (feature, latlng) {                    
      return new L.Marker(latlng, {
        icon: L.divIcon({
            className: 'name-icon',
            html: feature.properties.Name,
            iconSize: [40, 40]
        })
      });
    },
    onEachFeature: onEachFeature
  });
*/

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: highlightFeature
    });
  }

  ////////// Build map //////////
  $("#chart")
    .append( $("<div>")
    .attr("id", "map"));
  var w = $("#chart").width();
  $("#map").height(Math.round(w * mapAspectRatio));

  map = L.map('map', {
    center: new L.LatLng(46.77, -110.07),
    zoom: 6, // required, but immediately call zoomToFill
    zoomControl: false,
    scrollWheelZoom: false,
    // Need counties layer for city context, not vice versa
    layers: (name_label == 'City' ? [counties, cities] : [counties])
  });
  // Set zoom to max for screen size
  zoomToFill();

  /*
  // Get background tiles from OpenStreetMap
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map style &copy;OpenStreetMap',
      maxZoom: 18
  }).addTo(map);
  */

  ////////// Build info panel //////////
  info = L.control();
  info.update = function(e, p) {
    var info_div = document.getElementById('map-info');

    if (p) {
      var html = '<table><thead>';
      html += '<tr><td class="info-name" colspan="2">';
      html += p.Name + (name_label == 'County' ? ' ' + name_label : '');
      if (name_label == 'County' && cfg.data[cfg.year][p.Name]['County Seat']) {
        html += ', (Seat: ' + cfg.data[cfg.year][p.Name]['County Seat'] + ')';
      }
      else if (cfg.data[cfg.year][p.Name]['County']) {
        html += ', ' + cfg.data[cfg.year][p.Name]['County'] + ' County';
      }
      html += '</td></tr></thead><tbody>';
      for (var i = 0, len = info_fields.length; i < len; i++) {
          html += '<tr><td class="col-name">' + info_fields[i] + '</td>';
          html += '<td class="col-val"> ';
          html += mixFormat(cfg.data[cfg.year][p.Name][info_fields[i]]);
          html += '</td></tr>';
      }
      html += '</tbody></table>';
      info_div.innerHTML = html;
    }
    else {
      info_div.innerHTML = default_info_html;
    }

    if (e) {
      var infoWidth = $("#map-info").width();
      var chartWidth = $("#chart").width();

      // Position info overlay left-right or above map
      if (infoWidth/chartWidth < .45) {
        info_div.style.top = "0px";
        info_div.style.bottom = "";
        // left-right
        if (e.containerPoint.x < $("#chart").width()/2) {
          info_div.style.right = "0px";
          info_div.style.left = "";
        }
        else {
          info_div.style.left = "0px";
          info_div.style.right = "";
        }
        /* Keep at top for now
        // top-bottom
        if (e.containerPoint.y < $("#chart").height()/2) {
          info_div.style.top = "";
          info_div.style.bottom = "0px";
        }
        else {
          info_div.style.top = "0px";
          info_div.style.bottom = "";
        }
        */
      }
      else {
        info_div.style.left = "0px";
        info_div.style.right = "";
        info_div.style.top = "";
        info_div.style.bottom = $("#chart").height() + "px";
      }
    }
  }; // info.update

  ////////// Functions for interaction //////////
  function highlightFeature(e) {
    resetHighlight();
    var layer = e.target;
    if (layer.feature.properties.Type == name_label) {
      if (name_label == 'City') {
        e.target.setRadius(10);
      }
      else if (name_label == 'County') {
        layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.6
        });
      }
      if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
      }

      info.update(e, layer.feature.properties);
      $("#map-info").show();
    }

    // Set contents of tooltip
    /*
    var html;
    if (layer.feature.properties.Name) {
      html = layer.feature.properties.Name;
      latCenter = layer.getBounds().getCenter().lat;
      lngCenter = layer.getBounds().getCenter().lng;
      tooltipDiv.html(html)  
        .style("left", (e.originalEvent.pageX + 10) + "px")     
        .style("top", (e.originalEvent.pageY - 15) + "px");
      $(".tooltip").show();
    }
    */
  } // highlightFeature

  function resetHighlight(e) {
    if (e) {
      var layer = e.target;
      if (layer.feature.properties.Type == name_label) {
        if (name_label == 'City') {
          e.target.setRadius(7);
        }
        else if (name_label == 'County') {
          counties.setStyle(mapStyleCounty);
        }

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
      }
    }
    else { // reset all
      if (name_label == 'City') {
        cities.eachLayer(function(layer) {layer.setRadius(7);});
      }
      else if (name_label == 'County') {
        counties.setStyle(mapStyleCounty);
      }
    }

    $("#map-info").hide();
  }
} // function drawChart

////////// Ready to build //////////
$(document).ready(function() {
  buildControls();
  $.when(
    $.getJSON("../../data/LGC-GeoData.json", function(data) {
      features = data;
    }),
    $.ajax( {
      "url": getUrl(),
      //"error": myErr,
      "success": (function(data) { cfg['data'] = data; }),
      "dataType": "json"
    })
    ).then(function() {
      drawChart(features);
      updateYearCallback(cfg.data);
    });
} ); // end document.ready
