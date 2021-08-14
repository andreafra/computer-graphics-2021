// Required for webpack-obj-loader, otherwise the Typescript compiler will complain about it.

interface Mesh {
	indices: number[];
	materialIndices: {
		[key: string]: number;
	};
	materialNames: string[]; // Keys of materialIndices
	name: string;
	textureStride: number;
	textures: number[];
	vertexMaterialIndices: number[];
	vertexNormals: number[];
	vertices: number[];
}

declare module "*.obj" {
	const value: Mesh;
	export default value;
}

declare module "*.glb" {
	const value: string;
	export default value;
}
