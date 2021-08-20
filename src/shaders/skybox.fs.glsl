#version 300 es

precision mediump float;

in vec3 vTexCoord;
out vec4 outColor;

uniform samplerCube baseTexture;

void main() {
	outColor = texture(baseTexture, vTexCoord);
}
