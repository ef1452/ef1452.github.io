var colors = ['blue', 'green', 'orange', 'red'];

document.addEventListener('DOMContentLoaded', function () {
  // Initial color
  var color = colors[0];
  
  // Set up the color-demo div
  var colorDemo = document.getElementById('color-demo');
  if (colorDemo) {
    colorDemo.style.color = color;
    colorDemo.innerHTML = 'I made this';

    // Define the htmx handler for the /colors endpoint
    htmx.on('htmx:afterRequest', function (event) {
    
      if (event.detail.xhr.responseURL.endsWith('/colors')) {
        // Update the color after the request
        color = colors.shift();
        colors.push(color);
        colorDemo.style.color = color;
      }
    });
  }
});
