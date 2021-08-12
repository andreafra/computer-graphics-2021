import { utils } from "../utils/utils";

// Sample static light setup data

var dirLightAlpha = -utils.degToRad(-60);
var dirLightBeta = -utils.degToRad(120);
var directionalLightDir = [
	Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
	Math.sin(dirLightAlpha),
	Math.cos(dirLightAlpha) * Math.sin(dirLightBeta),
];
var directionalLightColor = [0.8, 1.0, 1.0];

export default {
	direction: directionalLightDir,
	color: directionalLightColor,
};
