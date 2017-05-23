if(window.addEventListener) {
window.addEventListener('load', function () {
  var canvas, context, canvaso, contexto;
  // The active tool instance.
  var tool;
  var tool_default = 'pencil';
  var linewidth_default = 'lw1';
  var color_default = 'black';

  function init () {
    //Create Grid View
    var canvasGrid, contextGrid;
    canvasGrid = document.getElementById('gridView');
    contextGrid = canvasGrid.getContext('2d');
    contextGrid.beginPath();
    for (x = 0; x < canvasGrid.width; x += 25) {
      contextGrid.moveTo(x, 0);
      contextGrid.lineTo(x, canvasGrid.height);
      contextGrid.stroke();
    }
    for (y = 0; y < canvasGrid.height; y += 25) {
      contextGrid.moveTo(0, y);
      contextGrid.lineTo(canvasGrid.width, y);
      contextGrid.stroke();
    }
    contextGrid.closePath();
    canvasGrid.style.visibility = "hidden";
    var gridOn = false;
    // Show/Hide Grid
    $("#gridSwitch").click(function () {
      if (gridOn) {
        gridOn = false;
        $("#gridSwitch").attr('src', 'images/off.png');
        canvasGrid.style.visibility = "hidden";
      }
      else {
        gridOn = true;
        $("#gridSwitch").attr('src', 'images/on.png');
        canvasGrid.style.visibility = "visible";
      }
    });
    // Find the canvas element.
    canvaso = document.getElementById('imageView');

    if (!canvaso) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvaso.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }

    // Get the 2D canvas context.
    contexto = canvaso.getContext('2d');
    if (!contexto) {
      alert('Error: failed to getContext!');
      return;
    }

    // Add the temporary canvas.
    var container = canvaso.parentNode;
    canvas = document.createElement('canvas');
    if (!canvas) {
      alert('Error: Cannot create a new canvas element!');
      return;
    }

    canvas.id     = 'imageTemp';
    canvas.width  = canvaso.width;
    canvas.height = canvaso.height;
    container.appendChild(canvas);

    context = canvas.getContext('2d');

    // Get the linewidth select input.
    var lw_select = document.getElementById('linewidth');
    if (!lw_select) {
      alert('Error: failed to get the linewidth element!');
      return;
    }
    lw_select.addEventListener('change', ev_lw_change, false);
    // Activate the default linewidth.
    if (linewidths[linewidth_default]) {
      linewidth = new linewidths[linewidth_default]();
      lw_select.value = linewidth_default;
    }

    // Get the tool select input.
    var tool_select = document.getElementById('dtool');
    if (!tool_select) {
      alert('Error: failed to get the dtool element!');
      return;
    }
    tool_select.addEventListener('change', ev_tool_change, false);

    // Activate the default tool.
    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      tool_select.value = tool_default;
    }


    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
    canvas.addEventListener('mouseout',  ev_canvas, false);
  }

  // The general-purpose event handler. This function just determines the mouse
  // position relative to the canvas element.
  function ev_canvas (ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }

  // The event handler for any changes made to the tool selector.
  function ev_tool_change (ev) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
    }
  }
  // The event handler for any changes made to the linewidth selector.
  function ev_lw_change (ev) {
    if (linewidths[this.value]) {
      linewidth = new linewidths[this.value]();
    }
  }


  // Ve lai vao canvaso va xoa canvas
  function img_update () {
		contexto.drawImage(canvas, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
  }
  // Line width container
  var linewidths = {};
  linewidths.lw1 = function() {
    context.lineWidth = 1;
  }
  linewidths.lw5 = function() {
    context.lineWidth = 5;
  }
  linewidths.lw10 = function() {
    context.lineWidth = 10;
  }
  linewidths.lw15 = function() {
    context.lineWidth = 15;
  }
  // This object holds the implementation of each drawing tool.
  var tools = {};

  // The drawing pencil.
  tools.pencil = function () {
    var tool = this;
    this.started = false;


    this.mousedown = function (ev) {
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    this.mousemove = function (ev) {
      if (tool.started) {
        context.lineTo(ev._x, ev._y);
        context.stroke();
      }
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
    this.mouseout = function (ev) {
      if (tool.started) {
        tool.started = false;
        img_update();
      }
    };
  };
  // The right triangle tool.
  tools.triangleR = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      var x1 = tool.x0,
          y1 = ev._y,
          x2 = ev._x,
          y2 = ev._y;

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(tool.x0, tool.y0 - context.lineWidth / 3);
      context.lineTo(tool.x0, ev._y);
      context.lineTo(ev._x, ev._y);
      context.lineTo(tool.x0, tool.y0);
      context.stroke();
      context.closePath();

    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
    this.mouseout = function (ev) {
      if (tool.started) {
        tool.started = false;
        img_update();
      }
    };
  };
  // The isosceles triangle tool.
  tools.triangleI = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      x0 = ev._x;
      y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      var x1 = Math.round((x0 + ev._x)/2),
          y1 = ev._y,
          x2 = ev._x,
          y2 = y0;

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.lineTo(x2, y2);
      context.lineTo(x0, y0);
      context.stroke();
      context.closePath();

    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
    this.mouseout = function (ev) {
      if (tool.started) {
        tool.started = false;
        img_update();
      }
    };
  };
  // The rectangle tool.
  tools.rect = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      var x = Math.min(ev._x,  tool.x0),
          y = Math.min(ev._y,  tool.y0),
          w = Math.abs(ev._x - tool.x0),
          h = Math.abs(ev._y - tool.y0);

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (!w || !h) {
        return;
      }

      context.strokeRect(x, y, w, h);
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
    this.mouseout = function (ev) {
      if (tool.started) {
        tool.started = false;
        img_update();
      }
    };
  };
  // The circle tool
  tools.circle = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }
      context.beginPath();
      var radius = Math.round(Math.sqrt((ev._x - tool.x0) * (ev._x - tool.x0) + ((ev._y - tool.y0) * (ev._y - tool.y0))));
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.arc(tool.x0, tool.y0, radius, 0, 2 * Math.PI);
      context.stroke();
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
    this.mouseout = function (ev) {
      if (tool.started) {
        tool.started = false;
        img_update();
      }
    };
  };

  // The line tool.
  tools.line = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(tool.x0, tool.y0);
      context.lineTo(ev._x,   ev._y);
      context.stroke();
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
    this.mouseout = function (ev) {
      if (tool.started) {
        tool.started = false;
        img_update();
      }
    };
  };

  // The eraser tool.
  tools.eraser = function () {
    var tool = this;
    this.started = false;


    this.mousedown = function (ev) {
        context.beginPath();
        context.strokeStyle = '#FFFFFF';
        context.moveTo(ev._x, ev._y);
        tool.started = true;
    };


    this.mousemove = function (ev) {
      if (tool.started) {
        context.lineTo(ev._x, ev._y);
        context.stroke();
      }
    };


    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        context.closePath();
        img_update();
      }
    };
    this.mouseout = function (ev) {
      if (tool.started) {
        tool.started = false;
        img_update();
      }
    };
  };
