// ---
// LED Cube JS
//
// @author Nat Zimmermann <hi@natzim.xyz>
// ---

var settings = {
    cube: {
        size: 8,
        leds: {
            defaultColor: 0xffffff,
            size: 0.3,
            opacity: 0.5
        },
        highlight: {
            size: 0.5
        }
    },
    canvas: {
        width: 500,
        height: 500,
        parentElement: document.getElementById('3d-cube')
    }
};

// ---
// Classes
// ---

var Led = function(object) {
    this.object = object;
};

Led.prototype.getColor = function() {
    return this.object.material.color.getHex();
}

Led.prototype.setColor = function(hex) {
    this.object.material.color.setHex(hex);
};

Led.prototype.select = function() {
    highlight.position.copy(this.object.position);
    setPositionInput(this.object.position);
    showLedOptions();
};

// ---
// Functions
// ---

/**
 * Turn a hex number into a string.
 *
 * @param  {number} hex
 * @return {string}
 */
function hexToString(hex) {
    hex = hex.toString(16).toUpperCase();
    return "000000".substr(0, 6 - hex.length) + hex;
}

/**
 * Turn a string into a hex number.
 *
 * @param  {string} string
 * @return {number}
 */
function stringToHex(string) {
    return parseInt(string, 16);
}

/**
 * Get an LED by position object.
 *
 * @param  {THREE.Vector3} position
 * @return {Led}
 */
function getLed(position) {
    return leds[position.x][position.y][position.z];
}

/**
 * Set the position input.
 *
 * @param {THREE.Vector3} position
 */
function setPositionInput(position) {
    $('#x').val(position.x);
    $('#y').val(position.y);
    $('#z').val(position.z);
}

/**
 * Get the position input.
 *
 * @return {THREE.Vector3}
 */
function getPositionInput() {
    return new THREE.Vector3(
        $('#x').val(),
        $('#y').val(),
        $('#z').val()
    );
}

/**
 * Generate a cube of LEDs.
 *
 * @param  {number} size
 * @return {Led[][][]}
 */
function generateCube(size) {
    var leds = [];

    // Construct LED geometry
    var geometry = new THREE.BoxGeometry(
        settings.cube.leds.size,
        settings.cube.leds.size,
        settings.cube.leds.size
    );

    for (var i = 0; i < Math.pow(size, 3); i++) {
        // Construct LED material
        var material = new THREE.MeshBasicMaterial({
            color: settings.cube.leds.defaultColor,
            transparent: true,
            opacity: settings.cube.leds.opacity
        });

        // Construct LED mesh
        var led = new THREE.Mesh(geometry, material);

        // Calculate co-ordinates
        var x = Math.floor(i / size) % size;
        var y = Math.floor(i / Math.pow(size, 2));
        var z = i % size;

        led.position.set(x, y, z);

        // Generate 3D array on the fly
        if (!leds[x]) {
            leds[x] = [];
        }
        if (!leds[x][y]) {
            leds[x][y] = [];
        }

        // Store new LED in array
        leds[x][y][z] = new Led(led);

        // Add LED to the scene
        scene.add(led);
    }

    return leds;
}

/**
 * Generate a highlighter object.
 */
function generateHighlight() {
    var geometry = new THREE.BoxGeometry(
        settings.cube.highlight.size,
        settings.cube.highlight.size,
        settings.cube.highlight.size
    );

    var material = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0xff0000,
        opacity: 0.5
    });

    var highlight = new THREE.Mesh(geometry, material);

    scene.add(highlight);

    return highlight;
}

/**
 * Save LED options from input.
 */
function saveLedOptions() {
    var position = getPositionInput();

    var color = stringToHex($('#color').val());

    getLed(position).setColor(color);
}

/**
 * Display LED options when changing selected LED.
 */
function showLedOptions() {
    var position = getPositionInput();

    var hex = hexToString(getLed(position).getColor());

    $('#color').val(hex);
}

// ---
// Event listeners
// ---

$('#color').change(saveLedOptions);

$('#x, #y, #z').change(function() {
    var position = getPositionInput();

    getLed(position).select();

    showLedOptions();
});

$(document).click(function(e) {
    // Calculate the mouse vector in relation to the canvas
    var mouse = new THREE.Vector2(
        ((e.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1,
        -((e.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1
    );

    var raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(mouse, camera);

    // Find the first intersecting object
    var selected = raycaster.intersectObjects(scene.children)[0];

    if (!selected) {
        return;
    }

    getLed(selected.object.position).select();
});

// ---
// Main
// ---

// Calculate center co-ordinates
// This is used for the center of focus for the camera
var center = settings.cube.size / 2 - 0.5;
var centerVector = new THREE.Vector3(center, center, center);

// Generate scene
var scene = new THREE.Scene();

// Generate camera and set position
var camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.copy(centerVector);
camera.position.z *= 4;

// Generate renderer and set canvas size
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(settings.canvas.width, settings.canvas.height);

// Add canvas to DOM
settings.canvas.parentElement.appendChild(renderer.domElement);

// Enable camera controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enableKeys = false;
controls.target.copy(centerVector);
controls.update();

var leds = generateCube(settings.cube.size);
var highlight = generateHighlight();
showLedOptions();

// ---
// Render loop
// ---

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();

