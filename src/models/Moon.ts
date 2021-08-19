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
import moon_OBJ from "../assets/moon/moon.obj";
import baseTextureSrc from "../assets/moon/Textures/shinebody_alb.png";
import normalMapSrc from "../assets/moon/Textures/shinebody_nrm.png";
import emissMapSrc from "../assets/moon/Textures/shinebody_emm.png";
import { gl } from "../engine/Core";
import { BOX_DEFAULT_BOUNDS, IBoxBounds } from "../engine/Physics";

// Define common structure for state of these nodes
interface MoonState extends IRenderableState, IBoxBounds {}

let programInfo: WebGLProgramInfo;
let vao: WebGLVertexArrayObject;
let baseTexture: () => void;
let normalMap: () => void;
let emissiveMap: () => void;

export function Init() {
	// SHADERS
	programInfo = getShader(
		Features.Texture | Features.NormalMap | Features.EmissiveMap
	);
	gl.useProgram(programInfo.program);

	// CREATE MODEL
	vao = MakeVAO(programInfo.program, {
		positions: moon_OBJ.vertices,
		normals: moon_OBJ.vertexNormals,
		indices: moon_OBJ.indices,
		uvCoord: moon_OBJ.textures,
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
		dataSrc: emissMapSrc,
		type: TextureType.EmissiveMap,
	});
}

export function Spawn(spawnCoord: number[], mapRoot: Node<State>) {
	// SETUP NODES
	let tMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(spawnCoord[0], spawnCoord[1], spawnCoord[2]),
		utils.MakeScaleMatrix(1)
	);
	var moonNode = new RenderNode<MoonState>("moon", tMatrix);
	moonNode.state = {
		bounds: BOX_DEFAULT_BOUNDS,
		// render
		materialColor: [1.0, 1.0, 1.0],
		materialAmbColor: [0, 0, 0],
		materialSpecColor: [0.3, 0.3, 0.3],
		materialEmitColor: [0, 0.9, 0], // Use emissive map instead
		programInfo: programInfo,
		bufferLength: moon_OBJ.indices.length,
		vertexArrayObject: vao,
		texture: baseTexture,
		normalMap: normalMap,
		emissiveMap: emissiveMap,
		...moonNode.state,
	};

	// Set relationships between nodes
	moonNode.SetParent(mapRoot);

	return moonNode;
}
