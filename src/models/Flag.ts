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
import flagPole_OBJ from "../assets/flag/flagpole.obj";
import { gl } from "../engine/Core";
import { BOX_DEFAULT_BOUNDS, IBoxBounds } from "../engine/Physics";

// Define common structure for state of these nodes
interface FlagState extends IRenderableState, IBoxBounds {}

export enum Type {
	Start = 0,
	Finish,
}

let programInfo: WebGLProgramInfo;
let flagVao: WebGLVertexArrayObject;
let poleVao: WebGLVertexArrayObject;

export function Init() {
	// SHADERS
	programInfo = getShader(0);
	gl.useProgram(programInfo.program);

	// CREATE MODEL
	flagVao = MakeVAO(programInfo.program, {
		positions: flag_OBJ.vertices,
		normals: flag_OBJ.vertexNormals,
		indices: flag_OBJ.indices,
	});
	poleVao = MakeVAO(programInfo.program, {
		positions: flagPole_OBJ.vertices,
		normals: flagPole_OBJ.vertexNormals,
		indices: flagPole_OBJ.indices,
	});
}

export function Spawn(type: Type, spawnCoord: number[], mapRoot: Node<State>) {
	// SETUP NODES
	let tMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(spawnCoord[0], spawnCoord[1], spawnCoord[2]),
		utils.MakeScaleMatrix(1)
	);

	let flagNode = new RenderNode<FlagState>(
		`flag-${Type[type].toLowerCase()}`,
		tMatrix
	);
	flagNode.state = {
		bounds: [
			[0, 0, 0],
			[0, 0, 0],
		],
		// render
		materialColor: [
			type == Type.Start ? 0.3 : 0.9,
			type == Type.Start ? 0.9 : 0.3,
			0.1,
		],
		materialAmbColor: [1.0, 1.0, 1.0],
		materialSpecColor: [0.3, 0.3, 0.3],
		materialEmitColor: [0.0, 0.0, 0.0],
		programInfo: programInfo,
		bufferLength: flag_OBJ.indices.length,
		vertexArrayObject: flagVao,
		...flagNode.state,
	};

	let poleNode = new RenderNode<FlagState>(
		`flag-${Type[type].toLowerCase()}-pole`
	);
	poleNode.state = {
		bounds: [
			[0, 0, 0],
			[0, 0, 0],
		],
		// render
		materialColor: [0.627, 0.384, 0.224],
		materialAmbColor: [1.0, 1.0, 1.0],
		materialSpecColor: [1.0, 1.0, 1.0],
		materialEmitColor: [0.0, 0.0, 0.0],
		programInfo: programInfo,
		bufferLength: flagPole_OBJ.indices.length,
		vertexArrayObject: poleVao,
		...poleNode.state,
	};

	// Set relationships between nodes
	poleNode.SetParent(flagNode);
	flagNode.SetParent(mapRoot);

	return flagNode;
}
