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
import brick_OBJ from "../assets/brick/brick.obj";
import baseTextureSrc from "../assets/brick/obj00_renga_alb.png";
import normalMapSrc from "../assets/brick/obj00_renga_nml.png";
import { gl } from "../engine/Core";
import { BOX_DEFAULT_BOUNDS, IBoxBounds } from "../engine/Physics";

// Define common structure for state of these nodes
interface BrickState extends IRenderableState, IBoxBounds {}

let programInfo: WebGLProgramInfo;
let vao: WebGLVertexArrayObject;
let baseTexture: () => void;
let normalMap: () => void;

export function Init() {
	// SHADERS
	programInfo = getShader(Features.Texture | Features.NormalMap);
	gl.useProgram(programInfo.program);

	// CREATE MODEL
	vao = MakeVAO(programInfo.program, {
		positions: brick_OBJ.vertices,
		normals: brick_OBJ.vertexNormals,
		indices: brick_OBJ.indices,
		uvCoord: brick_OBJ.textures,
	});

	baseTexture = MakeTexture(programInfo, {
		dataSrc: baseTextureSrc,
		type: TextureType.BaseTexture,
	});
	normalMap = MakeTexture(programInfo, {
		dataSrc: normalMapSrc,
		type: TextureType.NormalMap,
	});
}

export function Spawn(spawnCoord: number[], mapRoot: Node<State>) {
	// SETUP NODES
	let tMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(spawnCoord[0], spawnCoord[1], spawnCoord[2]),
		utils.MakeScaleMatrix(1)
	);
	var brickNode = new RenderNode<BrickState>("block-brick", tMatrix);
	brickNode.state = {
		// box
		bounds: BOX_DEFAULT_BOUNDS,
		// render
		materialColor: [0.0, 0.0, 0.0],
		materialAmbColor: [1, 1, 1],
		materialSpecColor: [0.3, 0.3, 0.3],
		materialEmitColor: [0.0, 0.0, 0.0],
		programInfo: programInfo,
		bufferLength: brick_OBJ.indices.length,
		vertexArrayObject: vao,
		texture: baseTexture,
		normalMap: normalMap,
		...brickNode.state,
	};

	// Set relationships between nodes
	brickNode.SetParent(mapRoot);

	return brickNode;
}
