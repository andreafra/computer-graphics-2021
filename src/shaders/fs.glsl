#version 300 es

//NO_USE_TEXTURE
//NO_USE_EMISSIVE_MAP
//NO_USE_NORMAL_MAP
//NO_USE_SPECULAR_MAP
//NO_USE_AMBIENT_OCCLUSION

precision mediump float;

in vec3 fsNormal;
in vec3 fsPosition;
in vec2 uvCoord;
out vec4 outColor;

uniform vec3 mDiffColor; //material diffuse color
uniform vec3 mSpecColor;
uniform vec3 mEmitColor;
uniform vec3 eyePos;

#ifdef USE_TEXTURE
uniform sampler2D baseTexture;
#endif
#ifdef USE_EMISSIVE_MAP
uniform sampler2D emissiveMap;
#endif
#ifdef USE_NORMAL_MAP
uniform sampler2D normalMap;
#endif
#ifdef USE_SPECULAR_MAP
uniform sampler2D specularMap;
#endif
#ifdef USE_AMBIENT_OCCLUSION
uniform sampler2D ambientOcclusion;
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

#define SPEC_SHINE 100.0

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

vec4 compSpecular(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec3 eyedirVec) {
	// Blinn
	float LdotN = max(0.0, dot(normalVec, lightDir));
	vec3 halfVec = normalize(lightDir + eyedirVec);
	float HdotN = max(dot(normalVec, halfVec), 0.0);
	vec4 LScol = lightCol * max(sign(LdotN),0.0);

	vec4 specularBlinn = LScol * pow(HdotN, SPEC_SHINE);
	return specularBlinn;
}

mat3 computeTBN(vec3 n_norm) {
	//// online computation of tangent and bitangent

	// compute derivations of the world position
	vec3 p_dx = dFdx(fsPosition);
	vec3 p_dy = dFdy(fsPosition);
	// compute derivations of the texture coordinate
	vec2 tc_dx = dFdx(uvCoord);
	vec2 tc_dy = dFdy(uvCoord);
	// compute initial tangent and bi-tangent
	vec3 t = (tc_dy.y * p_dx - tc_dx.y * p_dy) / (tc_dx.x*tc_dy.y - tc_dy.x*tc_dx.y);

	t = normalize(t - n_norm * dot(n_norm, t));
	vec3 b = normalize(cross(n_norm,t));

	return mat3(t, b, n_norm);
}

void main() {
	vec3 normalVec = normalize(fsNormal);
	vec3 eyedirVec = normalize(eyePos - fsPosition);

#ifdef USE_NORMAL_MAP
	mat3 tbn = computeTBN(normalVec);
	vec4 nMap = texture(normalMap, uvCoord);
	normalVec = normalize(tbn * (nMap.xyz * 2.0 - 1.0));
#endif

	//lights
	vec4 lightsDiffuse;
	vec4 lightsSpecular;
	for (int i = 0; i < N_LIGHTS; i++) {
		vec3 lightDir = compLightDir(LPos[i], LDir[i], LType[i]);
		vec4 lightCol = compLightColor(LColor[i], LTarget[i], LDecay[i], LPos[i], LDir[i],
									     LConeOut[i], LConeIn[i], LType[i]);
		lightsDiffuse += max(0.0, dot(lightDir, normalVec)) * lightCol;
		lightsSpecular += compSpecular(lightDir, lightCol, normalVec, eyedirVec);
	}

	vec4 diffColor = vec4(mDiffColor, 1.0);
	vec4 emitColor = vec4(mEmitColor, 1.0);
#ifdef USE_TEXTURE
	diffColor = texture(baseTexture, uvCoord);
	emitColor = diffColor * max(max(mEmitColor.r, mEmitColor.g), mEmitColor.b);
#endif
#ifdef USE_EMISSIVE_MAP
	emitColor = texture(emissiveMap, uvCoord);
#endif
	vec4 specColor = vec4(mSpecColor, 1.0);
#ifdef USE_SPECULAR_MAP
	specColor = texture(specularMap, uvCoord);
#endif
#ifdef USE_AMBIENT_OCCLUSION
	diffColor *= texture(ambientOcclusion, uvCoord);
#endif

	vec4 lambertColor = diffColor * lightsDiffuse;
	vec4 blinnColor = specColor * lightsSpecular;
	outColor = clamp(lambertColor + blinnColor + emitColor, 0.00, 1.0);
}
