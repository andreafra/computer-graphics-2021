import {
	indexData,
	initSphere,
	normalData,
	vertexPositionData,
} from "./assets/shapesDefinition";
import { Node } from "./SceneGraph";
import fragmentShaderSrc from "./shaders/scene-graph-example/fs.glsl";
import vertexShaderSrc from "./shaders/scene-graph-example/vs.glsl";
import "./style.css";
import utils from "./utils/utils";

function main(gl, program) {
	var dirLightAlpha = -utils.degToRad(-60);
	var dirLightBeta = -utils.degToRad(120);
	var directionalLight = [
		Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
		Math.sin(dirLightAlpha),
		Math.cos(dirLightAlpha) * Math.sin(dirLightBeta),
	];
	var directionalLightColor = [0.8, 1.0, 1.0];

	initSphere();

	//SET Global states (viewport size, viewport background color, Depth test)
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0.85, 0.85, 0.85, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);

	var positionAttributeLocation = gl.getAttribLocation(program, "inPosition");
	var normalAttributeLocation = gl.getAttribLocation(program, "inNormal");
	var matrixLocation = gl.getUniformLocation(program, "matrix");
	var materialDiffColorHandle = gl.getUniformLocation(program, "mDiffColor");
	var lightDirectionHandle = gl.getUniformLocation(program, "lightDirection");
	var lightColorHandle = gl.getUniformLocation(program, "lightColor");
	var normalMatrixPositionHandle = gl.getUniformLocation(program, "nMatrix");

	var vao = gl.createVertexArray();

	gl.bindVertexArray(vao);
	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(vertexPositionData),
		gl.STATIC_DRAW
	);
	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

	var normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(normalData),
		gl.STATIC_DRAW
	);
	gl.enableVertexAttribArray(normalAttributeLocation);
	gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(
		gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indexData),
		gl.STATIC_DRAW
	);

	//Define the scene Graph

	var objects = [];

	var sunOrbitNode = new Node();
	var earthOrbitNode = new Node();
	earthOrbitNode.localMatrix = utils.MakeTranslateMatrix(100, 0, 0);

	var moonOrbitNode = new Node();
	moonOrbitNode.localMatrix = utils.MakeTranslateMatrix(30, 0, 0);

	var sunNode = new Node();
	sunNode.localMatrix = utils.MakeScaleMatrix(5, 5, 5);
	sunNode.drawInfo = {
		materialColor: [0.6, 0.6, 0.0],
		programInfo: program,
		bufferLength: indexData.length,
		vertexArray: vao,
	};

	var earthNode = new Node();

	earthNode.localMatrix = utils.MakeScaleMatrix(2, 2, 2);
	earthNode.drawInfo = {
		materialColor: [0.2, 0.5, 0.8],
		programInfo: program,
		bufferLength: indexData.length,
		vertexArray: vao,
	};

	var moonNode = new Node();
	moonNode.localMatrix = utils.MakeScaleMatrix(0.7, 0.7, 0.7);
	moonNode.drawInfo = {
		materialColor: [0.6, 0.6, 0.6],
		programInfo: program,
		bufferLength: indexData.length,
		vertexArray: vao,
	};

	sunNode.SetParent(sunOrbitNode);
	earthOrbitNode.SetParent(sunOrbitNode);
	earthNode.SetParent(earthOrbitNode);
	moonOrbitNode.SetParent(earthOrbitNode);
	moonNode.SetParent(moonOrbitNode);

	var objects = [sunNode, earthNode, moonNode];

	//---------------SceneGraph defined

	requestAnimationFrame(drawScene);

	// Draw the scene.
	function drawScene(time) {
		time *= 0.001;

		gl.clearColor(0.85, 0.85, 0.85, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Compute the projection matrix
		var aspect = gl.canvas.width / gl.canvas.height;
		var projectionMatrix = utils.MakePerspective(60.0, aspect, 1.0, 2000.0);

		// Compute the camera matrix using look at.
		var cameraPosition = [0.0, -200.0, 0.0];
		var target = [0.0, 0.0, 0.0];
		var up = [0.0, 0.0, 1.0];
		var cameraMatrix = utils.LookAt(cameraPosition, target, up);
		var viewMatrix = utils.invertMatrix(cameraMatrix);

		var viewProjectionMatrix = utils.multiplyMatrices(
			projectionMatrix,
			viewMatrix
		);

		// update the local matrices for each object.
		earthOrbitNode.localMatrix = utils.multiplyMatrices(
			utils.MakeRotateYMatrix(0.3),
			earthOrbitNode.localMatrix
		);
		moonOrbitNode.localMatrix = utils.multiplyMatrices(
			utils.MakeRotateYMatrix(0.6),
			moonOrbitNode.localMatrix
		);
		sunNode.localMatrix = utils.multiplyMatrices(
			utils.MakeRotateYMatrix(0.05),
			sunNode.localMatrix
		);
		earthNode.localMatrix = utils.multiplyMatrices(
			utils.MakeRotateYMatrix(0.5),
			earthNode.localMatrix
		);
		moonNode.localMatrix = utils.multiplyMatrices(
			utils.MakeRotateYMatrix(-0.1),
			moonNode.localMatrix
		);

		// Update all world matrices in the scene graph
		sunOrbitNode.UpdateWorldMatrix();

		// Compute all the matrices for rendering
		objects.forEach((object) => {
			gl.useProgram(object.drawInfo.programInfo);

			var projectionMatrix = utils.multiplyMatrices(
				viewProjectionMatrix,
				object.worldMatrix
			);
			var normalMatrix = utils.invertMatrix(
				utils.transposeMatrix(object.worldMatrix)
			);

			gl.uniformMatrix4fv(
				matrixLocation,
				gl.FALSE,
				utils.transposeMatrix(projectionMatrix)
			);
			gl.uniformMatrix4fv(
				normalMatrixPositionHandle,
				gl.FALSE,
				utils.transposeMatrix(normalMatrix)
			);

			gl.uniform3fv(
				materialDiffColorHandle,
				object.drawInfo.materialColor
			);
			gl.uniform3fv(lightColorHandle, directionalLightColor);
			gl.uniform3fv(lightDirectionHandle, directionalLight);

			gl.bindVertexArray(object.drawInfo.vertexArray);
			gl.drawElements(
				gl.TRIANGLES,
				object.drawInfo.bufferLength,
				gl.UNSIGNED_SHORT,
				0
			);
		});

		requestAnimationFrame(drawScene);
	}
}

function init() {
	const canvas = document.getElementById("main-canvas");
	const gl = canvas.getContext("webgl2");
	if (!gl) {
		console.error("GL context not opened");
		return;
	}
	utils.resizeCanvasToDisplaySize(gl.canvas);

	var vertexShader = utils.createShader(
		gl,
		gl.VERTEX_SHADER,
		vertexShaderSrc
	);
	var fragmentShader = utils.createShader(
		gl,
		gl.FRAGMENT_SHADER,
		fragmentShaderSrc
	);

	const program = utils.createProgram(gl, vertexShader, fragmentShader);

	gl.useProgram(program);

	main(gl, program);
}

window.onload = init();
