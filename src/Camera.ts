import { utils } from "./utils/utils";
import * as Engine from "./engine/Core";

export const CAMERA_DISTANCE_INCREMENT = 1;
export const MIN_CAMERA_DISTANCE = 2;
export const MAX_CAMERA_DISTANCE = 64;

let cameras: Map<string, Camera> = new Map();

export class Camera {
	// Camera normal direction
	private _normDir = [
		0.9650064789340802, 0.25881904510252074, 0.0042146331262235956,
	];

	// Camera translation from (0,0,0)
	// (tx, ty, yz) = target point
	private _translation = [0, 0, 0];

	// Camera distance from the target point
	private _distance: number = MIN_CAMERA_DISTANCE * 2;

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

	static Get(name: string) {
		return cameras.get(name);
	}

	static Init(name: string) {
		let camera = new Camera();
		cameras.set(name, camera);
		return camera;
	}
}
