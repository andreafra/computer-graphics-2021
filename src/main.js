import "./style.css";
// Import TWGL.js, a utility library to avoid boilerplate WebGL code.
//import * as twgl from "twgl.js";

// Import example dependencies
import { cube } from "./assets/cubeDefinition";
import utils from "./utils/utils";

// Import Shaders
import vertexShaderSource from "./shaders/example/vs.glsl";
import fragmentShaderSource from "./shaders/example/fs.glsl";

// Get WebGL context
const gl = document.getElementById("main-canvas").getContext("webgl2");

var projectionMatrix,
	perspectiveMatrix,
	viewMatrix,
	worldMatrix,
	vao,
	matrixLocation;
var lastUpdateTime = new Date().getTime();
//Camera parameters
var cx = 0.5;
var cy = 0.0;
var cz = 1.0;
var elevation = 0.0;
var angle = -30.0;

var delta = 0.1;
var flag = 0;

//Cube parameters
var cubeTx = 0.0;
var cubeTy = 0.0;
var cubeTz = -1.0;
var cubeRx = 0.0;
var cubeRy = 0.0;
var cubeRz = 0.0;
var cubeS = 0.5;

// Get a WebGL context
if (!gl) {
	console.error("GL context not opened");
}
utils.resizeCanvasToDisplaySize(gl.canvas);

//use this aspect ratio to keep proportions
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0);

gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

// create GLSL shaders, upload the GLSL source, compile the shaders and link them
var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader = utils.createShader(
	gl,
	gl.FRAGMENT_SHADER,
	fragmentShaderSource
);
var program = utils.createProgram(gl, vertexShader, fragmentShader);

// look up where the vertex data needs to go.
var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
var colorAttributeLocation = gl.getAttribLocation(program, "a_color");
matrixLocation = gl.getUniformLocation(program, "matrix");

perspectiveMatrix = utils.MakePerspective(
	90,
	gl.canvas.width / gl.canvas.height,
	0.1,
	100.0
);

// Create a vertex array object (attribute state)
vao = gl.createVertexArray();

// and make it the one we're currently working with
gl.bindVertexArray(vao);
// Create a buffer and put three 2d clip space points in it
var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.vertices), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.colors), gl.STATIC_DRAW);
gl.enableVertexAttribArray(colorAttributeLocation);
gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);

var indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(
	gl.ELEMENT_ARRAY_BUFFER,
	new Uint16Array(cube.indices),
	gl.STATIC_DRAW
);

drawScene();

function animate() {
	var currentTime = new Date().getTime();
	if (lastUpdateTime) {
		var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;
		cubeRx += deltaC;
		cubeRy -= deltaC;
		cubeRz += deltaC;

		if (flag == 0) cubeS += deltaC / 100;
		else cubeS -= deltaC / 100;

		if (cubeS >= 1.5) flag = 1;
		else if (cubeS <= 0.5) flag = 0;
	}
	worldMatrix = utils.MakeWorld(
		cubeTx,
		cubeTy,
		cubeTz,
		cubeRx,
		cubeRy,
		cubeRz,
		cubeS
	);
	lastUpdateTime = currentTime;
}

function drawScene() {
	animate();

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.useProgram(program);

	// Bind the attribute/buffer set we want.
	gl.bindVertexArray(vao);

	var viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);

	var projectionMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
	var projectionMatrix = utils.multiplyMatrices(
		perspectiveMatrix,
		projectionMatrix
	);

	gl.uniformMatrix4fv(
		matrixLocation,
		gl.FALSE,
		utils.transposeMatrix(projectionMatrix)
	);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);
	window.requestAnimationFrame(drawScene);
}
