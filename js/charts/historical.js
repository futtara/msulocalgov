////////// Configuration //////////
var cfg = {
  'year': 2010,
  'field': 'Population',
  'maxNames': 5
};

var plotColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

if (category == "county") {
  cfg['names'] = ['Gallatin', 'Park'];
} 
else {
  cfg['names'] = ['Bozeman', 'Helena'];
} 

var baseFontSize = 18;
var w0 = 900;
var h0 = 600;
var aspect = h0/w0;
var w = $('#chart-wrap').width();
var h = Math.round(w * aspect);
console.log("w ", w);

////////// Utility //////////
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
var tryNum = function(v) {
  var vNoCommas = v;
  if (typeof vNoCommas === "string") {
    vNoCommas = v.replace(",", "");
  }
  if (!isNumber(vNoCommas))
    return v;
  return +vNoCommas;
};
var numberFormat = d3.format("0,000");

////////// Controls //////////
function buildControls() {
  var controls_div = jQuery("#controls");

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
  $.each(historical_fields, function(index, field) {
    field_select_div
      .append($("<option></option>")
      .attr("value", field)
      .text(field));
   });
  field_select_div.children().eq(0).attr("selected", true);

  // Build city/county selectboxes
  var name_select_div;
  for (var i = 0; i < cfg.maxNames; i++) {
    controls_div
    .append( $("<div>")
    .attr("class", "name" + i)
    .append( $("<div>")
    .attr("class", "select")
    .append( $("<select>")
    .attr("onchange", "updateName(" + i + ", this.options[this.selectedIndex].value)"))));
    name_select_div = $(".name" + i + " select");
    name_select_div
      .append($("<option></option>")
      .attr("value", " ")
      .attr("selected", "selected")
      .text("(None selected)"));
    $.each(all_names, function(index, name) {
      if (name == cfg.names[i]) {
        name_select_div
          .append($("<option></option>")
          .attr("value", name)
          .attr("selected", "selected")
          .text(name));
      }
      else {
        name_select_div
          .append($("<option></option>")
          .attr("value", name)
          .text(name));
      }
    });
  }
}

// Prepare datatip div
var datatipDiv = d3.select("body").append("div")
  .attr("class", "datatip")
  .style("opacity", 0);

function mouseOver(d) {
  this.setAttribute("r", "10");
  datatipDiv.html(numberFormat(d[cfg.field]))  
      .style("left", (d3.event.pageX) + "px")     
      .style("top", (d3.event.pageY - 28) + "px");
  datatipDiv.transition()
      .duration(100)
      .style("opacity", 1);
}

function mouseOut() {
  this.setAttribute("r", "7");
  datatipDiv.transition()
      .duration(100)
      .style("opacity", 0);
}

function mouseMove() {
  datatipDiv
      .text(d3.event.pageX + ", " + d3.event.pageY)
      .style("left", (d3.event.pageX - 34) + "px")
      .style("top", (d3.event.pageY - 12) + "px");
}

////////// Update functions //////////
function updateName(index, name) {
  cfg.names[index] = name;
  updateChart();
}

function updateField(field) {
  cfg.field = field;
  updateChart();
}

