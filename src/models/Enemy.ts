import { MakeTexture, MakeVAO, TextureType } from "../engine/Models";
import {
	RenderNode,
	Node,
	State,
	IRenderableState,
} from "../engine/SceneGraph";
import { utils } from "../utils/utils";
import { getShader, Features, WebGLProgramInfo } from "../engine/Shaders";
import * as Engine from "../engine/Core";

// Assets
import enemy_OBJ from "../assets/enemy/enemy.obj";
import baseTextureSrc from "../assets/enemy/Textures/chorobonbody00_alb.png";
import normalMapSrc from "../assets/enemy/Textures/chorobonbody00_nrm.png";
import emissiveMapSrc from "../assets/enemy/Textures/chorobonbody00_emm.png";
import aoMapSrc from "../assets/enemy/Textures/chorobonbody00_rgh.png";
import { gl } from "../engine/Core";
import { BOX_DEFAULT_BOUNDS, IBoxBounds } from "../engine/Physics";

// Define common structure for state of these nodes
interface EnemyState extends IRenderableState, IBoxBounds {
	spawnCoord: number[];
	spawnScale: number;
	spawnTime: DOMHighResTimeStamp;
	scaleIntensity: number;
	scaleSpeed: number;
}

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

function ScaleAction(
	deltaTime: DOMHighResTimeStamp,
	node: RenderNode<EnemyState>
) {
	let state = node.state;
	let currScale = state.localMatrix[0];
	let yPos = utils.ComputePosition(state.localMatrix, [0, 0, 0])[1];

	let timeOffset = Engine.GetTime() - state.spawnTime;
	let scaleOffset =
		state.scaleIntensity *
		Math.sqrt(Math.abs(Math.sin(state.scaleSpeed * timeOffset)));
	state.localMatrix = utils.multiplyMatrices(
		state.localMatrix,
		utils.MakeScaleMatrix((state.spawnScale + scaleOffset) / currScale),
		utils.MakeTranslateMatrix(
			0,
			state.spawnCoord[1] - yPos - scaleOffset / 2, // model is centered at the bottom
			0
		)
	);
}

export function Spawn(spawnCoord: number[], mapRoot: Node<State>) {
	// SETUP NODES
	let scale = 0.7;
	spawnCoord[1] += (1 - scale) / 2;

	let tMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(spawnCoord[0], spawnCoord[1], spawnCoord[2]),
		utils.MakeScaleMatrix(scale)
	);
	var enemyNode = new RenderNode<EnemyState>("enemy", tMatrix);
	enemyNode.state = {
		bounds: BOX_DEFAULT_BOUNDS.map((pos) => pos.map((x) => x * scale)),
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
		...enemyNode.state,
	};
	enemyNode.state.spawnCoord = spawnCoord;
	enemyNode.state.spawnScale = scale;
	enemyNode.state.scaleIntensity = 0.1;
	enemyNode.state.scaleSpeed = 3;
	enemyNode.state.spawnTime = Engine.GetTime();

	enemyNode.AddAction(ScaleAction);

	// Set relationships between nodes
	enemyNode.SetParent(mapRoot);

	return enemyNode;
}
