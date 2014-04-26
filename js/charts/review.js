////////// Configuration //////////
var cfg = {
  'year': 2010,
  'barWidth': 16,
  'barSpacing': 8
};
if (category == 'county') {
  var url = "/data/lgc-review-county.csv";
  //var url = "https://docs.google.com/spreadsheet/pub?key=0Atn3Ey0sZdckdGt5NTFEamVMVDE4ZEdQLXMxdFFOSVE&single=true&gid=0&output=csv"; // LG Review Tables, Sheet 1
}
else {
  var url = "/data/lgc-review-city.csv";
  //var url = "https://docs.google.com/spreadsheet/pub?key=0Atn3Ey0sZdckdGt5NTFEamVMVDE4ZEdQLXMxdFFOSVE&single=true&gid=1&output=csv"; // LG Review Tables, Sheet 2
}

var govData = [];
var govDataReSort = [];
var distinctFormGov;

////////// Controls //////////
function buildControls() {
  var controls_div = jQuery("#controls");

  // Build ordering selectbox
  controls_div
  .append( $("<label>") 
    .text("Order rows by")
  .append( $('<div>')
    .attr("class", 'order')
  .append( $('<div>')
    .attr("class", 'select')
  .append( $('<select>')
    .attr("onchange", "reSort(this.options[this.selectedIndex].value)") ))));
  var order_select_div = $('.order select')
    .append($("<option></option>")
    .attr("value", 'seq')
    .text(name_label));
  $.each(order_fields, function(index, field) {
    order_select_div
      .append($("<option></option>")
      .attr("value", field)
      .text(field));
  });
  order_select_div.children().eq(0).attr("selected", true);
} // buildControls

// Build legend
function drawLegend(distinctFormGov) {
  var fgoOrdered = d3.keys(formgov_order).sort(function(a, b) {return (formgov_order[a] - formgov_order[b]); });
  var legendList = '';
  fgoOrdered.forEach(function(fg) {
    if (distinctFormGov.has(fg)) {
      var fgTrim = fg.replace(/ /g, '').replace('(', '').replace(')', '');
      legendList += '<li><span class="marker ' + fgTrim + '">&nbsp;</span>' + fg + '</li>\n';
    }
  });

  var legend_div = jQuery("#legend");
  legend_div
    .append( $("<ul>")
    .html(legendList));
}

// Set up tooltip div for mouseover info display
var tooltipDiv = d3.select("body").append("div")
  .attr("class", "tooltip");

// Set up axis and graph
var chart_div = jQuery("#chart");
chart_div
  .append( $('<div>')
    .attr("id", 'axisbar')
    .html('<div id="axislabel"></div><div id="axis"></div>'));
chart_div
  .append( $('<div>')
    .attr("id", 'graph'));

////////// Process data //////////
function processCSV(data) {
  //console.log("csv data ", data);
  distinctFormGov = d3.map();
  
  // Utility processing functions
  function colname2label(form) {
    return form.slice(0, -5);
  }
  function colname2year(form) {
    return parseInt(form.slice(-4));
  }

  var len = data.length;
  for (var i = 0; i < len; i++) {
    var row = data[i];
    var current;
    var name, label, value;
    var year, startYear, endYear, choiceYear;

    for (key in row) {
      if (typeof row[key] == "string") {
        value = row[key].trim();
      }
      else {
        value = row[key];
      }

      // Create new array element for 'name'
      if (key == "COUNTY" || key == "CITY") {
        govData.push({'info': {'seq': i, 'name': value}, 'forms': []});
      }
      else { // Process form of government columns
        label = colname2label(key);
        year = colname2year(key);
        choiceYear = (year % 10 == 6) ? true : false;

        if (label == 'FORM') {
          startYear = year;
          endYear = choiceYear ? year + 8 : year + 2;
          govData[i].forms.push({'startYear': startYear, 'endYear': endYear, 'form': value, 'type': 'Form'});
          value = value.replace('*', '');
          if (distinctFormGov.has(value)) {
            distinctFormGov.set(value, distinctFormGov.get(value) + 1);
          }
          else {
            distinctFormGov.set(value, 1);
          }
        }
        else if (label == 'PROPOSED') {
          startYear = year - 2;
          endYear = year;
          govData[i].forms.push({'startYear': startYear, 'endYear': endYear, 'form': value, 'type': 'Proposed'});
        }
        else {
          //console.log("Error with label ", label);
        }
      }
    }
  }
  drawLegend(distinctFormGov);
  drawGraph(govData);
} // processCSV

