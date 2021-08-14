#version 300 es

precision mediump float;

in vec2 uvCoord;
in vec3 fsNormal;
out vec4 outColor;

uniform sampler2D bodyTexture;
// uniform sampler2D faceTexture;

uniform vec3 mDiffColor; //material diffuse color
uniform vec3 lightDirection; // directional light direction vec
uniform vec3 lightColor; //directional light color

void main() {

	vec3 nNormal = normalize(fsNormal);
	vec3 lambertColor = mDiffColor * lightColor * dot(-lightDirection,nNormal);
	outColor = vec4(clamp(lambertColor, 0.00, 1.0),1.0) + texture(bodyTexture, uvCoord);
}
