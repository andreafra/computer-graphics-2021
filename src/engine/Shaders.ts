import { utils } from "../utils/utils";

import fragmentShaderSrc from "../shaders/fs.glsl";
import vertexShaderSrc from "../shaders/vs.glsl";

export function getShader(gl: WebGL2RenderingContext, useTextures = false) {
	let vs = vertexShaderSrc;
	let fs = fragmentShaderSrc;
	if (useTextures) {
		vs = vs.replace("//NO_USE_TEXTURES", "#define USE_TEXTURES");
		fs = fs.replace("//NO_USE_TEXTURES", "#define USE_TEXTURES");
	}

	return utils.createAndCompileShaders(gl, [vs, fs]);
}