function reSort(sortField) {
  function compare(a, b) {
    if (sortField == 'Form of Government') {
      var forma = govData[a].forms[11]['form'];
      var formb = govData[b].forms[11]['form'];
      var astar = forma.replace(/\*/, '');
      var bstar = formb.replace(/\*/, '');
      var seqa = formgov_order[astar];
      var seqb = formgov_order[bstar];
      if (seqa === 'undefined') {
        seqa = 100;
      }
      if (seqb === 'undefined') {
        seqb = 100;
      }
      if (seqa === 'undefined' || seqb === 'undefined') {
        return (0);
      }
      return (seqa - seqb);
    }
    else { // other ordering is alphabetical = seq
      // Note opposite ordering, low to high
      return (govData[a].info[sortField] - govData[b].info[sortField]);
    }
  }

  var len = govData.length;
  var i;
  var seq1 = []; // 0, 1, ..., len-1

  for (i = 0; i < len; i++) {
    seq1.push(i);
  }
  var seqsorted = seq1.sort(compare); // ranked in compare order
  var seq2 = [];
  for (i = 0; i < len; i++) {
    seq2[seqsorted[i]] = i; // inverse of seqsorted
  }
  govDataReSort = [];
  for (i = 0; i < len; i++) {
    govDataReSort.push(govData[seqsorted[i]]);
  }
  // animate to layout with new absolute top position
  //var delay = function(d, i) { return  20 + i * 20; };
  //d3.selectAll(".bar").transition().duration(500).delay(delay).style("top",
      //function(d, i) { return (seq2[i]) * 24 + "px"; } );
  // Rewrite seq values for re-positioning
  //console.log("before resort, govData ", govData);
  //for (i = 0; i < len; i++) {
    //govData[i].info.seq = seq2[i];
  //}
  //console.log("govDataReSort ", govDataReSort);

  $("#axis").empty();
  $("#graph").empty();
  drawGraph(govDataReSort);
} // reSort

////////// Graph //////////
function drawGraph(data) {
  // Get min, max year for scale
  var minYear = 9999, maxYear = 0; // for scale
  var len = data.length;
  for (var i = 0; i < len; i++) {
    if (data[i].forms[0].startYear < minYear) {
      minYear = data[i].forms[0].startYear;
    }
    if (data[i].forms[11].endYear > maxYear) {
      maxYear = data[i].forms[11].endYear;
    }
  }

  // Scales and positions
  x = d3.scale.linear()
      .range([0, 100])
      .domain([minYear, maxYear + 1]);

  // Get scaled width of segment as % of .bardata width
  function width(data) {
    return (x(data.endYear) - x(data.startYear)) + "%";
  }

  var startYears = govData[0].forms.filter(function (d) {return (d.type == "Form");}).map(function (d) {return d.startYear;});
  var endYears = govData[0].forms.filter(function (d) {return (d.type == "Proposed");}).map(function (d) {return d.endYear;});

  function getAxisStyle(d, index) {
    var w = x(d);
    style = "left: " + w + "%;";
    return style;
  }
  var axis = d3.select("#axis")
      .selectAll("div")
      .data(endYears)
    .enter().append("div")
      .attr("class", "axisdata")
      .attr("style", getAxisStyle)
      .text(function(d, index) { return " " + d; });

  // Gets top position of bar (if using absolute positioning)
  function getBarStyle(d, index) {
    var t = (cfg.barWidth + cfg.barSpacing) * d.info.seq; //index;
     style = "top: " + t + "px;";
    return style;
  }
  function getBarDataClass(d) {
    var self = d.form.indexOf('*') > 0 ? ' self' : '';
    var dtrim = d.form.replace(/\*/, '').replace(/ /g, '').replace(/\(/g, '').replace(/\)/g, '');
    var divclass = "segment ";
    if (d.endYear - d.startYear == 2)
      divclass += "twoyear ";
    if (d.type == 'Form') {
      divclass += dtrim + self;
    } else {
      divclass += "proposed " + dtrim + self;
    }

    return divclass;
  }
  function getBarDataStyle(d, index) {
    var w = width(d, index);
    style = "width: " + w + ";";

    if (index > 0) {
      if (d.type == 'Proposed') {
        style += " height: " + cfg.barWidth/2 + "px;";
        style += " margin-left: -" + w + ";";
      }
    }
    return style;
  }

  function mouseOver(data) {
    d3.select(this).classed("mouse", true);

    // Set contents of tooltip
    var html;
    if (data) {
      if (data.type == 'Proposed' && data.form != 'No proposal') {
        html = data.form + "\nproposed";
      }
      else {
        html = data.form;
      }

      tooltipDiv.html(html);
      var positionLeft = d3.event.pageX + 10;
      if (positionLeft > .75 * $(window).width()) {
        positionLeft = d3.event.pageX - 20 - $(".tooltip").width();
      }
      var positionTop = d3.event.pageY - 15;
      tooltipDiv
        .style("left", positionLeft + "px")     
        .style("top", positionTop + "px");
      $(".tooltip").show();
    }
  } // mouseOver
  function mouseOut() {
    d3.select(this).classed("mouse", false);
    $(".tooltip").hide();
  } // mouseOut

  // Create the graph
  var graph = d3.select("#graph");
  var bars = graph.selectAll("div")
    .data(data)
    .enter().append("div")
    //.attr("style", getBarStyle) // if using absolute positioning
    .attr("class", function(d) {return "bar " + d.info.name});

  var barlabels = bars.append("div")
    .attr("class", "barlabel")
    .text( function(d) {return d.info.name;});

  var bardata = bars.append("div")
    .attr("class", "bardata")
      .selectAll("div")
      .data(function (d) { return d.forms; })
    .enter().append("div")
      .attr("class", getBarDataClass)
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .attr("style", getBarDataStyle);
} // drawGraph

jQuery(document).ready(function() {
  d3.csv(url, processCSV);
  buildControls();
} ); // end document.ready
