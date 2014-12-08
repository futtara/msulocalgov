////////// Configuration //////////
var cfg = {
  'year': 2010,
  'field': 'all',
  'name': 'all',
  'tableType': 'year'
};

////////// Controls //////////
function buildControls() {
  var controls_div = jQuery('#controls');

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
    .text('All'));
  $.each(all_years, function(index, year) {
    year_select_div
      .append($("<option></option>")
      .attr("value", year)
      .text(year));
   });
  year_select_div.children().eq(20).attr("selected", true);

  // Build city/county selectbox
  controls_div
  .append( $("<label>") 
    .text(name_label)
  .append( $('<div>')
  .attr("class", 'name')
  .append( $('<div>')
  .attr("class", 'select')
  .append( $('<select>')
    .attr("onchange", "updateName(this.options[this.selectedIndex].value)") ))));
  var name_select_div = $('.name select')
    .append($("<option></option>")
    .attr("value", 'all')
    .attr("selected", true)
    .attr("disabled", true)
    .text('All'));
  $.each(all_names, function(index, year) {
    name_select_div
      .append($("<option></option>")
      .attr("value", year)
      .text(year));
   });

  // Build data selectbox
  controls_div
  .append( $("<label>") 
    .text("Data displayed")
  .append( $('<div>')
  .attr("class", 'field')
  .append( $('<div>')
  .attr("class", 'select')
  .append( $('<select>')
    .attr("onchange", "updateField(this.options[this.selectedIndex].value)") ))));
  var field_select_div = $('.field select')
    .append($("<option></option>")
    .attr("value", 'all')
    .attr("selected", true)
    .attr("disabled", true)
    .text('All'));
  $.each(table_fields, function(index, year) {
    field_select_div
      .append($("<option></option>")
      .attr("value", year)
      .text(year));
   });
}

// Prepare tooltip div
/*
var tooltipDiv = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

function mouseOver(d) {
  //console.log("d ", d);
  //tooltipDiv.html(glossary[this.text])  
  tooltipDiv.html('hi there')  
      .style("left", (d3.event.pageX) + "px")     
      .style("top", (d3.event.pageY - 28) + "px");
  tooltipDiv.transition()
      .duration(100)
      .style("opacity", 1);
}

function mouseOut() {
  tooltipDiv.transition()
      .duration(100)
      .style("opacity", 0);
}

function mouseMove() {
  tooltipDiv
      .text(d3.event.pageX + ", " + d3.event.pageY)
      .style("left", (d3.event.pageX - 34) + "px")
      .style("top", (d3.event.pageY - 12) + "px");
}
*/

////////// Update functions //////////
function updateName(name) {
  cfg.name = name;
  cfg.year = "all";
  cfg.field = "all";
  jQuery('.field select').val('all');
  jQuery('.year select').val('all');
  cfg.tableType = 'name';
  updateTable();
}

function updateYear(year) {
  cfg.name = "all";
  cfg.year = year;
  cfg.field = "all";
  jQuery('.field select').val('all');
  jQuery('.name select').val('all');
  cfg.tableType = 'year';
  updateTable();
}

function updateField(field) {
  cfg.name = "all";
  cfg.year = "all";
  cfg.field = field;
  jQuery('.name select').val('all');
  jQuery('.year select').val('all');
  cfg.tableType = 'field';
  updateTable();
}

// Format numbers with commas
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function format(val) {
  if (!isNumber(val)) {
    return val;
  }
  else {
    var val_str = val.toString();
    var val_str_len = val_str.length;
    var period_pos = val_str.indexOf(".");
    if (period_pos < 0)
      period_pos = val_str_len;

    for (pos = period_pos - 3; pos > 0; pos = pos - 3) {
      val_str = val_str.slice(0, pos) + "," + val_str.slice(pos);
    }
    return val_str;
  }
}

// See datatables.net/plug-ins/sorting#how_to_data_source
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
    "formatted-num-pre": function ( a ) {
        a = (a === "-" || a === "") ? -999999999999 : a.replace( /[^\d\-\.]/g, "" );
        return parseFloat( a );
    },
 
    "formatted-num-asc": function ( a, b ) {
        return a - b;
    },
 
    "formatted-num-desc": function ( a, b ) {
        return b - a;
    }
} );

