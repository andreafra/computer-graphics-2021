import { utils } from "../utils/utils";

import fragmentShaderSrc from "../shaders/fs.glsl";
import vertexShaderSrc from "../shaders/vs.glsl";
import { gl } from "./Core";

export enum Features {
	Texture = 1 << 0,
	EmissiveMap = 1 << 1,
	NormalMap = 1 << 2,
	SpecularMap = 1 << 3,
	AmbientOcclusion = 1 << 4,
}

export const MAX_LIGHTS = 64;
export const MAX_SHADOWS = 8;

export interface WebGLProgramInfo {
	program: WebGLProgram;
	locations: {
		matrix: WebGLUniformLocation;
		materialDiffColor: WebGLUniformLocation;
		materialAmbColor: WebGLUniformLocation;
		materialSpecColor: WebGLUniformLocation;
		materialEmitColor: WebGLUniformLocation;
		normalMatrix: WebGLUniformLocation;
		positionMatrix: WebGLUniformLocation;
		texture?: WebGLUniformLocation;
		emissiveMap?: WebGLUniformLocation;
		normalMap?: WebGLUniformLocation;
		specularMap?: WebGLUniformLocation;
		ambientOcclusion?: WebGLUniformLocation;
		// lights
		lightsCount: WebGLUniformLocation;
		lightType: WebGLUniformLocation;
		lightPos: WebGLUniformLocation;
		lightDir: WebGLUniformLocation;
		lightConeOut: WebGLUniformLocation;
		lightConeIn: WebGLUniformLocation;
		lightDecay: WebGLUniformLocation;
		lightTarget: WebGLUniformLocation;
		lightColor: WebGLUniformLocation;
		// shadows
		shadowsCount: WebGLUniformLocation;
		shadowPos: WebGLUniformLocation;
		shadowDir: WebGLUniformLocation;
		shadowConeOut: WebGLUniformLocation;
		shadowConeIn: WebGLUniformLocation;
		shadowDecay: WebGLUniformLocation;
		shadowTarget: WebGLUniformLocation;
		shadowColor: WebGLUniformLocation;

		ambientLight: WebGLUniformLocation;
		eyePos: WebGLUniformLocation;
	};
	textureNumber?: number;
}

export function getShader(features: number) {
	let vs = vertexShaderSrc;
	let fs = fragmentShaderSrc;

	fs = fs.replace("//MAX_LIGHTS", `#define MAX_LIGHTS ${MAX_LIGHTS}`);
	fs = fs.replace("//MAX_SHADOWS", `#define MAX_SHADOWS ${MAX_SHADOWS}`);

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
	if (features & Features.AmbientOcclusion) {
		vs = vs.replace(
			"//NO_USE_AMBIENT_OCCLUSION",
			"#define USE_AMBIENT_OCCLUSION"
		);
		fs = fs.replace(
			"//NO_USE_AMBIENT_OCCLUSION",
			"#define USE_AMBIENT_OCCLUSION"
		);
	}

	let program = utils.createAndCompileShaders(gl, [vs, fs]);

	let programInfo: WebGLProgramInfo = {
		program: program,
		locations: {
			matrix: gl.getUniformLocation(program, "matrix"),
			materialDiffColor: gl.getUniformLocation(program, "mDiffColor"),
			materialAmbColor: gl.getUniformLocation(program, "mAmbColor"),
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
			ambientOcclusion:
				features & Features.AmbientOcclusion
					? gl.getUniformLocation(program, "ambientOcclusion")
					: undefined,
			lightsCount: gl.getUniformLocation(program, "lightsCount"),
			lightType: gl.getUniformLocation(program, "LType"),
			lightPos: gl.getUniformLocation(program, "LPos"),
			lightDir: gl.getUniformLocation(program, "LDir"),
			lightConeOut: gl.getUniformLocation(program, "LConeOut"),
			lightConeIn: gl.getUniformLocation(program, "LConeIn"),
			lightDecay: gl.getUniformLocation(program, "LDecay"),
			lightTarget: gl.getUniformLocation(program, "LTarget"),
			lightColor: gl.getUniformLocation(program, "LColor"),
			shadowsCount: gl.getUniformLocation(program, "shadowsCount"),
			shadowPos: gl.getUniformLocation(program, "SdwPos"),
			shadowDir: gl.getUniformLocation(program, "SdwDir"),
			shadowConeOut: gl.getUniformLocation(program, "SdwConeOut"),
			shadowConeIn: gl.getUniformLocation(program, "SdwConeIn"),
			shadowDecay: gl.getUniformLocation(program, "SdwDecay"),
			shadowTarget: gl.getUniformLocation(program, "SdwTarget"),
			shadowColor: gl.getUniformLocation(program, "SdwColor"),
			ambientLight: gl.getUniformLocation(program, "ambientLight"),
			eyePos: gl.getUniformLocation(program, "eyePos"),
		},
	};

	return programInfo;
}
