import { utils } from "../utils/utils";

import fragmentShaderSrc from "../shaders/fs.glsl";
import vertexShaderSrc from "../shaders/vs.glsl";

export interface WebGLProgramInfo {
	program: WebGLProgram
	locations: {
		matrix: WebGLUniformLocation
		materialDiffColor: WebGLUniformLocation
		normalMatrix: WebGLUniformLocation
		positionMatrix: WebGLUniformLocation
	}
}

export function getShader(gl: WebGL2RenderingContext, useTextures = false) {
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
			normalMatrix:  gl.getUniformLocation(program, "nMatrix"),
			positionMatrix:  gl.getUniformLocation(program, "pMatrix")
		}
	}

	return programInfo
}
