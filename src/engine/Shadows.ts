export class Shadow {
	pos: number[] = [0, 0, 0];
	dir: number[] = [0, 0, 0];
	coneOut: number = 0;
	coneIn: number = 0;
	decay: number = 0;
	target: number = 1;
	color: number[] = [0, 0, 0, 1];

	static Make(
		color: number[],
		coneOut: number,
		coneIn: number,
		targetDistance?: number,
		decay?: number
	) {
		const l = new Shadow();
		l.color = color;
		l.coneOut = coneOut;
		l.coneIn = coneIn;
		if (targetDistance) l.target = targetDistance;
		if (decay) l.decay = decay;
		return l;
	}
}
