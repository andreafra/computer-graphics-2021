import * as Engine from "../engine/Core";
import { MakeTexture, MakeVAO } from "../engine/Models";
import { RenderAction, RenderNode, Node, State } from "../engine/SceneGraph";
import { utils } from "../utils/utils";
import { getShader } from "../engine/Shaders";

// Assets
import cube_W_OBJ from "../assets/cube/cube_white.obj";
import cube_Y_OBJ from "../assets/cube/cube_yellow.obj";
import cubeTextureSrc from "../assets/cube/grass.png";

// Define common structure for state of these nodes
interface CubeState extends State {}

export enum Type {
	White = 0,
	Yellow = 1,
}

const MESHES = [cube_W_OBJ, cube_Y_OBJ];

export function init(
	gl: WebGL2RenderingContext,
	type: Type,
	translateVec: number[],
	parentNode: Node<State>
) {
	let blockOBJ = MESHES[type];

	// SHADERS
	const program = getShader(gl, true /* useTextures */);
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
		positions: blockOBJ.vertices,
		normals: blockOBJ.vertexNormals,
		indices: blockOBJ.indices,
		uvCoord: blockOBJ.textures,
	});

	const SetupTextureRender = MakeTexture(gl, program, {
		dataSrc: cubeTextureSrc,
		uniformName: "baseTexture",
	});

	// SETUP NODES
	let tMatrix = utils.MakeTranslateMatrix(
		translateVec[0],
		translateVec[1],
		translateVec[2]
	);
	var blockNode = new RenderNode<CubeState>(`block-${type}`, tMatrix);
	blockNode.state.drawInfo = {
		materialColor: [0, 0, 0],
		program: program,
		bufferLength: blockOBJ.indices.length,
		vertexArrayObject: vao,
	};

	// Set relationships between nodes
	blockNode.SetParent(parentNode);

	// Depends on the attributes/unifors defined at the beginning
	const renderAction: RenderAction<CubeState> = (state, VPMatrix) => {
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

		// Send Texture Data to GPU
		SetupTextureRender();

		gl.bindVertexArray(state.drawInfo.vertexArrayObject);
		gl.drawElements(
			gl.TRIANGLES,
			state.drawInfo.bufferLength,
			gl.UNSIGNED_SHORT,
			0
		);
	};

	blockNode.renderAction = renderAction;
}
