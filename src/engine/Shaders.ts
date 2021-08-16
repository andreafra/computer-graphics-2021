import { utils } from "../utils/utils";

import fragmentShaderSrc from "../shaders/fs.glsl";
import vertexShaderSrc from "../shaders/vs.glsl";
import { gl } from "./Core";

export interface WebGLProgramInfo {
	program: WebGLProgram;
	locations: {
		matrix: WebGLUniformLocation;
		materialDiffColor: WebGLUniformLocation;
		materialSpecColor: WebGLUniformLocation;
		normalMatrix: WebGLUniformLocation;
		positionMatrix: WebGLUniformLocation;
		texture?: WebGLUniformLocation;
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
}

export function getShader(useTextures = false) {
	let vs = vertexShaderSrc;
	let fs = fragmentShaderSrc;
	if (useTextures) {
		vs = vs.replace("//NO_USE_TEXTURES", "#define USE_TEXTURES");
		fs = fs.replace("//NO_USE_TEXTURES", "#define USE_TEXTURES");
	}

	let program = utils.createAndCompileShaders(gl, [vs, fs]);

	let programInfo: WebGLProgramInfo = {
		program: program,
		locations: {
			matrix: gl.getUniformLocation(program, "matrix"),
			materialDiffColor: gl.getUniformLocation(program, "mDiffColor"),
			materialSpecColor: gl.getUniformLocation(program, "mSpecColor"),
			normalMatrix: gl.getUniformLocation(program, "nMatrix"),
			positionMatrix: gl.getUniformLocation(program, "pMatrix"),
			texture: useTextures
				? gl.getUniformLocation(program, "baseTexture")
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
