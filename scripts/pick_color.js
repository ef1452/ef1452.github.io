var colors = ['blue', 'green', 'orange', 'red'];

function pickColor() {
  var color = colors.shift();
  colors.push(color);
  
  var colorDemo = document.getElementById('color-demo');
  if (colorDemo) {
    colorDemo.style.color = color;
    colorDemo.innerHTML = 'Color Swap Demo';
  }
}

// Trigger the pickColor function on page load
pickColor();