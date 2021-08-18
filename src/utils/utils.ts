//Utils ver. 0.4
//Includes minimal mat3 support
//Includes texture operations
//Includes initInteraction() function

export class utils {
	static createAndCompileShaders = function (
		gl: WebGL2RenderingContext,
		shaderText: string[]
	) {
		var vertexShader = utils.createShader(
			gl,
			gl.VERTEX_SHADER,
			shaderText[0]
		);
		var fragmentShader = utils.createShader(
			gl,
			gl.FRAGMENT_SHADER,
			shaderText[1]
		);

		var program = utils.createProgram(gl, vertexShader, fragmentShader);

		return program;
	};

	static createShader = function (
		gl: WebGL2RenderingContext,
		type: number,
		source: string
	) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (success) {
			return shader;
		} else {
			console.log(gl.getShaderInfoLog(shader)); // eslint-disable-line
			if (type == gl.VERTEX_SHADER) {
				alert(
					"ERROR IN VERTEX SHADER : " + gl.getShaderInfoLog(shader)
				);
			}
			if (type == gl.FRAGMENT_SHADER) {
				alert(
					"ERROR IN FRAGMENT SHADER : " + gl.getShaderInfoLog(shader)
				);
			}
			gl.deleteShader(shader);
			throw "could not compile shader:" + gl.getShaderInfoLog(shader);
		}
	};

	static createProgram = function (
		gl: WebGL2RenderingContext,
		vertexShader: WebGLShader,
		fragmentShader: WebGLShader
	) {
		var program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		var success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (success) {
			return program;
		} else {
			throw "program filed to link:" + gl.getProgramInfoLog(program);
			console.log(gl.getProgramInfoLog(program)); // eslint-disable-line
			gl.deleteProgram(program);
			return undefined;
		}
	};

	static resizeCanvasToDisplaySize = function (
		canvas: HTMLCanvasElement,
		callback?: () => void
	) {
		const expandFullScreen = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			// console.log(
			//   `Canvas Width = ${canvas.width}\nWindow Width = ${window.innerWidth}`
			// );
			callback();
		};
		expandFullScreen();
		// Resize screen when the browser has triggered the resize event
		window.addEventListener("resize", expandFullScreen);
	};

	//function to convert decimal value of colors
	static decimalToHexWithPadding = function (d: string, padding: number = 2) {
		var hex = Number(d).toString(16);
		while (hex.length < padding) {
			hex = "0" + hex;
		}

		return hex;
	};

	static isPowerOfTwo = function (x: number) {
		return (x & (x - 1)) == 0;
	};

	static getNextHighestPowerOfTwo = function (x: number) {
		--x;
		for (var i = 1; i < 32; i <<= 1) {
			x = x | (x >> i);
		}
		return x + 1;
	};

	//*** MATH LIBRARY

	static degToRad = function (angle: number) {
		return (angle * Math.PI) / 180;
	};

	static radToDeg = function (angle: number) {
		return (angle * 180) / Math.PI;
	};

	static identityMatrix = function () {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	};

	static identityMatrix3 = function () {
		return [1, 0, 0, 0, 1, 0, 0, 0, 1];
	};

	// returns the 3x3 submatrix from a Matrix4x4
	static sub3x3from4x4 = function (m: number[]): number[] {
		let out = [];
		out[0] = m[0];
		out[1] = m[1];
		out[2] = m[2];
		out[3] = m[4];
		out[4] = m[5];
		out[5] = m[6];
		out[6] = m[8];
		out[7] = m[9];
		out[8] = m[10];
		return out;
	};

	// Multiply the mat3 with a vec3.
	static multiplyMatrix3Vector3 = function (
		m: number[],
		a: number[]
	): number[] {
		let out = [];
		var x = a[0],
			y = a[1],
			z = a[2];
		out[0] = x * m[0] + y * m[1] + z * m[2];
		out[1] = x * m[3] + y * m[4] + z * m[5];
		out[2] = x * m[6] + y * m[7] + z * m[8];
		return out;
	};

	//Transpose the values of a mat3

	static transposeMatrix3 = function (a: number[]): number[] {
		let out = [];

		out[0] = a[0];
		out[1] = a[3];
		out[2] = a[6];
		out[3] = a[1];
		out[4] = a[4];
		out[5] = a[7];
		out[6] = a[2];
		out[7] = a[5];
		out[8] = a[8];

		return out;
	};

	static invertMatrix3 = function (m: number[]): number[] {
		var out = [];
		var a00 = m[0],
			a01 = m[1],
			a02 = m[2],
			a10 = m[3],
			a11 = m[4],
			a12 = m[5],
			a20 = m[6],
			a21 = m[7],
			a22 = m[8],
			b01 = a22 * a11 - a12 * a21,
			b11 = -a22 * a10 + a12 * a20,
			b21 = a21 * a10 - a11 * a20,
			// Calculate the determinant
			det = a00 * b01 + a01 * b11 + a02 * b21;

		if (!det) {
			return null;
		}
		det = 1.0 / det;

		out[0] = b01 * det;
		out[1] = (-a22 * a01 + a02 * a21) * det;
		out[2] = (a12 * a01 - a02 * a11) * det;
		out[3] = b11 * det;
		out[4] = (a22 * a00 - a02 * a20) * det;
		out[5] = (-a12 * a00 + a02 * a10) * det;
		out[6] = b21 * det;
		out[7] = (-a21 * a00 + a01 * a20) * det;
		out[8] = (a11 * a00 - a01 * a10) * det;

		return out;
	};

	//requires as a parameter a 4x4 matrix (array of 16 values)
	static invertMatrix = function (m: number[]): number[] {
		var out = [];
		var inv = [];
		var det, i;

		inv[0] =
			m[5] * m[10] * m[15] -
			m[5] * m[11] * m[14] -
			m[9] * m[6] * m[15] +
			m[9] * m[7] * m[14] +
			m[13] * m[6] * m[11] -
			m[13] * m[7] * m[10];

		inv[4] =
			-m[4] * m[10] * m[15] +
			m[4] * m[11] * m[14] +
			m[8] * m[6] * m[15] -
			m[8] * m[7] * m[14] -
			m[12] * m[6] * m[11] +
			m[12] * m[7] * m[10];

		inv[8] =
			m[4] * m[9] * m[15] -
			m[4] * m[11] * m[13] -
			m[8] * m[5] * m[15] +
			m[8] * m[7] * m[13] +
			m[12] * m[5] * m[11] -
			m[12] * m[7] * m[9];

		inv[12] =
			-m[4] * m[9] * m[14] +
			m[4] * m[10] * m[13] +
			m[8] * m[5] * m[14] -
			m[8] * m[6] * m[13] -
			m[12] * m[5] * m[10] +
			m[12] * m[6] * m[9];

		inv[1] =
			-m[1] * m[10] * m[15] +
			m[1] * m[11] * m[14] +
			m[9] * m[2] * m[15] -
			m[9] * m[3] * m[14] -
			m[13] * m[2] * m[11] +
			m[13] * m[3] * m[10];

		inv[5] =
			m[0] * m[10] * m[15] -
			m[0] * m[11] * m[14] -
			m[8] * m[2] * m[15] +
			m[8] * m[3] * m[14] +
			m[12] * m[2] * m[11] -
			m[12] * m[3] * m[10];

		inv[9] =
			-m[0] * m[9] * m[15] +
			m[0] * m[11] * m[13] +
			m[8] * m[1] * m[15] -
			m[8] * m[3] * m[13] -
			m[12] * m[1] * m[11] +
			m[12] * m[3] * m[9];

		inv[13] =
			m[0] * m[9] * m[14] -
			m[0] * m[10] * m[13] -
			m[8] * m[1] * m[14] +
			m[8] * m[2] * m[13] +
			m[12] * m[1] * m[10] -
			m[12] * m[2] * m[9];

		inv[2] =
			m[1] * m[6] * m[15] -
			m[1] * m[7] * m[14] -
			m[5] * m[2] * m[15] +
			m[5] * m[3] * m[14] +
			m[13] * m[2] * m[7] -
			m[13] * m[3] * m[6];

		inv[6] =
			-m[0] * m[6] * m[15] +
			m[0] * m[7] * m[14] +
			m[4] * m[2] * m[15] -
			m[4] * m[3] * m[14] -
			m[12] * m[2] * m[7] +
			m[12] * m[3] * m[6];

		inv[10] =
			m[0] * m[5] * m[15] -
			m[0] * m[7] * m[13] -
			m[4] * m[1] * m[15] +
			m[4] * m[3] * m[13] +
			m[12] * m[1] * m[7] -
			m[12] * m[3] * m[5];

		inv[14] =
			-m[0] * m[5] * m[14] +
			m[0] * m[6] * m[13] +
			m[4] * m[1] * m[14] -
			m[4] * m[2] * m[13] -
			m[12] * m[1] * m[6] +
			m[12] * m[2] * m[5];

		inv[3] =
			-m[1] * m[6] * m[11] +
			m[1] * m[7] * m[10] +
			m[5] * m[2] * m[11] -
			m[5] * m[3] * m[10] -
			m[9] * m[2] * m[7] +
			m[9] * m[3] * m[6];

		inv[7] =
			m[0] * m[6] * m[11] -
			m[0] * m[7] * m[10] -
			m[4] * m[2] * m[11] +
			m[4] * m[3] * m[10] +
			m[8] * m[2] * m[7] -
			m[8] * m[3] * m[6];

		inv[11] =
			-m[0] * m[5] * m[11] +
			m[0] * m[7] * m[9] +
			m[4] * m[1] * m[11] -
			m[4] * m[3] * m[9] -
			m[8] * m[1] * m[7] +
			m[8] * m[3] * m[5];

		inv[15] =
			m[0] * m[5] * m[10] -
			m[0] * m[6] * m[9] -
			m[4] * m[1] * m[10] +
			m[4] * m[2] * m[9] +
			m[8] * m[1] * m[6] -
			m[8] * m[2] * m[5];

		det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

		if (det == 0) return (out = utils.identityMatrix());

		det = 1.0 / det;

		for (i = 0; i < 16; i++) {
			out[i] = inv[i] * det;
		}

		return out;
	};

	static transposeMatrix = function (m: number[]): number[] {
		var out = [];

		var row, column, row_offset;

		row_offset = 0;
		for (row = 0; row < 4; ++row) {
			row_offset = row * 4;
			for (column = 0; column < 4; ++column) {
				out[row_offset + column] = m[row + column * 4];
			}
		}
		return out;
	};

	static multiplyMatrices = function (...m: number[][]): number[] {
		let i = m.length - 1;
		let res = m[i];
		i--;

		for (; i >= 0; i--) {
			res = utils.multiplyTwo(m[i], res);
		}

		return res;
	};

	static multiplyTwo = function (m1: number[], m2: number[]): number[] {
		// Perform matrix product  { out = m1 * m2;}
		var out = [];

		var row, column, row_offset;

		row_offset = 0;
		for (row = 0; row < 4; ++row) {
			row_offset = row * 4;
			for (column = 0; column < 4; ++column) {
				out[row_offset + column] =
					m1[row_offset + 0] * m2[column + 0] +
					m1[row_offset + 1] * m2[column + 4] +
					m1[row_offset + 2] * m2[column + 8] +
					m1[row_offset + 3] * m2[column + 12];
			}
		}
		return out;
	};

	static multiplyMatrixVector = function (
		m: number[],
		v: number[]
	): number[] {
		/* Mutiplies a matrix [m] by a vector [v] */

		var out = [];

		var row, row_offset;

		row_offset = 0;
		for (row = 0; row < 4; ++row) {
			row_offset = row * 4;

			out[row] =
				m[row_offset + 0] * v[0] +
				m[row_offset + 1] * v[1] +
				m[row_offset + 2] * v[2] +
				m[row_offset + 3] * v[3];
		}
		return out;
	};

	//*** MODEL MATRIX OPERATIONS

	static MakeTranslateMatrix = (dx: number, dy: number, dz: number) => {
		// Create a transform matrix for a translation of ({dx}, {dy}, {dz}).

		var out = utils.identityMatrix();

		out[3] = dx;
		out[7] = dy;
		out[11] = dz;
		return out;
	};

	static MakeRotateXMatrix = (a: number) => {
		// Create a transform matrix for a rotation of {a} along the X axis.

		var out = utils.identityMatrix();

		var adeg = utils.degToRad(a);
		var c = Math.cos(adeg);
		var s = Math.sin(adeg);

		out[5] = out[10] = c;
		out[6] = -s;
		out[9] = s;

		return out;
	};

	static MakeRotateYMatrix = (a: number) => {
		// Create a transform matrix for a rotation of {a} along the Y axis.

		var out = utils.identityMatrix();

		var adeg = utils.degToRad(a);

		var c = Math.cos(adeg);
		var s = Math.sin(adeg);

		out[0] = out[10] = c;
		out[2] = -s;
		out[8] = s;

		return out;
	};

	static MakeRotateZMatrix = (a: number) => {
		// Create a transform matrix for a rotation of {a} along the Z axis.

		var out = utils.identityMatrix();

		var adeg = utils.degToRad(a);
		var c = Math.cos(adeg);
		var s = Math.sin(adeg);

		out[0] = out[5] = c;
		out[4] = -s;
		out[1] = s;

		return out;
	};

	static MakeRotateXYZMatrix = (rx: number, ry: number, rz: number) => {
		//Creates a world matrix for an object.

		var Rx = utils.MakeRotateXMatrix(ry);
		var Ry = utils.MakeRotateYMatrix(rx);
		var Rz = utils.MakeRotateZMatrix(rz);

		let out = utils.multiplyMatrices(Ry, Rz);
		out = utils.multiplyMatrices(Rx, out);

		return out;
	};

	static MakeScaleMatrix = (s: number) => {
		// Create a transform matrix for proportional scale

		var out = utils.identityMatrix();

		out[0] = out[5] = out[10] = s;

		return out;
	};

	//***Projection Matrix operations
	static MakeWorld = (
		tx: number,
		ty: number,
		tz: number,
		rx: number,
		ry: number,
		rz: number,
		s: number
	) => {
		//Creates a world matrix for an object.

		var Rx = utils.MakeRotateXMatrix(ry);
		var Ry = utils.MakeRotateYMatrix(rx);
		var Rz = utils.MakeRotateZMatrix(rz);
		var S = utils.MakeScaleMatrix(s);
		var T = utils.MakeTranslateMatrix(tx, ty, tz);

		let out = utils.multiplyMatrices(Rz, S);
		out = utils.multiplyMatrices(Ry, out);
		out = utils.multiplyMatrices(Rx, out);
		out = utils.multiplyMatrices(T, out);

		return out;
	};

	static MakeView = (
		cx: number,
		cy: number,
		cz: number,
		elev: number,
		ang: number
	) => {
		// Creates in {out} a view matrix. The camera is centerd in ({cx}, {cy}, {cz}).
		// It looks {ang} degrees on y axis, and {elev} degrees on the x axis.

		var T = [];
		var Rx = [];
		var Ry = [];
		var tmp = [];
		var out = [];

		T = utils.MakeTranslateMatrix(-cx, -cy, -cz);
		Rx = utils.MakeRotateXMatrix(-elev);
		Ry = utils.MakeRotateYMatrix(-ang);

		tmp = utils.multiplyMatrices(Ry, T);
		out = utils.multiplyMatrices(Rx, tmp);

		return out;
	};

	static LookAt = function (
		cameraPosition: number[],
		target: number[],
		up: number[],
		dst?: number[]
	) {
		dst = dst || new Array<number>(16);
		var zAxis = utils.normalize(
			utils.subtractVectors(cameraPosition, target)
		);
		var xAxis = utils.normalize(utils.cross(up, zAxis));
		var yAxis = utils.normalize(utils.cross(zAxis, xAxis));

		dst[0] = xAxis[0];
		dst[1] = yAxis[0];
		dst[2] = zAxis[0];
		dst[3] = cameraPosition[0];
		dst[4] = xAxis[1];
		dst[5] = yAxis[1];
		dst[6] = zAxis[1];
		dst[7] = cameraPosition[1];
		dst[8] = xAxis[2];
		dst[9] = yAxis[2];
		dst[10] = zAxis[2];
		dst[11] = cameraPosition[2];
		dst[12] = 0.0;
		dst[13] = 0.0;
		dst[14] = 0.0;
		dst[15] = 1.0;

		return dst;
	};

	static normalize = (v: number[], dst?: number[]): number[] => {
		dst = dst || new Array<number>(3);
		var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
		// make sure we don't divide by 0.
		if (length > 0.00001) {
			dst[0] = v[0] / length;
			dst[1] = v[1] / length;
			dst[2] = v[2] / length;
		}
		return dst;
	};

	static dot = (a: number[], b: number[]) => {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	};

	static cross = (a: number[], b: number[], dst?: number[]) => {
		dst = dst || new Array<number>(3);
		dst[0] = a[1] * b[2] - a[2] * b[1];
		dst[1] = a[2] * b[0] - a[0] * b[2];
		dst[2] = a[0] * b[1] - a[1] * b[0];
		return dst;
	};

	static multiplyVectorScalar = (v: number[], a: number): number[] => [
		v[0] * a,
		v[1] * a,
		v[2] * a,
	];

	static addVectors = (a: number[], b: number[], dst?: number[]) => {
		dst = dst || new Array<number>(3);
		dst[0] = a[0] + b[0];
		dst[1] = a[1] + b[1];
		dst[2] = a[2] + b[2];
		return dst;
	};

	static subtractVectors = (a: number[], b: number[], dst?: number[]) => {
		dst = dst || new Array<number>(3);
		dst[0] = a[0] - b[0];
		dst[1] = a[1] - b[1];
		dst[2] = a[2] - b[2];
		return dst;
	};

	static copy = (src: number[], dst: number[]) => {
		dst = dst || new Array<number>(16);

		dst[0] = src[0];
		dst[1] = src[1];
		dst[2] = src[2];
		dst[3] = src[3];
		dst[4] = src[4];
		dst[5] = src[5];
		dst[6] = src[6];
		dst[7] = src[7];
		dst[8] = src[8];
		dst[9] = src[9];
		dst[10] = src[10];
		dst[11] = src[11];
		dst[12] = src[12];
		dst[13] = src[13];
		dst[14] = src[14];
		dst[15] = src[15];

		return dst;
	};

	static MakePerspective = (
		fovy: number,
		a: number,
		n: number,
		f: number
	) => {
		// Creates the perspective projection matrix. The matrix is returned.
		// {fovy} contains the vertical field-of-view in degrees. {a} is the aspect ratio.
		// {n} is the distance of the near plane, and {f} is the far plane.

		var perspective = utils.identityMatrix();

		var halfFovyRad = utils.degToRad(fovy / 2); // stores {fovy/2} in radiants
		var ct = 1.0 / Math.tan(halfFovyRad); // cotangent of {fov/2}

		perspective[0] = ct / a;
		perspective[5] = ct;
		perspective[10] = (f + n) / (n - f);
		perspective[11] = (2.0 * f * n) / (n - f);
		perspective[14] = -1.0;
		perspective[15] = 0.0;

		return perspective;
	};

	// Orthogonal
	static MakeOrthogonal = (w: number, a: number, n: number, f: number) => {
		return [
			1 / w,
			0.0,
			0.0,
			0.0,
			0.0,
			a / w,
			0.0,
			0.0,
			0.0,
			0.0,
			-2 / (f - n),
			-(f + n) / (f - n),
			0.0,
			0.0,
			0.0,
			1.0,
		];
	};

	// Axonometry
	static MakeIsometric = (w: number, a: number, n: number, f: number) => {
		return utils.MakeDimetric(w, a, n, f, 35.26);
	};

	static MakeDimetric = (
		w: number,
		a: number,
		n: number,
		f: number,
		angle: number
	) => {
		return utils.MakeTrimetric(w, a, n, f, angle, 45);
	};

	static MakeTrimetric = (
		w: number,
		a: number,
		n: number,
		f: number,
		Xangle: number,
		Yangle: number
	) => {
		return utils.multiplyMatrices(
			utils.MakeOrthogonal(w, a, n, f),
			utils.MakeRotateXMatrix(Xangle),
			utils.MakeRotateYMatrix(Yangle)
		);
	};

	static ComputePosition(m: number[], v: number[]) {
		if (v.length < 4) v[3] = 1;

		const p = utils.multiplyMatrixVector(m, v);

		return [p[0] / p[3], p[1] / p[3], p[2] / p[3]];
	}

	static Clamp = (value: number, min: number, max: number) => {
		return Math.min(max, Math.max(min, value));
	};

	static Distance = (a: number[], b: number[]) => {
		let sum = 0;
		for (let i = 0; i < a.length; i++) {
			sum += Math.pow(a[i] - b[i], 2);
		}
		return Math.sqrt(sum);
	};

	static LerpAngle = (a: number, b: number, interp: number) => {
		// Assuming [-PI,PI]
		// Which way should we move?
		let distance = b - a;
		if (a > 0 && b < 0) {
			// distance is negative
			let otherDistance = Math.PI - a + (Math.PI + b); // positive
			if (otherDistance <= -distance) distance = otherDistance;
		} else if (a < 0 && b > 0) {
			// distance is positive
			let otherDistance = Math.PI + a + (Math.PI - b); // positive
			if (otherDistance <= distance) {
				distance = -otherDistance;
			}
		}
		return a + distance * interp;
	};
}
