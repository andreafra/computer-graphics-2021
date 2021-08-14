import { indices, normals, vertices } from "./assets/shapesDefinition";
import * as Engine from "./engine/Core";
import { Light, LightType } from "./engine/Lights";
import { MakeVAO } from "./engine/Models";
import {
	Action,
	Node,
	RenderAction,
	RenderNode,
	LightNode,
	State,
} from "./engine/SceneGraph";
import { getShader } from "./engine/Shaders";
import { utils } from "./utils/utils";

// Define common structure for state of these nodes
interface PlanetState extends State {
	rotateSpeed: number;
}

export function init(gl: WebGL2RenderingContext) {
	// SHADERS
	const program = getShader(gl);
	gl.useProgram(program);

	// Setup Uniform Location (requires a shader)
	const matrixLoc = gl.getUniformLocation(program, "matrix");
	const materialDiffColorLoc = gl.getUniformLocation(program, "mDiffColor");
	const lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
	const lightColorLoc = gl.getUniformLocation(program, "lightColor");
	const normalMatrixLoc = gl.getUniformLocation(program, "nMatrix");
	const positionMatrixLoc = gl.getUniformLocation(program, "pMatrix");

	// CREATE MODEL
	const vao = MakeVAO(gl, program, {
		positions: vertices,
		normals: normals,
		indices: indices,
	});

	// SETUP NODES

	var sunOrbitNode = new Node<PlanetState>();
	sunOrbitNode.state.rotateSpeed = 0;

	var earthOrbitNode = new Node<PlanetState>(
		utils.MakeTranslateMatrix(100, 0, 0)
	);
	earthOrbitNode.state.rotateSpeed = 0.3;

	var moonOrbitNode = new Node<PlanetState>(
		utils.MakeTranslateMatrix(30, 0, 0)
	);
	moonOrbitNode.state.rotateSpeed = 0.6;

	var sunNode = new RenderNode<PlanetState>(utils.MakeScaleMatrix(5));
	sunNode.state.drawInfo = {
		materialColor: [0.6, 0.6, 0.0],
		program: program,
		bufferLength: indices.length,
		vertexArrayObject: vao,
	};
	sunNode.state.rotateSpeed = 0.05;

	var earthNode = new RenderNode<PlanetState>(utils.MakeScaleMatrix(2));
	earthNode.state.drawInfo = {
		materialColor: [0.2, 0.5, 0.8],
		program: program,
		bufferLength: indices.length,
		vertexArrayObject: vao,
	};
	earthNode.state.rotateSpeed = 0.5;

	var moonNode = new RenderNode<PlanetState>(utils.MakeScaleMatrix(0.7));
	moonNode.state.drawInfo = {
		materialColor: [0.6, 0.6, 0.6],
		program: program,
		bufferLength: indices.length,
		vertexArrayObject: vao,
	};
	moonNode.state.rotateSpeed = -0.1;

	// Set relationships between nodes
	sunOrbitNode.SetParent(Engine.ROOT_NODE);
	sunNode.SetParent(sunOrbitNode);
	earthOrbitNode.SetParent(sunOrbitNode);
	earthNode.SetParent(earthOrbitNode);
	moonOrbitNode.SetParent(earthOrbitNode);
	moonNode.SetParent(moonOrbitNode);

	const RotatePositionAction: Action<PlanetState> = (state) => {
		state.localMatrix = utils.multiplyMatrices(
			utils.MakeRotateYMatrix(state.rotateSpeed),
			state.localMatrix
		);
	};

	earthOrbitNode.AddAction(RotatePositionAction);
	moonOrbitNode.AddAction(RotatePositionAction);
	sunNode.AddAction(RotatePositionAction);
	earthNode.AddAction(RotatePositionAction);
	moonNode.AddAction(RotatePositionAction);

	// Depends on the attributes/unifors defined at the beginning
	const renderAction: RenderAction<PlanetState> = (state, VPMatrix) => {
		gl.useProgram(state.drawInfo.program);

		let projectionMatrix = utils.multiplyMatrices(
			VPMatrix,
			state.worldMatrix
		);
		let normalMatrix = utils.invertMatrix(
			utils.transposeMatrix(state.worldMatrix)
		);

		gl.uniformMatrix4fv(
			matrixLoc,
			false,
			utils.transposeMatrix(projectionMatrix)
		);
		gl.uniformMatrix4fv(
			normalMatrixLoc,
			false,
			utils.transposeMatrix(normalMatrix)
		);
		gl.uniformMatrix4fv(
			positionMatrixLoc,
			false,
			utils.transposeMatrix(state.worldMatrix)
		);

		gl.uniform3fv(materialDiffColorLoc, state.drawInfo.materialColor);

		Engine.BindAllLightUniforms(gl, state.drawInfo.program);

		gl.bindVertexArray(state.drawInfo.vertexArrayObject);
		gl.drawElements(
			gl.TRIANGLES,
			state.drawInfo.bufferLength,
			gl.UNSIGNED_SHORT,
			0
		);
	};

	sunNode.renderAction = renderAction;
	earthNode.renderAction = renderAction;
	moonNode.renderAction = renderAction;

	// Demonstrate moving camera
	Engine.ROOT_NODE.AddAction((state) => {
		const direction = Math.sin(Engine.GetTime()) > 0 ? 1 : -1;
		const lastPos = Engine.GetCamera();
		const newPos = utils.multiplyMatrices(
			utils.MakeTranslateMatrix(direction * 0.5, 0, 0),
			lastPos
		);
		Engine.SetCamera(newPos);
	});

	// Demonstrate a static light
	let directionalLightColor = [0.8, 1.0, 1.0, 1.0];
	let dirLightNode = new LightNode(
		Light.MakeDirectional(directionalLightColor),
		utils.multiplyMatrices(
			utils.MakeRotateZMatrix(-60),
			utils.MakeRotateXMatrix(120)));
	dirLightNode.SetParent(Engine.ROOT_NODE);

	// Demonstrate a moving point light placed above the earth
	const pointLightColor = [1.0, 0.0, 0.0, 1.0];
	const pointLightNode = new LightNode(
		Light.MakePoint(pointLightColor),
		utils.MakeTranslateMatrix(0, -15, 0));
	pointLightNode.SetParent(earthNode);
}
