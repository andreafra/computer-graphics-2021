// Utility function for allocating buffers for simple models

interface Data {
	vertices: number[];
	vertexNormals: number[];
	uv?: number[];
	indices: number[];
}

interface Locations {
	verticesAttribLocation: number;
	vertexNormalsAttribLocation: number;
	uvAttribLocation?: number;
}

export function createVAO(
	gl: WebGL2RenderingContext,
	data: Data,
	locations: Locations
) {
	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	const verticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(data.vertices),
		gl.STATIC_DRAW
	);
	gl.enableVertexAttribArray(locations.verticesAttribLocation);
	gl.vertexAttribPointer(
		locations.verticesAttribLocation,
		3,
		gl.FLOAT,
		false,
		0,
		0
	);

	const normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(data.vertexNormals),
		gl.STATIC_DRAW
	);
	gl.enableVertexAttribArray(locations.vertexNormalsAttribLocation);
	gl.vertexAttribPointer(
		locations.vertexNormalsAttribLocation,
		3,
		gl.FLOAT,
		false,
		0,
		0
	);

	var indicesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
	gl.bufferData(
		gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(data.indices),
		gl.STATIC_DRAW
	);

	if (data.uv && locations.uvAttribLocation) {
		const uvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(data.uv),
			gl.STATIC_DRAW
		);
		gl.enableVertexAttribArray(locations.uvAttribLocation);
		gl.vertexAttribPointer(
			locations.uvAttribLocation,
			2,
			gl.FLOAT,
			false,
			0,
			0
		);
	}

	return vao;
}
