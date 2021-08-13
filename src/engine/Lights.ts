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

	BindUniforms(gl: WebGL2RenderingContext,
				 program: WebGLProgram,
				 i: number) {
		const lightName = String.fromCharCode(65 + i);

		gl.uniform3fv(gl.getUniformLocation(program, "L"+lightName+"lightType"), this.EncodeTypeOneHot());
		gl.uniform3fv(gl.getUniformLocation(program, "L"+lightName+"Pos"), this.pos);
		gl.uniform3fv(gl.getUniformLocation(program, "L"+lightName+"Dir"), this.dir.map(d => -d));
		gl.uniform1f(gl.getUniformLocation(program,  "L"+lightName+"ConeOut"), this.coneOut);
		gl.uniform1f(gl.getUniformLocation(program,  "L"+lightName+"ConeIn"), this.coneIn);
		gl.uniform1f(gl.getUniformLocation(program,  "L"+lightName+"Decay"), this.decay);
		gl.uniform1f(gl.getUniformLocation(program,  "L"+lightName+"Target"), this.target);
		gl.uniform4fv(gl.getUniformLocation(program, "L"+lightName+"lightColor"), this.lightColor);
	}

	static MakeDirectional(dir: number[], color: number[]) {
		const l = new Light();
		l.lightType = LightType.Direct;
		l.dir = dir;
		l.lightColor = color;
		return l;
	}
}
