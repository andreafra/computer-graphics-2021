import { utils } from "../utils/utils";

import fragmentShaderSrc from "../shaders/scene-graph-example/fs.glsl";
import vertexShaderSrc from "../shaders/scene-graph-example/vs.glsl";

export function getSampleShader(gl: WebGL2RenderingContext) {
	var vertexShader = utils.createShader(
		gl,
		gl.VERTEX_SHADER,
		vertexShaderSrc
	);
	var fragmentShader = utils.createShader(
		gl,
		gl.FRAGMENT_SHADER,
		fragmentShaderSrc
	);
	return utils.createProgram(gl, vertexShader, fragmentShader);
}
