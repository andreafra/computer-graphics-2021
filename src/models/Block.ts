import { MakeTexture, MakeVAO, TextureType } from "../engine/Models";
import { RenderNode, Node, State } from "../engine/SceneGraph";
import { utils } from "../utils/utils";
import { getShader, Features } from "../engine/Shaders";

// Assets
import cube_W_OBJ from "../assets/cube/cube_white.obj";
import cube_Y_OBJ from "../assets/cube/cube_yellow.obj";
import cubeTextureSrc from "../assets/cube/grass.png";
import cubeNormMapSrc from "../assets/cube/grass_norm.png";

import { gl } from "../engine/Core";

// Define common structure for state of these nodes
interface CubeState extends State {}

export enum Type {
	White = 0,
	Yellow = 1,
}

const MESHES = [cube_W_OBJ, cube_Y_OBJ];

export function init(
	type: Type,
	translateVec: number[],
	parentNode: Node<State>
) {
	let blockOBJ = MESHES[type];

	// SHADERS
	const programInfo = getShader(Features.Texture | Features.NormalMap);
	gl.useProgram(programInfo.program);

	// CREATE MODEL
	const vao = MakeVAO(programInfo.program, {
		positions: blockOBJ.vertices,
		normals: blockOBJ.vertexNormals,
		indices: blockOBJ.indices,
		uvCoord: blockOBJ.textures,
	});

	const baseTexture = MakeTexture(programInfo, {
		dataSrc: cubeTextureSrc,
		type: TextureType.BaseTexture,
	});

	const normMap = MakeTexture(programInfo, {
		dataSrc: cubeNormMapSrc,
		type: TextureType.NormalMap,
	});

	// SETUP NODES
	let tMatrix = utils.MakeTranslateMatrix(
		translateVec[0],
		translateVec[1],
		translateVec[2]
	);
	var blockNode = new RenderNode<CubeState>(`block-${type}`, tMatrix);
	blockNode.state.drawInfo = {
		materialColor: [0, 0, 0],
		materialSpecColor: [0.2, 0.2, 0.2],
		materialEmitColor: [0, 0, 0],
		programInfo: programInfo,
		bufferLength: blockOBJ.indices.length,
		vertexArrayObject: vao,
		texture: baseTexture,
		normalMap: normMap,
	};

	// Set relationships between nodes
	blockNode.SetParent(parentNode);
}
