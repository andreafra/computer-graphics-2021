import { utils } from "./utils/utils";
import * as Engine from "./engine/Core";

export const CAMERA_DISTANCE_INCREMENT = 1;
export const MIN_CAMERA_DISTANCE = 8;
export const MAX_CAMERA_DISTANCE = 64;

let cameras: Map<string, Camera> = new Map();

export class Camera {
	// Camera normal direction
	private _normDir = new Array<number>(3);

	private alpha: number;
	private beta: number;

	// Camera translation from (0,0,0)
	// (tx, ty, yz) = target point
	private _translation = [0, 0, 0];

	// Camera distance from the target point
	private _distance: number;

	constructor(
		name: string,
		alpha = 45,
		beta = 30,
		dist = MIN_CAMERA_DISTANCE * 2
	) {
		this.distance = dist;
		this.alpha = 0;
		this.beta = 0;
		this.Rotate(alpha, beta);

		cameras.set(name, this);
	}

	get normDir() {
		return this._normDir;
	}

	set normDir(value: number[]) {
		this._normDir = value;
		this.Update();
	}

	get translation() {
		return this._translation;
	}

	set translation(value: number[]) {
		this._translation = value;
		this.Update();
	}

	get distance() {
		return this._distance;
	}
	set distance(value: number) {
		this._distance = utils.Clamp(
			value,
			MIN_CAMERA_DISTANCE,
			MAX_CAMERA_DISTANCE
		);
	}

	IncrementDistance() {
		this.distance += CAMERA_DISTANCE_INCREMENT;
		this.Update();
	}

	DecrementDistance() {
		this.distance -= CAMERA_DISTANCE_INCREMENT;
		this.Update();
	}

	// We should probably cache it somehow
	GetPosition() {
		return utils.addVectors(
			utils.multiplyVectorScalar(this._normDir, this._distance),
			this._translation
		);
	}

	Update() {
		let lookAt = utils.LookAt(
			this.GetPosition(),
			this._translation,
			[0, 1, 0] // Y+ axis
		);

		Engine.SetCamera(lookAt);
	}

	Rotate(dAlpha: number, dBeta: number) {
		this.alpha += dAlpha;
		this.beta += dBeta;

		this.beta = utils.Clamp(this.beta, 15, 89.9);

		let alphaRad = utils.degToRad(this.alpha);
		let betaRad = utils.degToRad(this.beta);

		this.normDir = [
			Math.cos(alphaRad) * Math.cos(betaRad),
			Math.sin(betaRad),
			Math.sin(alphaRad) * Math.cos(betaRad),
		];
	}

	static Get(name: string) {
		return cameras.get(name);
	}
}
