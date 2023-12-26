function elt(name, attributes) {
    var node = document.createElement(name);
    if (attributes) {
        for (var attr in attributes)
            if (attributes.hasOwnProperty(attr))
                node.setAttribute(attr, attributes[attr]);
    }
    for (var i = 2; i < arguments.length; i++){
        var child = arguments[i];
        if (typeof child == "string")
            child = document.createTextNode(child);
        node.appendChild(child);
    }
    return node;
}

var controls = Object.create(null);

function createPaint(parent) {
    console.log("createPaint executed");
    var canvas = elt("canvas", {class: "paint-canvas", width: "732", height: "500"});
    var cx = canvas.getContext("2d");
    cx.fillStyle = "white";
    cx.fillRect(0,0,canvas.width, canvas.height);
    var toolbar = elt("div", {class: "toolbar"});
    clearOnTripleClick(canvas, cx);
    for (var name in controls)
        toolbar.appendChild(controls[name](cx));

    var panel = elt("div", {class: "picturepanel"}, canvas);
    parent.appendChild(elt("div", null, panel, toolbar));

    return canvas; // Return the reference to the canvas element
}

var tools = Object.create(null);

controls.tool = function(cx) {
    var select = elt("select");
    for (var name in tools)
        select.appendChild(elt("option", null, name));

        cx.canvas.addEventListener("mousedown", function(event){
            if (event.which == 1){
                tools[select.value](event, cx);
                event.preventDefault();
            }
        });
        return elt("span", null, "Tool: ", select)
}

function relativePos(event, element) {
    var rect = element.getBoundingClientRect();
    return {x: Math.floor(event.clientX - rect.left),
            y: Math.floor(event.clientY - rect.top)};
}

function trackDrag(onMove, onEnd) {
    function end(event) {
        removeEventListener("mousemove", onMove);
        removeEventListener("mouseup", end);
        if (onEnd)
            onEnd(event);
    }
    addEventListener("mousemove", onMove);
    addEventListener("mouseup", end);
}

function clearOnTripleClick(canvas, cx){
    var clickCount = 0;
    canvas.addEventListener('mousedown', function (event){
        clickCount++;
    if(event.detail === 3){
        clearCanvas(cx, canvas);
        clickCount = 0;
        cx.fillStyle = "white";
        cx.fillRect(0,0,canvas.width, canvas.height);
    }
    
    });

}

function clearCanvas(cx, canvas){
    cx.clearRect(0,0, canvas.width, canvas.height);
}
tools.Line = function(event, cx, onEnd){
    cx.lineCap = "round";

var pos = relativePos(event, cx.canvas);
trackDrag(function(event){
    cx.beginPath();
    cx.moveTo(pos.x, pos.y);
    pos = relativePos(event, cx.canvas);
    cx.lineTo(pos.x, pos.y);
    cx.stroke();
}, onEnd);
};

tools.Erase = function(event, cx){
    cx.globalCompositeOperation = "destination-out";
    tools.Line(event, cx, function(){
        cx.globalCompositeOperation = "source-over";
    });
}
var currentColor = "black"
controls.color = function(cx) {
    var input = elt("input", {type: "color"});
    input.addEventListener("input", function() {
        currentColor = input.value;
        cx.fillStyle = input.value;
        cx.strokeStyle = input.value;
    });
    return elt("span", null, "Color: ", input);
};

controls.brushSize = function(cx) {
    var select = elt("select");
    var sizes = [1, 2, 3, 5, 8, 12, 25, 35, 50, 75, 100];
    sizes.forEach(function(size){
        select.appendChild(elt("option", {value: size}, size + " pixels"));
    });
    select.addEventListener("change", function(){
        cx.lineWidth = select.value;
    });
    return elt("span", null, "Brush size: ", select);
};

controls.save = function(cx) {
    var link  = elt("a", {href: "/"}, "Save");
    function update(){
        try{
            link.href = cx.canvas.toDataURL();
        } catch (e) {
            if (e instanceof SecurityError)
            link.href = "javascript:alert(" + 
            JSON.stringify("Can't save: " + e.toString()) + ")";
            else
                throw e;
        }
    }
    link.addEventListener("mouseover", update);
    link.addEventListener("focus", update);
    return link;
};

tools.Text = function(event,cx) {
    var text = prompt("Text:", "");
    if (text) {
        var pos = relativePos(event, cx.canvas);
        cx.font = Math.max(7, cx.lineWidth) + "px sans-serif";
        cx.fillText(text, pos.x, pos.y);
    }
};

function randomPointInRadius(radius){
    for (;;){
        var x = Math.random() * 2 - 1;
        var y = Math.random() * 2 - 1;
        if (x * x + y * y <= 1)
            return {x: x * radius, y: y * radius};
    }
}

tools.Spray = function (event, cx) {
    var radius = cx.lineWidth / 2;
    var area = radius * radius * Math.PI;
    var dotsPerTick = Math.ceil(area / 30);

    // Create a gradient that fades out from the center of the spray
    var gradient = cx.createRadialGradient(0, 0, 0, 0, 0, radius);
    cx.fillStyle = currentColor;
    gradient.addColorStop(0, cx.fillStyle);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    // Set both fillStyle and strokeStyle
    cx.fillStyle = gradient;
    cx.strokeStyle = gradient;

    function sprayAt(pos) {
        for (var i = 0; i < dotsPerTick; i++) {
            var offset = randomPointInRadius(radius);
            cx.fillRect(pos.x + offset.x, pos.y + offset.y, 1, 1);
        }
    }

    function moveSpray(event) {
        var currentPos = relativePos(event, cx.canvas);
        cx.save();
        cx.translate(currentPos.x, currentPos.y);
        sprayAt({ x: 0, y: 0 });
        cx.restore();
    }

    cx.canvas.addEventListener('mousemove', moveSpray);

    // Stop the spray when mouse is released
    function stopSpray() {
        cx.canvas.removeEventListener('mousemove', moveSpray);
        clearInterval(spray);
        // Restore the original fill style after the spray is complete
        cx.fillStyle = gradient;
        cx.strokeStyle = gradient;  // Add this line
    }

    cx.canvas.addEventListener('mouseup', stopSpray);

    // Set up continuous spray while mouse is down
    var spray = setInterval(function () {
        // Pass the current event to moveSpray
        moveSpray(event);
    }, 20000);
};
