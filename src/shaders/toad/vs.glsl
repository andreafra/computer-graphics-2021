#version 300 es

in vec3 aPosition;
in vec3 aNormal;
in vec2 aTexCoord;

out vec3 fsNormal;
out vec2 uvCoord;

uniform mat4 matrix;
uniform mat4 nMatrix;     //matrix to transform normals

void main() {
	fsNormal = mat3(nMatrix) * aNormal;
	uvCoord = aTexCoord;
	gl_Position = matrix * vec4(aPosition, 1.0);
}
