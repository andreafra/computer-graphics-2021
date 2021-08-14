import * as Engine from "./engine/Core";
import sampleLight from "./engine/LightData";
import { RenderAction, RenderNode, State } from "./engine/SceneGraph";
import { createVAO } from "./engine/VertexArrayObjectFactory";
import { utils } from "./utils/utils";

import vertShaderSrc from "./shaders/toad/vs.glsl";
import fragShaderSrc from "./shaders/toad/fs.glsl";

import toad_OBJ from "./assets/cpt_toad/toad.obj";
import bodyTextureSrc from "./assets/cpt_toad/Textures/baked_txt.png";

// Define common structure for state of these nodes
interface ToadState extends State {}

export function init(gl: WebGL2RenderingContext) {
	// SHADERS
	const program = utils.createAndCompileShaders(gl, [
		vertShaderSrc,
		fragShaderSrc,
	]);
	gl.useProgram(program);

	// Setup Attribute Location (requires a shader)
	const positionAttributeLoc = gl.getAttribLocation(program, "aPosition");
	const normalAttributeLoc = gl.getAttribLocation(program, "aNormal");
	const textureAttributeLoc = gl.getAttribLocation(program, "aTexCoord");

	// Setup Uniform Location (requires a shader)
	const matrixLoc = gl.getUniformLocation(program, "matrix");
	const materialDiffColorLoc = gl.getUniformLocation(program, "mDiffColor");
	const lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
	const lightColorLoc = gl.getUniformLocation(program, "lightColor");
	const normalMatrixPositionLoc = gl.getUniformLocation(program, "nMatrix");
	const bodyTextureFileLoc = gl.getUniformLocation(program, "bodyTexture");

	// CREATE MODEL
	const vao = createVAO(
		gl,
		{
			vertices: toad_OBJ.vertices,
			vertexNormals: toad_OBJ.vertexNormals,
			indices: toad_OBJ.indices,
			uv: toad_OBJ.textures,
		},
		{
			verticesAttribLocation: positionAttributeLoc,
			vertexNormalsAttribLocation: normalAttributeLoc,
			uvAttribLocation: textureAttributeLoc,
		}
	);

	console.log(toad_OBJ);

	let bodyTexture: WebGLTexture;
	let bodyTextureImage = new Image();
	bodyTextureImage.src = bodyTextureSrc;
	bodyTextureImage.onload = () => {
		bodyTexture = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, bodyTexture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			bodyTextureImage
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
	};

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

		gl.uniform3fv(materialDiffColorLoc, state.drawInfo.materialColor);
		gl.uniform3fv(lightColorLoc, sampleLight.color);
		gl.uniform3fv(lightDirectionLoc, sampleLight.direction);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, bodyTexture);
		gl.uniform1i(bodyTextureFileLoc, 0);

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