////////// Chart //////////
function updateChart() {

  var margin = {top: 40, right: 180, bottom: 30, left: 100};
  for (var key in margin) {
    margin[key] = Math.round(margin[key] * w/w0);
  }
  console.log("margin ", margin);
  var chartWidth = w - margin.left - margin.right,
  chartHeight = Math.round(w * aspect) - margin.top - margin.bottom;
  console.log("chartWidth ", chartWidth, " chartHeight ", chartHeight);

  // Needed for svg responsiveness
  var viewBox = "0 0 " + w + " " + h;

  var x = d3.scale.linear()
      .range([0, chartWidth]);

  var y = d3.scale.linear()
      .range([chartHeight, 0]);

  // color based on given index in cfg.names, i.e. selectBox
  var color = function(name) {
    var colorCode = '#000';
    for (var i = 0; i < cfg.maxNames; i++) {
      if (cfg.names[i] == name) {
        colorCode = plotColors[i];
        break;
      }
    }
    return colorCode;
  }
  var pointFill = function(d) {
    if (cfg.field == 'Population' && d.year % 10 == 0) {
      return color(d.name);
    }
    else {
      return 'white';
    }
  }

  var xAxis = d3.svg.axis()
      .scale(x)
      .tickFormat(d3.format(".0"))
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var name_param = "";
  for (var i = 0; i < cfg.maxNames; i++) {
    if (cfg.names[i]) {
      if (name_param.length > 0) {
        name_param += ",";
      }
      name_param += escape(cfg.names[i]);
    }
  }
  console.log(cfg.field);
  //var apihost = "http://lastbestthing.com";
  var apihost = "http://lgc-localgovdata.rhcloud.com";
  //var request = "/data/v1/json/" + category + "/" + name_param + "/year/all/fields/" + escape(cfg.field);
  var request = "/data/json/" + category + "/" + name_param + "/year/all/fields/" + escape(cfg.field);
  var url = apihost + request;
  console.log(url);

  d3.json(url, function(error, data) {
    // Need sort() for undefined order in Firefox
    var years = d3.keys(data).map(function(d) {return +d;}).sort();
    var names = d3.keys(data[years[0]]);
    var labels = d3.keys(data[years[0]][names[0]]);
    console.log(years);
    console.log(names);
    console.log(labels);

    $("#chart").empty();

    $("#chart")
      .append( $("<div>") 
      .attr("id", "svgchart"));
    var svg = d3.select("#svgchart").append("svg")
        .attr("viewBox", viewBox)
        .attr("preserveAspectRatio", "none")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    var cties = names.map(function(n) {
      var cty = years.map(function(y) {
        result = {};
        result['year'] = y;
        result[cfg.field] = tryNum(data[y][n][cfg.field]);
        return result;
      });
      return {'name':n, 'values':cty};
    });

    x.domain(d3.extent(years));

    y.domain([
      0, 
      d3.max(cties.map(function(c) {
        return d3.max(c['values'].map(function(v) { return v[cfg.field]; }))} ))
    ]);

    var line = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return x(d.year); })
      .y(function(d) { return y(d[cfg.field]); });

    var x_axis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        //.attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dx", "-1em")
        .attr("dy", "-1em")
        .text(cfg.field);

    var cty = svg.selectAll(".cty")
        .data(cties)
      .enter().append("g")
        .attr("class", "cty");

    cty.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });

    cty.append("g").selectAll('.data-point')
      .data(function(d) { return (d.values.map(function(v) {var res = v; res['name'] = d.name; return res; }));})
      .enter().append("circle")
      .attr("cx", function(d) { return x(d.year); })
      .attr("cy", function(d) { return y(d[cfg.field]); })
      .attr("r", 7)
      .style("stroke", function(d) { return color(d.name); })
      .style("fill", pointFill)
      .on("mouseover", mouseOver)
      //.on("mousemove", mouseMove)
      .on("mouseout", mouseOut);

    cty.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value[cfg.field]) + ")"; })
      .attr("x", 0)
      .attr("dy", "-.5em")
      .attr("class", "line-label")
      .attr("fill", function(d) { return color(d.name); })
      .text(function(d) { return d.name; });
/*

    // For title
    svg.append("text")
        .attr("x", (width / 2))       
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("Value vs Date Graph");

    legend = svg.append("g")
      .attr("class","legend")
      .attr("transform","translate(50,30)")
      .style("font-size","12px")
      .call(d3.legend);
*/
    var bbox = svg.node().getBBox();
    console.log("bbox ", bbox);
    bbox = x_axis.node().getBBox();
    console.log("bbox ", bbox);
  }); // d3.json
}; // updateChart

$(window).resize(function() {
  w = $("#svgchart").width();
  var svg = $("#svgchart").find('svg');
  svg.attr("width", w);
  svg.attr("height", Math.round(w * aspect));

  // Counteract text scaling
  var newFontSize = baseFontSize * w0/w;
  var text = d3.selectAll('text').style("font-size", newFontSize);
});

jQuery(document).ready(function() {
  buildControls();
  updateChart();
} ); // end document.ready
