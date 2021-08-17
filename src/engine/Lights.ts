import { utils } from "../utils/utils";

export enum LightType {
	None = 0,
	Direct = 1,
	Point = 2,
	Spot = 3,
}

export class Light {
	type: LightType = LightType.None;
	pos: number[] = [0, 0, 0];
	dir: number[] = [0, 0, 0];
	coneOut: number = 0;
	coneIn: number = 0;
	decay: number = 0;
	target: number = 1;
	color: number[] = [0, 0, 0, 1];

	EncodeTypeOneHot(): number[] {
		let arr = [0, 0, 0];
		if (this.type != 0) arr[this.type - 1] = 1;
		return arr;
	}

	static MakeDirectional(color: number[]) {
		const l = new Light();
		l.type = LightType.Direct;
		l.color = color;
		return l;
	}

	static MakePoint(color: number[], targetDistance?: number, decay?: number) {
		const l = new Light();
		l.type = LightType.Point;
		l.color = color;
		if (targetDistance) l.target = targetDistance;
		if (decay) l.decay = decay;
		return l;
	}

	static MakeSpot(
		color: number[],
		coneOut: number,
		coneIn: number,
		targetDistance?: number,
		decay?: number
	) {
		const l = new Light();
		l.type = LightType.Spot;
		l.color = color;
		l.coneOut = coneOut;
		l.coneIn = coneIn;
		if (targetDistance) l.target = targetDistance;
		if (decay) l.decay = decay;
		return l;
	}
}
