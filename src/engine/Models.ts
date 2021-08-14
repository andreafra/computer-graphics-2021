interface TextureData {
	dataSrc: string;
	uniformName: string;
}

// Returns a function to call during the rendering step
export function MakeTexture(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	textureData: TextureData
) {
	const bodyTextureFileLoc = gl.getUniformLocation(
		program,
		textureData.uniformName
	);

	let bodyTexture: WebGLTexture;
	let bodyTextureImage = new Image();
	bodyTextureImage.src = textureData.dataSrc;
	bodyTextureImage.onload = () => {
		bodyTexture = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, bodyTexture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			bodyTextureImage
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
	};

	return () => {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, bodyTexture);
		gl.uniform1i(bodyTextureFileLoc, 0);
	};
}

const GLSL_POSITION_VAR = "a_Position";
const GLSL_NORMAL_VAR = "a_Normal";
const GLSL_UV_COORD_VAR = "a_UVCoord";

interface VertexArrayObjectData {
	positions: number[];
	normals: number[];
	uvCoord?: number[];
	indices: number[];
}

export function MakeVAO(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	data: VertexArrayObjectData
) {
	// Setup Attribute Location (requires a shader)
	// GLSL in vars names are now fixed
	const positionAttribLoc = gl.getAttribLocation(program, GLSL_POSITION_VAR);
	const normalAttribLoc = gl.getAttribLocation(program, GLSL_NORMAL_VAR);
	let uvCoordAttribLoc;
	if (data.uvCoord)
		uvCoordAttribLoc = gl.getAttribLocation(program, GLSL_UV_COORD_VAR);

	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	const verticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(data.positions),
		gl.STATIC_DRAW
	);
	gl.enableVertexAttribArray(positionAttribLoc);
	gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, 0, 0);

	const normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(data.normals),
		gl.STATIC_DRAW
	);
	gl.enableVertexAttribArray(normalAttribLoc);
	gl.vertexAttribPointer(normalAttribLoc, 3, gl.FLOAT, false, 0, 0);

	var indicesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
	gl.bufferData(
		gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(data.indices),
		gl.STATIC_DRAW
	);

	if (data.uvCoord) {
		const uvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(data.uvCoord),
			gl.STATIC_DRAW
		);
		gl.enableVertexAttribArray(uvCoordAttribLoc);
		gl.vertexAttribPointer(uvCoordAttribLoc, 2, gl.FLOAT, false, 0, 0);
	}

	return vao;
}
