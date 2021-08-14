#version 300 es

//NO_USE_TEXTURES

precision mediump float;

in vec3 fsNormal;
in vec3 fsPosition;
out vec4 outColor;

uniform vec3 mDiffColor; //material diffuse color
#ifdef USE_TEXTURES
in vec2 uvCoord;
uniform sampler2D baseTexture;
#endif

// 3 configurable lights
#define N_LIGHTS 16
// Light type is one-hot encoded on 3 bits
uniform vec3 LType[N_LIGHTS];
uniform vec3 LPos[N_LIGHTS];
uniform vec3 LDir[N_LIGHTS];
uniform float LConeOut[N_LIGHTS];
uniform float LConeIn[N_LIGHTS];
uniform float LDecay[N_LIGHTS];
uniform float LTarget[N_LIGHTS];
uniform vec4 LColor[N_LIGHTS];

vec3 compLightDir(vec3 LPos, vec3 LDir, vec3 lightType) {
	//lights
	// -> Point
	vec3 pointLightDir = normalize(LPos - fsPosition);
	// -> Direct
	vec3 directLightDir = LDir;
	// -> Spot
	vec3 spotLightDir = normalize(LPos - fsPosition);

	return directLightDir * lightType.x +
		   pointLightDir * lightType.y +
		   spotLightDir * lightType.z;
}

vec4 compLightColor(vec4 lightColor, float LTarget, float LDecay, vec3 LPos, vec3 LDir,
					float LConeOut, float LConeIn, vec3 lightType) {
	float LCosOut = cos(radians(LConeOut / 2.0));
	float LCosIn = cos(radians(LConeOut * LConeIn / 2.0));

	//lights
	// -> Point
	vec4 pointLightCol = lightColor * pow(LTarget / length(LPos - fsPosition), LDecay);
	// -> Direct
	vec4 directLightCol = lightColor;
	// -> Spot
	vec3 spotLightDir = normalize(LPos - fsPosition);
	float CosAngle = dot(spotLightDir, LDir);
	vec4 spotLightCol = lightColor * pow(LTarget / length(LPos - fsPosition), LDecay) *
						clamp((CosAngle - LCosOut) / (LCosIn - LCosOut), 0.0, 1.0);
	// ----> Select final component
	return directLightCol * lightType.x +
		   pointLightCol * lightType.y +
		   spotLightCol * lightType.z;
}


void main() {
	vec3 normalVec = normalize(fsNormal);

	//lights
	vec4 lights;
	for (int i = 0; i < N_LIGHTS; i++) {
		vec3 lightDir = compLightDir(LPos[i], LDir[i], LType[i]);
		vec4 lightCol = compLightColor(LColor[i], LTarget[i], LDecay[i], LPos[i], LDir[i],
									     LConeOut[i], LConeIn[i], LType[i]);
		lights += dot(lightDir, normalVec) * lightCol;
	}

	vec4 diffColor = vec4(mDiffColor, 1.0);
#ifdef USE_TEXTURES
	diffColor = texture(baseTexture, uvCoord);
#endif

	vec4 lambertColor = diffColor * lights;
	outColor = clamp(lambertColor, 0.00, 1.0);
}
