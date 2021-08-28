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
import cube_W_OBJ from "../assets/cube/cube_white.obj";
import cube_Y_OBJ from "../assets/cube/cube_yellow.obj";
import cube_W_TextureSrc from "../assets/cube/grass_white.png";
import cube_Y_TextureSrc from "../assets/cube/grass_yellow.png";
import cubeNormMapSrc from "../assets/cube/grass_norm.png";
import { BOX_DEFAULT_BOUNDS, IBoxBounds } from "../engine/Physics";
import { gl } from "../engine/Core";

// Define common structure for state of these nodes
type CubeState = IRenderableState & IBoxBounds;

export enum Type {
	White = 0,
	Yellow = 1,
}

const MESHES = [cube_W_OBJ, cube_Y_OBJ];
const BASE_TEXTURES_SRC = [cube_W_TextureSrc, cube_Y_TextureSrc];
const VAOS = new Array<WebGLVertexArrayObject>();
const BASE_TEXTURES = new Array<() => void>();
let programInfo: WebGLProgramInfo;
let baseTexture: () => void;
let normMap: () => void;

export function Init() {
	// SHADERS
	programInfo = getShader(Features.Texture | Features.NormalMap);
	gl.useProgram(programInfo.program);

	for (let type in Type) {
		if (isNaN(Number(type))) continue; // typescript magic to iterate the Enum values...

		let blockOBJ = MESHES[type];
		VAOS[type] = MakeVAO(programInfo.program, {
			positions: blockOBJ.vertices,
			normals: blockOBJ.vertexNormals,
			indices: blockOBJ.indices,
			uvCoord: blockOBJ.textures,
		});

		BASE_TEXTURES[type] = MakeTexture(programInfo, {
			dataSrc: BASE_TEXTURES_SRC[type],
			type: TextureType.BaseTexture,
		});
	}

	normMap = MakeTexture(programInfo, {
		dataSrc: cubeNormMapSrc,
		type: TextureType.NormalMap,
	});
}

export function Spawn(
	type: Type,
	translateVec: number[],
	parentNode: Node<State>
) {
	let blockOBJ = MESHES[type];

	// SETUP NODES
	let tMatrix = utils.MakeTranslateMatrix(
		translateVec[0],
		translateVec[1],
		translateVec[2]
	);
	var blockNode = new RenderNode<CubeState>(`block-${type + 1}`, tMatrix);
	blockNode.state = {
		// Box Bounds
		bounds: BOX_DEFAULT_BOUNDS,
		// Render
		materialColor: [0, 0, 0],
		materialAmbColor: [1, 1, 1],
		materialSpecColor: [0.2, 0.2, 0.2],
		materialEmitColor: [0, 0, 0],
		programInfo: programInfo,
		bufferLength: blockOBJ.indices.length,
		vertexArrayObject: VAOS[type],
		texture: BASE_TEXTURES[type],
		normalMap: normMap,
		...blockNode.state,
	};

	// Set relationships between nodes
	blockNode.SetParent(parentNode);

	return blockNode;
}
