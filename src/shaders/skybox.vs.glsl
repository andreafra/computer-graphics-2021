#version 300 es

precision mediump float;

in vec3 a_Position;
in vec3 a_Normal;

out vec3 vTexCoord;

uniform mat4 matrix;

void main() {
	vTexCoord = a_Position;
	gl_Position = matrix * vec4(a_Position, 1.0);
}
