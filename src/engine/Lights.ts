import { utils } from "../utils/utils";

export enum LightType {
	None = 0,
	Direct = 1,
	Point = 2,
	Spot = 3
};

export class Light {
	lightType: LightType = LightType.None;
	pos: number[] = [0, 0, 0];
	dir: number[] = [0, 0, 0];
	coneOut: number = 0;
	coneIn: number = 0;
	decay: number = 0;
	target: number = 1;
	lightColor: number[] = [0, 0, 0, 1];

	EncodeTypeOneHot(): number[] {
		let arr = [0, 0, 0];
		if (this.lightType != 0)
			arr[this.lightType - 1] = 1;
		return arr;
	}

	static MakeDirectional(color: number[]) {
		const l = new Light();
		l.lightType = LightType.Direct;
		l.lightColor = color;
		return l;
	}

	static MakePoint(color: number[], targetDistance?: number, decay?: number) {
		const l = new Light();
		l.lightType = LightType.Point;
		l.lightColor = color;
		if (targetDistance)
			l.target = targetDistance;
		if (decay)
			l.decay = decay;
		return l;
	}
}
