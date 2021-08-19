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
import coin_OBJ from "../assets/coin/coin.obj";
import baseTextureSrc from "../assets/coin/Textures/coinbody00_alb.png";
import normalMapSrc from "../assets/coin/Textures/coinbody00_nrm.png";
import specMapSrc from "../assets/coin/Textures/coinbody00_rgh.png";
import { gl } from "../engine/Core";
import { BOX_DEFAULT_BOUNDS, IBoxBounds } from "../engine/Physics";

// Define common structure for state of these nodes
interface CoinState extends IRenderableState, IBoxBounds {}

let programInfo: WebGLProgramInfo;
let vao: WebGLVertexArrayObject;
let baseTexture: () => void;
let normalMap: () => void;
let specMap: () => void;

export function Init() {
	// SHADERS
	programInfo = getShader(
		Features.Texture | Features.NormalMap | Features.SpecularMap
	);
	gl.useProgram(programInfo.program);

	// CREATE MODEL
	vao = MakeVAO(programInfo.program, {
		positions: coin_OBJ.vertices,
		normals: coin_OBJ.vertexNormals,
		indices: coin_OBJ.indices,
		uvCoord: coin_OBJ.textures,
	});

	baseTexture = MakeTexture(programInfo, {
		dataSrc: baseTextureSrc,
		type: TextureType.BaseTexture,
	});
	normalMap = MakeTexture(programInfo, {
		dataSrc: normalMapSrc,
		type: TextureType.NormalMap,
	});
	specMap = MakeTexture(programInfo, {
		dataSrc: specMapSrc,
		type: TextureType.SpecularMap,
	});
}

export function Spawn(spawnCoord: number[], mapRoot: Node<State>) {
	// SETUP NODES
	let tMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(spawnCoord[0], spawnCoord[1], spawnCoord[2]),
		utils.MakeScaleMatrix(1)
	);
	var coinNode = new RenderNode<CoinState>("coin", tMatrix);
	coinNode.state = {
		bounds: BOX_DEFAULT_BOUNDS,
		// render
		materialColor: [1.0, 1.0, 1.0],
		materialAmbColor: [0, 0, 0],
		materialSpecColor: [0.3, 0.3, 0.3],
		materialEmitColor: [0.1, 0.1, 0.1], // Use emissive map instead
		programInfo: programInfo,
		bufferLength: coin_OBJ.indices.length,
		vertexArrayObject: vao,
		texture: baseTexture,
		normalMap: normalMap,
		specularMap: specMap,
		...coinNode.state,
	};

	// Set relationships between nodes
	coinNode.SetParent(mapRoot);

	return coinNode;
}