// ------------- Color Module ------------
  function SetColor(id) { // Set the color of the drawing tool when a color swatch is clicked

     context.strokeStyle = document.getElementById(id).style.backgroundColor;
  }
  var colorPalette = [ //Begin array of color table hex color codes.

"#000000","#000000","#000000","#000000","#003300","#006600","#009900","#00CC00","#00FF00","#330000","#333300","#336600","#339900","#33CC00","#33FF00","#660000","#663300","#666600","#669900","#66CC00","#66FF00",

"#000000","#333333","#000000","#000033","#003333","#006633","#009933","#00CC33","#00FF33","#330033","#333333","#336633","#339933","#33CC33","#33FF33","#660033","#663333","#666633","#669933","#66CC33","#66FF33",

"#000000","#666666","#000000","#000066","#003366","#006666","#009966","#00CC66","#00FF66","#330066","#333366","#336666","#339966","#33CC66","#33FF66","#660066","#663366","#666666","#669966","#66CC66","#66FF66",

"#000000","#999999","#000000","#000099","#003399","#006699","#009999","#00CC99","#00FF99","#330099","#333399","#336699","#339999","#33CC99","#33FF99","#660099","#663399","#666699","#669999","#66CC99","#66FF99",

"#000000","#CCCCCC","#000000","#0000CC","#0033CC","#0066CC","#0099CC","#00CCCC","#00FFCC","#3300CC","#3333CC","#3366CC","#3399CC","#33CCCC","#33FFCC","#6600CC","#6633CC","#6666CC","#6699CC","#66CCCC","#66FFCC",

"#000000","#FFFFFF","#000000","#0000FF","#0033FF","#0066FF","#0099FF","#00CCFF","#00FFFF","#3300FF","#3333FF","#3366FF","#3399FF","#33CCFF","#33FFFF","#6600FF","#6633FF","#6666FF","#6699FF","#66CCFF","#66FFFF",

"#000000","#FF0000","#000000","#990000","#993300","#996600","#999900","#99CC00","#99FF00","#CC0000","#CC3300","#CC6600","#CC9900","#CCCC00","#CCFF00","#FF0000","#FF3300","#FF6600","#FF9900","#FFCC00","#FFFF00",

"#000000","#00FF00","#000000","#990033","#993333","#996633","#999933","#99CC33","#99FF33","#CC0033","#CC3333","#CC6633","#CC9933","#CCCC33","#CCFF33","#FF0033","#FF3333","#FF6633","#FF9933","#FFCC33","#FFFF33",

"#000000","#0000FF","#000000","#990066","#993366","#996666","#999966","#99CC66","#99FF66","#CC0066","#CC3366","#CC6666","#CC9966","#CCCC66","#CCFF66","#FF0066","#FF3366","#FF6666","#FF9966","#FFCC66","#FFFF66",

"#000000","#FFFF00","#000000","#990099","#993399","#996699","#999999","#99CC99","#99FF99","#CC0099","#CC3399","#CC6699","#CC9999","#CCCC99","#CCFF99","#FF0099","#FF3399","#FF6699","#FF9999","#FFCC99","#FFFF99",

"#000000","#00FFFF","#000000","#9900CC","#9933CC","#9966CC","#9999CC","#99CCCC","#99FFCC","#CC00CC","#CC33CC","#CC66CC","#CC99CC","#CCCCCC","#CCFFCC","#FF00CC","#FF33CC","#FF66CC","#FF99CC","#FFCCCC","#FFFFCC",

"#000000","#FF00FF","#000000","#9900FF","#9933FF","#9966FF","#9999FF","#99CCFF","#99FFFF","#CC00FF","#CC33FF","#CC66FF","#CC99FF","#CCCCFF","#CCFFFF","#FF00FF","#FF33FF","#FF66FF","#FF99FF","#FFCCFF","#FFFFFF"

];
 // Handles showing/hiding the color table
   $("#colorTable").hide();

   $("#colorPick").click(function() {
   $("#colorTable").show();
   LoadColorTable();
   });
   $(document).click(function() {
   $("#colorTable").hide();

   });
   $("#colorPick").click(function(event) {
   event.stopPropagation();
   });

