////////// Configuration //////////
var cfg = {
  'year': 2010,
  'barWidth': 16,
  'barSpacing': 8
};

// Data source
var apihost = "http://lgc-localgovdata.rhcloud.com";
var request = "/data/json/" + category + "/all/year/all/fields/Form+of+Government,Form+of+Government+Proposed";
var url = apihost + request;

// Define year segments for chart
var startYears = [1974, 1976, 1984, 1986, 1994, 1996, 2004, 2006];
var endYears   = [1976, 1984, 1986, 1994, 1996, 2004, 2006, 2014];

// govData is the original parsed data; govDataReSort is re-ordered according to ordering control
var govData = [];
var govDataReSort = [];
var distinctFormGov; // for drawing legend

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
      if (fg == 'NA')
        fg = 'Not Available';
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
// Set chart height so axis labels remain visible when y-scrolling
var chartHeight = Math.floor(0.67 * $(window).height());
var chartHeightStyle = "height:" + chartHeight + "px";

chart_div
  .append( $('<div>')
    .attr("id", 'axisbar')
    .html('<div id="axislabel"></div><div id="axis"></div>'));
chart_div
  .append( $('<div>')
    .attr("id", 'graph')
    .attr("style", chartHeightStyle));

////////// Process data //////////
function processJSON(data) {
  //console.log("processJSON data ", data);
  distinctFormGov = d3.map();

  var years = d3.keys(data).map(function(d) {return +d;}).sort();

  names = d3.keys(data[years[0]]).sort();

  var name, form, proposed, value;
  var nlen = names.length;
  for (var i = 0; i < nlen; i++) {
    name = names[i];
    govData.push({'info': {'seq': i, 'name': name}, 'forms': []});

    var slen = startYears.length;
    for (var iy = 0; iy < slen; iy++) {
      // Add Form of Government
      form = data[startYears[iy]][name]['Form of Government'];
      govData[i].forms.push({'startYear': startYears[iy], 'endYear': endYears[iy], 'form': form, 'type': 'Form'});
      // Add Form of Government Proposed
      if (startYears[iy] % 10 == 4) {
        proposed = data[endYears[iy]][name]['Form of Government Proposed'];
        govData[i].forms.push({'startYear': startYears[iy], 'endYear': endYears[iy], 'form': proposed, 'type': 'Proposed'});
      }

      // Collapse similar forms--ignore '*'
      form = form.replace('*', '');
      if (distinctFormGov.has(form)) {
        distinctFormGov.set(form, distinctFormGov.get(form) + 1);
      }
      else {
        distinctFormGov.set(form, 1);
      }
    }
  }
  //console.log("govData", govData);
  //console.log("distinctFormGov", distinctFormGov);

  drawLegend(distinctFormGov);
  drawGraph(govData);
} // processJSON

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
  var seq1 = []; // 0, 1, ..., len-1

  for (var i = 0; i < len; i++) {
    seq1.push(i);
  }
  var seqsorted = seq1.sort(compare); // ranked in compare order
  var seq2 = [];
  for (var i = 0; i < len; i++) {
    seq2[seqsorted[i]] = i; // inverse of seqsorted
  }
  govDataReSort = [];
  for (var i = 0; i < len; i++) {
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
  //console.log("drawGraph data", data);
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
  d3.json(url, processJSON);
  buildControls();
} ); // end document.ready
