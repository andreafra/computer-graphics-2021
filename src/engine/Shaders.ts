import { utils } from "../utils/utils";

import fragmentShaderSrc from "../shaders/fs.glsl";
import vertexShaderSrc from "../shaders/vs.glsl";
import { gl } from "./Core";

export enum Features {
	Texture = 1 << 0,
	EmissiveMap = 1 << 1,
	NormalMap = 1 << 2,
	SpecularMap = 1 << 3,
}

export interface WebGLProgramInfo {
	program: WebGLProgram;
	locations: {
		matrix: WebGLUniformLocation;
		materialDiffColor: WebGLUniformLocation;
		materialSpecColor: WebGLUniformLocation;
		materialEmitColor: WebGLUniformLocation;
		normalMatrix: WebGLUniformLocation;
		positionMatrix: WebGLUniformLocation;
		texture?: WebGLUniformLocation;
		emissiveMap?: WebGLUniformLocation;
		normalMap?: WebGLUniformLocation;
		specularMap?: WebGLUniformLocation;
		lightType: WebGLUniformLocation;
		lightPos: WebGLUniformLocation;
		lightDir: WebGLUniformLocation;
		lightConeOut: WebGLUniformLocation;
		lightConeIn: WebGLUniformLocation;
		lightDecay: WebGLUniformLocation;
		lightTarget: WebGLUniformLocation;
		lightColor: WebGLUniformLocation;
		eyePos: WebGLUniformLocation;
	};
	textureNumber?: number;
}

export function getShader(features: number) {
	let vs = vertexShaderSrc;
	let fs = fragmentShaderSrc;
	if (features & Features.Texture) {
		vs = vs.replace("//NO_USE_TEXTURE", "#define USE_TEXTURE");
		fs = fs.replace("//NO_USE_TEXTURE", "#define USE_TEXTURE");
	}
	if (features & Features.EmissiveMap) {
		vs = vs.replace("//NO_USE_EMISSIVE_MAP", "#define USE_EMISSIVE_MAP");
		fs = fs.replace("//NO_USE_EMISSIVE_MAP", "#define USE_EMISSIVE_MAP");
	}
	if (features & Features.NormalMap) {
		vs = vs.replace("//NO_USE_NORMAL_MAP", "#define USE_NORMAL_MAP");
		fs = fs.replace("//NO_USE_NORMAL_MAP", "#define USE_NORMAL_MAP");
	}
	if (features & Features.SpecularMap) {
		vs = vs.replace("//NO_USE_SPECULAR_MAP", "#define USE_SPECULAR_MAP");
		fs = fs.replace("//NO_USE_SPECULAR_MAP", "#define USE_SPECULAR_MAP");
	}

	let program = utils.createAndCompileShaders(gl, [vs, fs]);

	let programInfo: WebGLProgramInfo = {
		program: program,
		locations: {
			matrix: gl.getUniformLocation(program, "matrix"),
			materialDiffColor: gl.getUniformLocation(program, "mDiffColor"),
			materialSpecColor: gl.getUniformLocation(program, "mSpecColor"),
			materialEmitColor: gl.getUniformLocation(program, "mEmitColor"),
			normalMatrix: gl.getUniformLocation(program, "nMatrix"),
			positionMatrix: gl.getUniformLocation(program, "pMatrix"),
			texture:
				features & Features.Texture
					? gl.getUniformLocation(program, "baseTexture")
					: undefined,
			emissiveMap:
				features & Features.EmissiveMap
					? gl.getUniformLocation(program, "emissiveMap")
					: undefined,
			normalMap:
				features & Features.NormalMap
					? gl.getUniformLocation(program, "normalMap")
					: undefined,
			lightType: gl.getUniformLocation(program, "LType"),
			lightPos: gl.getUniformLocation(program, "LPos"),
			lightDir: gl.getUniformLocation(program, "LDir"),
			lightConeOut: gl.getUniformLocation(program, "LConeOut"),
			lightConeIn: gl.getUniformLocation(program, "LConeIn"),
			lightDecay: gl.getUniformLocation(program, "LDecay"),
			lightTarget: gl.getUniformLocation(program, "LTarget"),
			lightColor: gl.getUniformLocation(program, "LColor"),
			eyePos: gl.getUniformLocation(program, "eyePos"),
		},
	};

	return programInfo;
}