function LoadColorTable() { // Populate the color picker table with colors specified in the 'colorPalette' array
   $("div").removeClass("color");
   for (i = 0; i < colorPalette.length; i++) {
   var colorDiv = document.createElement("div");
   colorDiv.className = "color";
   colorDiv.id = "colorSwatch" + i;
   colorDiv.style.backgroundColor = colorPalette[i];

   document.getElementById("colorTable").appendChild(colorDiv);

   };
   $(".color").click(function () {
     context.strokeStyle = this.style.backgroundColor;
     $("#currentColor").css('background-color', this.style.backgroundColor);
   });
}
// ------- End Color -----------


// ------- Clear Module --------
$("#clear").click(function() {
  contexto.clearRect(0, 0, canvaso.width, canvaso.height);
});
// ------- End Clear Module ----

  init();

}, false); }


// save images to local disk on Chrome Browser
function saveImage() {
		var x = window.navigator.userAgent;

		if (x.indexOf("Chrome") > 0) {
      var canvaso = document.getElementById("imageView");
			// save image without file type
			//document.location.href = canvaso.toDataURL("image/png").replace("image/png", "image/octet-stream");
			// save image as png
			var link = document.createElement('a');
				link.download = "Untitled.png";
				link.href = canvaso.toDataURL("image/png").replace("image/png", "image/octet-stream");
				link.click();
		}
		else {
			alert("Please use Chrome");
		}
}
