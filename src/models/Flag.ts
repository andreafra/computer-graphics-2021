import { MakeTexture, MakeVAO, TextureType } from "../engine/Models";
import {
	RenderNode,
	Node,
	State,
	IRenderableState,
} from "../engine/SceneGraph";
import { utils } from "../utils/utils";
import { getShader, Features, WebGLProgramInfo } from "../engine/Shaders";

// Assets
import flag_OBJ from "../assets/flag/flag.obj";
import { gl } from "../engine/Core";
import { BOX_DEFAULT_BOUNDS, IBoxBounds } from "../engine/Physics";

// Define common structure for state of these nodes
interface FlagState extends IRenderableState, IBoxBounds {}

export enum Type {
	Start = 0,
	Finish,
}

let programInfo: WebGLProgramInfo;
let vao: WebGLVertexArrayObject;
let baseTexture: () => void;
let normalMap: () => void;
let specMap: () => void;

export function Init() {
	// SHADERS
	programInfo = getShader(0);
	gl.useProgram(programInfo.program);

	// CREATE MODEL
	vao = MakeVAO(programInfo.program, {
		positions: flag_OBJ.vertices,
		normals: flag_OBJ.vertexNormals,
		indices: flag_OBJ.indices,
	});
}

export function Spawn(type: Type, spawnCoord: number[], mapRoot: Node<State>) {
	// SETUP NODES
	let tMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(spawnCoord[0], spawnCoord[1], spawnCoord[2]),
		utils.MakeScaleMatrix(1)
	);
	var node = new RenderNode<FlagState>(
		`flag-${Type[type].toLowerCase()}`,
		tMatrix
	);
	node.state = {
		bounds: [
			[0, 0, 0],
			[0, 0, 0],
		],
		// render
		materialColor: [
			type == Type.Start ? 0.0 : 1.0,
			type == Type.Start ? 1.0 : 0.0,
			0.1,
		],
		materialAmbColor: [1.0, 1.0, 1.0],
		materialSpecColor: [0.3, 0.3, 0.3],
		materialEmitColor: [0.0, 0.0, 0.0],
		programInfo: programInfo,
		bufferLength: flag_OBJ.indices.length,
		vertexArrayObject: vao,
		texture: baseTexture,
		normalMap: normalMap,
		specularMap: specMap,
		...node.state,
	};

	// Set relationships between nodes
	node.SetParent(mapRoot);

	return node;
}
