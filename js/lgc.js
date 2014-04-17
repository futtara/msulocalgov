//--- For glossary ---//

var glossaryDiv = document.getElementById('glossary');
var glossary = [];
var glossArray = [];

///// Full glossary overlay /////

function buildGlossaryButton() {
  console.log("Building button");
  $("#main")
  .prepend( $("<div>")
  .attr("id", "glossary-button")
  .html("View Glossary")
  .attr("onclick", "toggleGlossary(event)"));
}

function buildGlossary() {
  buildGlossaryButton();

  function writeGlossary(d) {
    // Fill arrays for full glossary and each gloss
    var dlen = d.length;
    for (j = 0; j < dlen; j++) {
      glossArray.push([d[j].term, d[j].description]);
      glossary[d[j].term] = d[j].description;
    }
    console.log("glossary ", glossary);

    // Fill glossary data into html
    var glossaryHtml = function(d) {
      var html = '<div class="term">' + d[0] + '</div>';
      html    += '<div class="description">' + d[1] + '</div>';
      return html;
    }
    var g = d3.select("#glossary").selectAll("div")
      .data(glossArray)
      .enter().append("div")
      .attr("class", "glossary-item")
      .html(function(d) { return glossaryHtml(d); });
    console.log("g ", g);
  }

  // Get and parse the glossary data
  var url = "/data/glossary.csv";
  d3.csv(url, writeGlossary);
}

function hideGlossary() {
  console.log("hideGlossary");
  if(glossaryDiv.style.display == "inline-block") {
    glossaryDiv.setAttribute("style","display:none");
    $("#glossary-button").html("View<br />Glossary");
  }
}
// Prevent event from bubbling up and hiding glossary
function handleGlossaryClick(event) {
  event.stopImmediatePropagation();
}
function toggleGlossary(event) {
  if(glossaryDiv.style.display == "inline-block") {
    hideGlossary();
  } else {
    glossaryDiv.style.display = "inline-block";
    $("#glossary-button").html("Close<br />Glossary");
    event.stopImmediatePropagation();
  }
}

///// Single gloss /////
function glossMouseOver() {
  if (glossary[this.innerHTML]) {
    d3.select("#gloss")
      //.style("opacity", 0)
      .html(glossary[this.innerHTML])  
      .transition()
      .duration(100)
      .style("display", "inline-block");
      //.style("opacity", 1);
  }
}

function glossMouseOut() {
  d3.select("#gloss").transition()
      .duration(100)
      .style("display", "none");
      //.style("opacity", 0);
}

buildGlossary();

// Clear glossary if click outside it
$("body").click(hideGlossary);
$("#glossary").click(handleGlossaryClick);

//--- End of glossary ---//

$(document).ready(function() {
  
  window.scrollTo(0, 1);
  
  $('.js #menu-toggle').click(function (e) {
    $('body').toggleClass('active');
    e.preventDefault();
    });
    
});
