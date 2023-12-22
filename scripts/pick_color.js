
var colors = ['blue', 'green', 'orange', 'red'];

  var color = colors.shift();
  colors.push(color);
  return '<div id="color-demo" hx-get="scripts/pick_colors.js" hx-swap="outerHTML" class="smooth" hx-trigger="every 1s" style="color:' + color + '">\n'+
         '  Color Swap Demo\n'+
         '</div>\n'
;
