import * as Engine from "./engine/Core";
import sampleLight from "./engine/LightData";
import { MakeTexture, MakeVAO } from "./engine/Models";
import { RenderAction, RenderNode, State } from "./engine/SceneGraph";
import { utils } from "./utils/utils";

// Assets
import toad_OBJ from "./assets/cpt_toad/toad.obj";
import bodyTextureSrc from "./assets/cpt_toad/Textures/baked_txt.png";
import fragShaderSrc from "./shaders/toad/fs.glsl";
import vertShaderSrc from "./shaders/toad/vs.glsl";

// Define common structure for state of these nodes
interface ToadState extends State {}

export function init(gl: WebGL2RenderingContext) {
	// SHADERS
	const program = utils.createAndCompileShaders(gl, [
		vertShaderSrc,
		fragShaderSrc,
	]);
	gl.useProgram(program);

	// Setup Uniform Location (requires a shader)
	const matrixLoc = gl.getUniformLocation(program, "matrix");
	const materialDiffColorLoc = gl.getUniformLocation(program, "mDiffColor");
	const lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
	const lightColorLoc = gl.getUniformLocation(program, "lightColor");
	const normalMatrixPositionLoc = gl.getUniformLocation(program, "nMatrix");

	// CREATE MODEL
	const vao = MakeVAO(gl, program, {
		positions: toad_OBJ.vertices,
		normals: toad_OBJ.vertexNormals,
		indices: toad_OBJ.indices,
		uvCoord: toad_OBJ.textures,
	});

	const SetupTextureRender = MakeTexture(gl, program, {
		dataSrc: bodyTextureSrc,
		uniformName: "bodyTexture",
	});

	// SETUP NODES
	let tMatrix = utils.multiplyMatrices(
		utils.MakeScaleMatrix(100),
		utils.MakeRotateXYZMatrix(0, 90, 0)
	);
	var toadNode = new RenderNode<ToadState>(tMatrix);
	toadNode.state.drawInfo = {
		materialColor: [0.0, 0.0, 0.0],
		program: program,
		bufferLength: toad_OBJ.indices.length,
		vertexArrayObject: vao,
	};

	// Set relationships between nodes
	toadNode.SetParent(Engine.ROOT_NODE);

	// Depends on the attributes/unifors defined at the beginning
	const renderAction: RenderAction<ToadState> = (state, VPMatrix) => {
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
			normalMatrixPositionLoc,
			false,
			utils.transposeMatrix(normalMatrix)
		);

		// Send Light Data to GPU
		gl.uniform3fv(materialDiffColorLoc, state.drawInfo.materialColor);
		gl.uniform3fv(lightColorLoc, sampleLight.color);
		gl.uniform3fv(lightDirectionLoc, sampleLight.direction);

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

	toadNode.renderAction = renderAction;
}
