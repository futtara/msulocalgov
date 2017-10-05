////////// Configuration //////////
var cfg = {
  'year': 2013,
  'class': 'all',
  'fields': ['Population', '', ''],
  'maxFields': 3,
  'maxDataValue': [],
  'col2index': []
};
var seq0123 = [0, 1, 2, 3];

////////// Controls //////////
function buildControls() {
  var controls_div = jQuery("#controls");

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

  // Build class selectbox (cities only)
  if (category == 'city') {
    controls_div
    .append( $("<label>") 
      .text("Class")
    .append( $('<div>')
      .attr("class", 'class')
    .append( $('<div>')
      .attr("class", 'select')
    .append( $('<select>')
      .attr("onchange", "updateClass(this.options[this.selectedIndex].value)") ))));
    var class_select_div = $('.class select')
      .append($("<option></option>")
      .attr("value", 'all')
      .text('All'));
    $.each(all_classes, function(index, c) {
      class_select_div
        .append($("<option></option>")
        .attr("value", c)
        .text(c));
    });
    class_select_div.children().eq(0).attr("selected", true);
  }

  // Build field selectboxes
  var field_select_div;
  controls_div
    .append( $("<label>")
      .text("Data Displayed"));
  for (var i = 0; i < cfg.maxFields; i++) {
    controls_div
      .append( $("<div>")
        .attr("class", "field" + i)
      .append( $("<div>")
        .attr("class", "select")
      .append( $("<select>")
        .attr("onchange", "updateField(" + i + ", this.options[this.selectedIndex].value)") )));
    field_select_div = $(".field" + i + " select");
    // Only populate one column initially, else (None)
    if (i > 0) {
      field_select_div
        .append($("<option></option>")
        .attr("value", "")
        .text("(None selected)"));
    }
    var optionList = "";
    $.each(comparison_fields, function(index, field) {
      optionList += '<option value="' + field + '">' + field + '</option>\n';
     });
    field_select_div
      .append(optionList)
      .children().eq(0).attr("selected", true);
  }
} // buildControls

// Prepare datatip div
var datatipDiv = d3.select("body").append("div")
  .attr("class", "datatip")
  .style("opacity", 0);

function mouseOver(d) {
  datatipDiv.html(numberFormat(d))  
      .style("left", (d3.event.pageX + 10) + "px")     
      .style("top", (d3.event.pageY - 10) + "px");
  datatipDiv.transition()
      .duration(100)
      .style("opacity", 1);
}
function mouseOut() {
  datatipDiv.transition()
      .duration(100)
      .style("opacity", 0);
}

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

var compareNumOrNull = function(a, b) {
  var aNum = tryNum(a);
  var bNum = tryNum(b);
  if (typeof aNum === "number") {
    if (typeof bNum === "number") {
      return (bNum - aNum); // the usual comparison
    }
    else {
      return 1; // a > b if a is numeric and b is not
    }
  }
  else {
    if (typeof bNum === "number") {
      return -1; // b > a if b is numeric and a is not
    }
    else {
      return 0; // consider equal if both non-numeric
    }
  }
}

function getScaleTick(max) {
  var splits = [1, 2, 2, 4, 5, 5, 5, 8, 8];
  // p is log10 of max
  var p = Math.floor(Math.log(max)/Math.log(10));
  var l = Math.floor(max/Math.pow(10, p));
  var tick = l * Math.pow(10, p);

  return tick;
}

////////// Update functions //////////
function updateYear(year) { 
  cfg.year = year; 
  updateChart(); 
}

function updateClass(c) { 
  cfg.class = c; 
  updateChart(); 
}

function updateField(index, field) {
  cfg.fields[index] = field;
  updateChart();
}

////////// Chart //////////
function createChart() {
  var chart = jQuery("#chart");
  if (chart.get(0)) {
    chart.empty();
  }
  
  // Set chart height so axis labels remain visible when y-scrolling
  var chartHeight = Math.floor(0.67 * $(window).height());
  var chartHeightStyle = "height:" + chartHeight + "px";

  chart.append( $("<table>")
      .attr("id", 'chart-header')
    .append($("<thead>")
    .append($("<tr>") ))
    .append($("<tbody>") ));

  chart.append( $("<div>")
      .attr("id", 'chart-div')
      .attr("style", chartHeightStyle)
    .append( $("<table>")
      .attr("id", 'chart-table')
    .append($("<tbody>") )));

  return chart;
}

function getRequest() {
  var field_param = "Class";
  for (var i = 0; i < cfg.maxFields; i++) {
    if (cfg.fields[i]) {
      if (field_param.length > 0) {
        field_param += ",";
      }
      field_param += escape(cfg.fields[i]);
    }
  }
  var request = "/data/api/" + category + "/all/year/" + cfg.year + "/fields/" + field_param;
  return request;
}

