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
import enemy_OBJ from "../assets/enemy/enemy.obj";
import baseTextureSrc from "../assets/enemy/Textures/chorobonbody00_alb.png";
import normalMapSrc from "../assets/enemy/Textures/chorobonbody00_nrm.png";
import emissiveMapSrc from "../assets/enemy/Textures/chorobonbody00_emm.png";
import aoMapSrc from "../assets/enemy/Textures/chorobonbody00_rgh.png";
import { gl } from "../engine/Core";
import { BOX_DEFAULT_BOUNDS, IBoxBounds } from "../engine/Physics";

// Define common structure for state of these nodes
interface EnemyState extends IRenderableState, IBoxBounds {}

let programInfo: WebGLProgramInfo;
let vao: WebGLVertexArrayObject;
let baseTexture: () => void;
let normalMap: () => void;
let emissiveMap: () => void;
let aoMap: () => void;

export function Init() {
	// SHADERS
	programInfo = getShader(
		Features.Texture |
			Features.NormalMap |
			Features.EmissiveMap |
			Features.AmbientOcclusion
	);
	gl.useProgram(programInfo.program);

	// CREATE MODEL
	vao = MakeVAO(programInfo.program, {
		positions: enemy_OBJ.vertices,
		normals: enemy_OBJ.vertexNormals,
		indices: enemy_OBJ.indices,
		uvCoord: enemy_OBJ.textures,
	});

	baseTexture = MakeTexture(programInfo, {
		dataSrc: baseTextureSrc,
		type: TextureType.BaseTexture,
	});
	normalMap = MakeTexture(programInfo, {
		dataSrc: normalMapSrc,
		type: TextureType.NormalMap,
	});
	emissiveMap = MakeTexture(programInfo, {
		dataSrc: emissiveMapSrc,
		type: TextureType.SpecularMap,
	});
	aoMap = MakeTexture(programInfo, {
		dataSrc: aoMapSrc,
		type: TextureType.AmbientOcclusion,
	});
}

export function Spawn(spawnCoord: number[], mapRoot: Node<State>) {
	// SETUP NODES
	let tMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(spawnCoord[0], spawnCoord[1], spawnCoord[2]),
		utils.MakeScaleMatrix(1)
	);
	var coinNode = new RenderNode<EnemyState>("enemy", tMatrix);
	coinNode.state = {
		bounds: BOX_DEFAULT_BOUNDS,
		// render
		materialColor: [1.0, 1.0, 1.0],
		materialAmbColor: [0, 0, 0],
		materialSpecColor: [0.3, 0.3, 0.3],
		materialEmitColor: [0.1, 0.1, 0.1], // Use emissive map instead
		programInfo: programInfo,
		bufferLength: enemy_OBJ.indices.length,
		vertexArrayObject: vao,
		texture: baseTexture,
		normalMap: normalMap,
		emissiveMap: emissiveMap,
		ambientOcclusion: aoMap,
		...coinNode.state,
	};

	// Set relationships between nodes
	coinNode.SetParent(mapRoot);

	return coinNode;
}
