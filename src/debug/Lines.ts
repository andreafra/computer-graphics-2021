import { utils } from "../utils/utils";

// Vertex shader source code
const vertexShaderSrc = `#version 300 es
	precision mediump float;

	in vec3 a_Position;

	uniform mat4 matrix;

	void main() {
		gl_Position = matrix * vec4(a_Position, 1.0);
	}`;

// Fragment shader source code
const fragmentShaderSrc = `#version 300 es
	precision mediump float;

	out vec4 outColor;

	uniform vec3 lineColor;

	void main() {
		outColor = vec4(lineColor, 1.0);
	}`;

interface Line {
	vao: WebGLVertexArrayObject;
	color: LineColor;
	colorLoc: WebGLUniformLocation;
	matrix: number[];
	matrixLoc: WebGLUniformLocation;
}

enum LineColor {
	BLACK = 0,
	RED = 1,
	GREEN = 2,
	BLUE = 3,
}

const COLORS = [
	[0, 0, 0],
	[1, 0, 0],
	[0, 1, 0],
	[0, 0, 1],
];

let lines: Line[] = [];

let program: WebGLProgram;

export function Setup(gl: WebGL2RenderingContext) {
	// Shaders
	program = utils.createAndCompileShaders(gl, [
		vertexShaderSrc,
		fragmentShaderSrc,
	]);
}

export function DrawLine(
	gl: WebGL2RenderingContext,
	start: number[],
	end: number[],
	color: LineColor = LineColor.BLACK
) {
	gl.useProgram(program);

	const matrixLoc = gl.getUniformLocation(program, "matrix");
	const colorLoc = gl.getUniformLocation(program, "lineColor");

	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	// Vertices
	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([...start, ...end]),
		gl.STATIC_DRAW
	);

	let positions = gl.getAttribLocation(program, "a_Position");
	gl.vertexAttribPointer(positions, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(positions);

	lines.push({
		vao: vao,
		color: color,
		colorLoc: colorLoc,
		matrix: utils.identityMatrix(),
		matrixLoc: matrixLoc,
	});
}

export function Render(gl: WebGL2RenderingContext, VPMatrix: number[]) {
	gl.useProgram(program);
	for (const line of lines) {
		let projectionMatrix = utils.multiplyMatrices(VPMatrix, line.matrix);

		gl.bindVertexArray(line.vao);
		gl.uniformMatrix4fv(
			line.matrixLoc,
			false,
			utils.transposeMatrix(projectionMatrix)
		);
		gl.uniform3fv(line.colorLoc, COLORS[line.color]);
		gl.drawArrays(gl.LINES, 0, 6);
	}
}