////////// Chart //////////
function updateChart() {
  //var apihost = "http://lgc-localgovdata.rhcloud.com";
  var apihost = "http://api.msulocalgov.net";
  var url = apihost + getRequest();
  //console.log(" url ",  url);
  d3.json(url, function(error, data) {
    //console.log("data", data);
    years = d3.keys(data).map(function(d) {return +d;});
    names = d3.keys(data[years[0]]).sort();

    // Save max data values for scaling in barSize
    var activeColCount = 0;
    for (var i = 0; i < cfg.maxFields; i++) {
      var field = cfg.fields[i];
      cfg.maxDataValue[field] = -1;
      names.forEach(function(n) {
        if (tryNum(data[cfg.year][n][field]) > cfg.maxDataValue[field]) {
          if (cfg.class == 'all' || cfg.class == data[cfg.year][n]['Class']) {  
            cfg.maxDataValue[field] = tryNum(data[cfg.year][n][field]);
          }
        }
      });
      // Accounting in case of "None Selected" columns
      if (cfg.fields[i] != "") {
        cfg.col2index[activeColCount] = i;
        activeColCount++;
      }
    }

    var bardata = [];
    names.forEach(function(n) {
      if (cfg.class == 'all' || cfg.class == data[cfg.year][n]['Class']) {  
        var fields = [];
        fields.push(n);
        for (var i = 0; i < cfg.maxFields; i++) {
          var field = cfg.fields[i];
          if (field.length > 1)
            fields.push(tryNum(data[cfg.year][n][field]));
        }
        bardata.push(fields);
      }
    });

    // Build header column labels
    var columnLabels = '<th style="width:12em";>' + name_label + '<br><div class="scale-wrap" style="width:100%"><div class="scale" style="width:100%">' + '&nbsp;</div></div></th>';
    for (var i = 0; i < cfg.maxFields; i++) {
      if (cfg.fields[i].length > 1) {
        // Generate scale tick mark
        var max = cfg.maxDataValue[cfg.fields[i]];
        var tick = getScaleTick(max);
        var tickWidth = Math.floor(tick * 900/max)/10;
        var remWidth = 90 - tickWidth - 1;
        columnLabels += '<td>' + cfg.fields[i] + '<br />\n';
        columnLabels += '<div class="scale-wrap" style="width:90%"><div class="scale" style="width:' + tickWidth + '%">' + numberFormat(tick) + '&nbsp;</div></div></td>\n';
      }
    }

    var chart = createChart();

    // Create header row
    var headers = chart.find("#chart-header tr")
      .append(columnLabels);

    // Create data rows
    var tr = d3.select("#chart-table tbody").selectAll("tr")
      .data(bardata)
      .enter().append("tr");

    // Click event to do sort when column label clicked
    function stringOrder(s1, s2) {
      if (s1 < s2) {
        return -1;
      }
      else if (s1 > s2) {
        return 1;
      }
      else {
        return 0;
      }
    }
    d3.selectAll("#chart-header th").on("click", function(d, i) {
      if(this.className == "sorted_desc") {
        this.className = "sorted_asc";
        tr.sort(function(a, b) { return stringOrder(a[0], b[0]); });
      }
      else {
        this.className = "sorted_desc";
        tr.sort(function(a, b) { return stringOrder(b[0], a[0]); });
      }
    });
    d3.selectAll("#chart-header td").data(seq0123).on("click", function(d, i) {
      if(this.className == "sorted_desc") {
        this.className = "sorted_asc";
        tr.sort(function(b, a) { return compareNumOrNull(a[i+1], b[i+1]); });
      }
      else {
        this.className = "sorted_desc";
        tr.sort(function(a, b) { return compareNumOrNull(a[i+1], b[i+1]); });
      }
    });

    // Row labels
    tr.append("th")
      .attr("style", "width:12em;")
      .text(function(d) { return d[0]; });

    function barSize(d, col) {
      col_index = cfg.col2index[col];
      var field = cfg.fields[col_index];
      //console.log("barSize", col, cfg.fields[col], col_index, field);

      if (!isNaN(d) && cfg.maxDataValue[field] > 0) {
        var w = Math.floor(d * 900/cfg.maxDataValue[field])/10; // .1 precision
        // Seems to need a fixed height, not blank or auto
        return ("height:1em; width:" + w + "%;");
      }
      else {
        return ("height:1em; width:0;");
      }
    } // barSize

    // Row bars, one per data field
    tr.selectAll("td")
      .data(function(d) { return d.slice(1); })
      .enter().append("td").append("div")
        .attr("class", "bardiv")
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut)
        .attr("style", function(d, i) { return barSize(d, i); });
  }); // d3.json
}; // updateChart

jQuery(document).ready(function() {
  // Remove any existing chart before redrawing
  buildControls();
  updateChart();
} ); // end document.ready
