#version 300 es

in vec3 a_Position;
in vec3 a_Normal;
in vec2 a_UVCoord;

out vec3 fsNormal;
out vec2 uvCoord;

uniform mat4 matrix;
uniform mat4 nMatrix;     //matrix to transform normals

void main() {
	fsNormal = mat3(nMatrix) * a_Normal;
	uvCoord = a_UVCoord;
	gl_Position = matrix * vec4(a_Position, 1.0);
}
