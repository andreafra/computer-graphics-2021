import { utils } from "../utils/utils";
import * as Engine from "./Core";

interface CameraOrbit {
	ox: number;
	oy: number;
	oz: number;
	tx: number;
	ty: number;
	tz: number;
	radius: number;
}

export const CAMERA_SPEED = 0.25;
export const CAMERA_DISTANCE_INCREMENT = 1;
export const MIN_CAMERA_DISTANCE = 2;
export const MAX_CAMERA_DISTANCE = 64;

export var cameraOrbit: CameraOrbit = {
	ox: 0.3161081231791238,
	oy: 0.5877852522924731,
	oz: 0.7447040698476447,
	tx: 0,
	ty: 0,
	tz: 0,
	radius: 10,
};

export function Update() {
	let cameraPos = utils.multiplyVectorScalar(
		[cameraOrbit.ox, cameraOrbit.oy, cameraOrbit.oz],
		cameraOrbit.radius
	);

	let cameraTranslation = [cameraOrbit.tx, cameraOrbit.ty, cameraOrbit.tz];

	utils.addVectors(cameraPos, cameraTranslation, cameraPos);

	// Pan camera
	let lookAt = utils.LookAt(
		cameraPos,
		cameraTranslation,
		[0, 1, 0] // Y+ axis
	);

	Engine.SetCamera(lookAt);
}
