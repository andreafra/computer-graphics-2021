import pxBaseSrc from "./assets/skybox/texture/px.png";
import nxBaseSrc from "./assets/skybox/texture/nx.png";
import pyBaseSrc from "./assets/skybox/texture/py.png";
import nyBaseSrc from "./assets/skybox/texture/ny.png";
import pzBaseSrc from "./assets/skybox/texture/pz.png";
import nzBaseSrc from "./assets/skybox/texture/nz.png";

import pxEmissiveSrc from "./assets/skybox/emission/px.png";
import nxEmissiveSrc from "./assets/skybox/emission/nx.png";
import pyEmissiveSrc from "./assets/skybox/emission/py.png";
import nyEmissiveSrc from "./assets/skybox/emission/ny.png";
import pzEmissiveSrc from "./assets/skybox/emission/pz.png";
import nzEmissiveSrc from "./assets/skybox/emission/nz.png";

import cube_obj from "./assets/skybox/cube.obj";

import fragShaderSrc from "./shaders/skybox.fs.glsl";
import vertShaderSrc from "./shaders/skybox.vs.glsl";

import { utils } from "./utils/utils";
import { gl } from "./engine/Core";
import * as Engine from "./engine/Core";
import { MakeVAO } from "./engine/Models";
import { State, Node } from "./engine/SceneGraph";

interface ShaderProgramInfo {
	program: WebGLProgram;
	locations: {
		matrix: WebGLUniformLocation;
		texture: WebGLUniformLocation;
		emissiveMap: WebGLUniformLocation;
	};
}

interface ShaderState extends State {
	vao: WebGLVertexArrayObject;
	programInfo: ShaderProgramInfo;
	bufferLength: number;
	baseTexture: () => void;
	emissiveMap: () => void;
}

const BASE_TEX_SRC = [
	pxBaseSrc,
	nxBaseSrc,
	pyBaseSrc,
	nyBaseSrc,
	pzBaseSrc,
	nzBaseSrc,
];
const EMISSIVE_TEX_SRC = [
	pxEmissiveSrc,
	nxEmissiveSrc,
	pyEmissiveSrc,
	nyEmissiveSrc,
	pzEmissiveSrc,
	nzEmissiveSrc,
];

let programInfo: ShaderProgramInfo;
let vao: WebGLVertexArrayObject;
let baseTex: () => void;
let emissiveMap: () => void;

export function Init() {
	const program = utils.createAndCompileShaders(gl, [
		vertShaderSrc,
		fragShaderSrc,
	]);

	gl.useProgram(program);

	const textureImg: HTMLImageElement[] = [];
	const emissiveImg: HTMLImageElement[] = [];
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
	emissiveMap = Load(emissiveImg, EMISSIVE_TEX_SRC, gl.TEXTURE8);

	vao = MakeVAO(program, {
		positions: cube_obj.vertices,
		normals: cube_obj.vertexNormals,
		indices: cube_obj.indices,
	});

	programInfo = {
		program: program,
		locations: {
			matrix: gl.getUniformLocation(program, "matrix"),
			texture: gl.getUniformLocation(program, "baseTexture"),
			emissiveMap: gl.getUniformLocation(program, "emissiveMap"),
		},
	};
}

const SKYBOX_SIZE = 254;

export function Spawn() {
	let tMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(0, 0, 0),
		utils.MakeRotateXMatrix(180),
		utils.MakeScaleMatrix(SKYBOX_SIZE)
	);

	let skyboxNode = new SkyboxNode<ShaderState>("skybox", tMatrix);
	skyboxNode.state = {
		...skyboxNode.state,
		vao: vao,
		baseTexture: baseTex,
		emissiveMap: emissiveMap,
		programInfo: programInfo,
		bufferLength: cube_obj.indices.length,
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
		this.state.emissiveMap();

		gl.bindVertexArray(this.state.vao);
		gl.drawElements(
			gl.TRIANGLES,
			this.state.bufferLength,
			gl.UNSIGNED_SHORT,
			0
		);
	}
}
