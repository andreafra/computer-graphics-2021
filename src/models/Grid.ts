import * as Engine from "../engine/Core";
import { MakeTexture, MakeVAO } from "../engine/Models";
import { RenderAction, RenderNode, Node, State } from "../engine/SceneGraph";
import { utils } from "../utils/utils";
import { getShader } from "../engine/Shaders";

// Assets
import gridOBJ from "../assets/grid/grid.obj";
import cubeTextureSrc from "../assets/grid/grid.png";

// Define common structure for state of these nodes
interface GridState extends State {}

export function init(gl: WebGL2RenderingContext) {
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
		positions: gridOBJ.vertices,
		normals: gridOBJ.vertexNormals,
		indices: gridOBJ.indices,
		uvCoord: gridOBJ.textures,
	});

	const SetupTextureRender = MakeTexture(gl, program, {
		dataSrc: cubeTextureSrc,
		uniformName: "baseTexture",
	});

	// SETUP NODES
	let tMatrix = utils.MakeTranslateMatrix(0, 0, 0);
	var blockNode = new RenderNode<GridState>("grid", tMatrix);
	blockNode.state.drawInfo = {
		materialColor: [0, 0, 0],
		program: program,
		bufferLength: gridOBJ.indices.length,
		vertexArrayObject: vao,
	};

	// Set relationships between nodes
	blockNode.SetParent(Engine.ROOT_NODE);

	// Depends on the attributes/unifors defined at the beginning
	const renderAction: RenderAction<GridState> = (state, VPMatrix) => {
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
