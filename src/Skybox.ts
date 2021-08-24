import pxBaseSrc from "./assets/skybox/texture/sideClouds.png";
import nxBaseSrc from "./assets/skybox/texture/sideClouds.png";
import pyBaseSrc from "./assets/skybox/texture/py.png";
import nyBaseSrc from "./assets/skybox/texture/ny.png";
import pzBaseSrc from "./assets/skybox/texture/sideClouds.png";
import nzBaseSrc from "./assets/skybox/texture/sideClouds.png";

import { utils } from "./utils/utils";
import { gl } from "./engine/Core";
import * as Engine from "./engine/Core";
import { State, Node } from "./engine/SceneGraph";

const vertShaderSrc = `#version 300 es

precision mediump float;

in vec3 a_Position;
out vec3 vTexCoord;
uniform mat4 matrix;

void main() {
	vTexCoord = a_Position;
	gl_Position = matrix * vec4(a_Position, 1.0);
}
`;

const fragShaderSrc = `#version 300 es

precision mediump float;

in vec3 vTexCoord;
out vec4 outColor;
uniform samplerCube baseTexture;

void main() {
	outColor = texture(baseTexture, vTexCoord);
}
`;

// https://learnopengl.com/Advanced-OpenGL/Cubemaps
// prettier-ignore
const skyboxVertices = [
    -1,  1, -1,
    -1, -1, -1,
     1, -1, -1,
     1, -1, -1,
     1,  1, -1,
    -1,  1, -1,

    -1, -1,  1,
    -1, -1, -1,
    -1,  1, -1,
    -1,  1, -1,
    -1,  1,  1,
    -1, -1,  1,

     1, -1, -1,
     1, -1,  1,
     1,  1,  1,
     1,  1,  1,
     1,  1, -1,
     1, -1, -1,

    -1, -1,  1,
    -1,  1,  1,
     1,  1,  1,
     1,  1,  1,
     1, -1,  1,
    -1, -1,  1,

    -1,  1, -1,
     1,  1, -1,
     1,  1,  1,
     1,  1,  1,
    -1,  1,  1,
    -1,  1, -1,

    -1, -1, -1,
    -1, -1,  1,
     1, -1, -1,
     1, -1, -1,
    -1, -1,  1,
     1, -1,  1
];

interface ShaderProgramInfo {
	program: WebGLProgram;
	locations: {
		matrix: WebGLUniformLocation;
		texture: WebGLUniformLocation;
	};
}

interface ShaderState extends State {
	vao: WebGLVertexArrayObject;
	programInfo: ShaderProgramInfo;
	bufferLength: number;
	baseTexture: () => void;
}

const BASE_TEX_SRC = [
	pxBaseSrc,
	nxBaseSrc,
	pyBaseSrc,
	nyBaseSrc,
	pzBaseSrc,
	nzBaseSrc,
];

let programInfo: ShaderProgramInfo;
let vao: WebGLVertexArrayObject;
let baseTex: () => void;

export function Init() {
	const program = utils.createAndCompileShaders(gl, [
		vertShaderSrc,
		fragShaderSrc,
	]);

	gl.useProgram(program);

	const textureImg: HTMLImageElement[] = [];
	const target = [
		gl.TEXTURE_CUBE_MAP_POSITIVE_X,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
	];

	function Load(
		images: HTMLImageElement[],
		sources: string[],
		textureId: number
	) {
		let tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);

		// Put images in each spot in the cubemap
		for (let i = 0; i < 6; i++) {
			images.push(new Image());
			images[i].src = sources[i];
			images[i].addEventListener("load", () => {
				gl.activeTexture(textureId);
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
				gl.texImage2D(
					target[i],
					0,
					gl.RGBA,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					images[i]
				);
			});
		}

		// Set some additional paramters
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(
			gl.TEXTURE_CUBE_MAP,
			gl.TEXTURE_WRAP_R,
			gl.CLAMP_TO_EDGE
		);
		gl.texParameteri(
			gl.TEXTURE_CUBE_MAP,
			gl.TEXTURE_WRAP_S,
			gl.CLAMP_TO_EDGE
		);
		gl.texParameteri(
			gl.TEXTURE_CUBE_MAP,
			gl.TEXTURE_WRAP_T,
			gl.CLAMP_TO_EDGE
		);

		return () => {
			gl.activeTexture(textureId);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
		};
	}

	baseTex = Load(textureImg, BASE_TEX_SRC, gl.TEXTURE0);

	// Create VAO
	vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	const verticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(skyboxVertices),
		gl.STATIC_DRAW
	);
	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

	programInfo = {
		program: program,
		locations: {
			matrix: gl.getUniformLocation(program, "matrix"),
			texture: gl.getUniformLocation(program, "baseTexture"),
		},
	};
}

const SKYBOX_SIZE = 254;

export function Spawn() {
	let tMatrix = utils.multiplyMatrices(
		utils.MakeRotateXMatrix(180),
		utils.MakeScaleMatrix(SKYBOX_SIZE)
	);

	let skyboxNode = new SkyboxNode<ShaderState>("skybox", tMatrix);
	skyboxNode.state = {
		...skyboxNode.state,
		vao: vao,
		baseTexture: baseTex,
		programInfo: programInfo,
	};

	skyboxNode.SetParent(Engine.ROOT_NODE);
}

class SkyboxNode<T extends ShaderState> extends Node<T> {
	override Update(deltaTime: number, worldMatrix?: number[]) {
		super.Update(deltaTime, worldMatrix);
		Engine.QueueRender((VPMatrix: number[]) => this.Render(VPMatrix));
	}

	Render(VPMatrix: number[]) {
		gl.useProgram(this.state.programInfo.program);

		let projMatrix = utils.multiplyMatrices(
			VPMatrix,
			this.state.worldMatrix
		);

		gl.uniformMatrix4fv(
			this.state.programInfo.locations.matrix,
			false,
			utils.transposeMatrix(projMatrix)
		);

		this.state.baseTexture();

		gl.bindVertexArray(this.state.vao);
		gl.drawArrays(gl.TRIANGLES, 0, 36);
	}
}