////////// Table //////////
function updateTable() {
    //var apihost = "http://mt-local-gov-data.appspot.com";
    var apihost = "http://lgc-localgovdata.rhcloud.com";
    var request = "/data/json/" + category + "/";
    request += escape(cfg.name) + "/year/" + escape(cfg.year) + "/fields/" + escape(cfg.field);
    var url = apihost + request;
    //console.log("url ", url);
    jQuery('#chart').html( '<table id="visualization"></table>' );

    jQuery.ajax( {
        "url": url,
        "success": myCallback,
        "dataType": "json"
    } );

    function myCallback( data ) {
        //console.log("data", data);
        var years = d3.keys(data).map(function(d) {return +d;}).sort();
        //console.log("years: ", years);
        var names = d3.keys(data[years[0]]);
        //console.log("names: ", names);

        var not_available = '<i>NA</i>';
        var cols = [];
        var tableData = [];
        switch (cfg.tableType) {
            case 'year':
                labels = table_fields.slice(0);
                labels.unshift(name_label);
                labels.forEach(function(label) {
                    if ($.inArray(label, numeric_fields) != -1) {
                      cols.push({"sTitle" : label, "mData" : label, "sType": "formatted-num"});
                    }
                    else {
                      cols.push({"sTitle" : label, "mData" : label});
                    }
                } );

                var year = years[0];
                names.forEach(function(name) {
                    var rowData = new Object();
                    labels.forEach(function(label) {
                        // 'City' or 'County' label may be missing
                        if (label == name_label)
                            rowData[label] = name;
                        else if (data[year][name] && data[year][name][label])
                            rowData[label] = format(data[year][name][label]);
                        else
                            rowData[label] = not_available;
                    });
                    tableData.push(rowData);
                } );
                break;

            case 'name':
                cols.push({"sTitle" : "Data Item", "mData" : "Data Item"});
                years.forEach(function(year) {
                    cols.push({"sTitle" : year.toString(), "mData" : year.toString()});
                } );

                var name = names[0];
                // Remove label 'County'
                labels = table_fields.slice(1);
                labels.forEach(function(label) {
                    var rowData = new Object();
                    rowData['Data Item'] = label;
                    years.forEach(function(year) {
                        if (data[year][name] && data[year][name][label])
                            rowData[year] = format(data[year][name][label]);
                        else
                            rowData[year] = not_available;
                    });
                    tableData.push(rowData);
                } );
                break;

            case 'field':
                cols.push({"sTitle" : name_label, "mData" : name_label});
                years.forEach(function(year) {
                    cols.push({"sTitle" : year.toString(), "mData" : year.toString()});
                } );

                names.forEach(function(name) {
                    var rowData = new Object();
                    rowData[name_label] = name;
                    years.forEach(function(year) {
                        if (data[year][name] && data[year][name][cfg.field])
                            rowData[year] = format(data[year][name][cfg.field]);
                        else
                            rowData[year] = not_available;
                    });
                    tableData.push(rowData);
                } );
                break;
            default:
        }

        // Set table height so headers remain visible when y-scrolling
        var tableHeight = Math.floor(0.67 * $(window).height());

        var myTableObject = {
            "aaData" : tableData,
            "aoColumns" : cols,
            "bDestroy" : true,
            "bPaginate" : false,
            "sScrollY" : tableHeight,
            "sScrollX": "100%",
            "sDom": '<"top">C<"clear">T<"clear">lrtip<"clear">',
            //"sDom": '<"top">C<"clear">t<"clear">T<"clear">lfrtip<"clear">',
            //"sDom": '<"top">C<"clear">t<"bottom"i><"clear">',
            "oColVis": { "aiExclude": [ 0 ] },
            "oTableTools": {
              "sRowSelect": "multi",
              "aButtons": [ "select_all", "select_none",
                            { "sExtends": "copy", "bSelectedOnly": "true" },
                            { "sExtends": "csv", "bSelectedOnly": "true" },
                            { "sExtends": "print", "bSelectedOnly": "true" }
                          ]
            }
        };
        if (cfg.tableType == 'name')
            myTableObject["bSort"] = false;

        //console.log("cols: ", cols);
        //console.log("myTableObject: ", myTableObject);

        var thetable = jQuery('#visualization').dataTable( myTableObject );
        new jQuery.fn.dataTable.FixedColumns( thetable );

        jQuery('#visualization tr').click( function() {
            jQuery(this).toggleClass('row-selected');
        } );

        // Show definitions on hover over column labels
        d3.selectAll(".sorting")
          .on("mouseover", glossMouseOver)
          .on("mouseout", glossMouseOut);
    }; // myCallback()

}; // updateTable()

jQuery(document).ready(function() {
  jQuery.support.cors = true;
  buildControls();
  updateTable();
} ); // end document.ready

function fnShowHide( iCol )
{
    var oTable = jQuery('#visualization').dataTable();
    var bVis = oTable.fnSettings().aoColumns[iCol].bVisible;
    oTable.fnSetColumnVis( iCol, bVis ? false : true );
    var fill = bVis ? "&#9633;" : "&#9632";
    jQuery('#t' + iCol).html(fill);
    //jQuery('#0').css("background-color", "#888");
}
