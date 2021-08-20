#version 300 es

precision mediump float;

in vec3 vTexCoord;
out vec4 outColor;

uniform samplerCube baseTexture;
uniform samplerCube emissiveMap;

void main() {
	outColor = texture(baseTexture, vTexCoord);
}
