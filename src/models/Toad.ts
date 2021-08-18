import * as Engine from "../engine/Core";
import { MakeTexture, MakeVAO, TextureType } from "../engine/Models";
import { RenderNode, State } from "../engine/SceneGraph";
import { getShader, Features, WebGLProgramInfo } from "../engine/Shaders";
import { gl } from "../engine/Core";
import { utils } from "../utils/utils";
import { Light } from "../engine/Lights";
import { LightNode } from "../engine/SceneGraph";
import * as Input from "../Input";
import { GetMode } from "../main";

// Assets
import toad_OBJ from "../assets/cpt_toad/toad.obj";
import bodyTextureSrc from "../assets/cpt_toad/Textures/baked_txt.png";
import emissiveMapSrc from "../assets/cpt_toad/Textures/baked_emm.png";
import normalMapSrc from "../assets/cpt_toad/Textures/baked_nrm.png";
import specularMapSrc from "../assets/cpt_toad/Textures/baked_spc.png";
import ambientOcclusionSrc from "../assets/cpt_toad/Textures/baked_ao.png";
import { GetActiveCamera } from "../main";
import { DrawLine, LineColor } from "../engine/debug/Lines";

// Define common structure for state of these nodes
interface ToadState extends State {
	moveSpeed: number;
}

let programInfo: WebGLProgramInfo;
let vao: WebGLVertexArrayObject;
let baseTexture: () => void;
let emissiveMap: () => void;
let normalMap: () => void;
let specularMap: () => void;
let ambientOcclusion: () => void;

export function Init() {
	// SHADERS
	programInfo = getShader(
		Features.Texture |
			Features.EmissiveMap |
			Features.NormalMap |
			Features.SpecularMap |
			Features.AmbientOcclusion
	);
	gl.useProgram(programInfo.program);

	// CREATE MODEL
	vao = MakeVAO(programInfo.program, {
		positions: toad_OBJ.vertices,
		normals: toad_OBJ.vertexNormals,
		indices: toad_OBJ.indices,
		uvCoord: toad_OBJ.textures,
	});

	baseTexture = MakeTexture(programInfo, {
		dataSrc: bodyTextureSrc,
		type: TextureType.BaseTexture,
	});
	emissiveMap = MakeTexture(programInfo, {
		dataSrc: emissiveMapSrc,
		type: TextureType.EmissiveMap,
	});
	normalMap = MakeTexture(programInfo, {
		dataSrc: normalMapSrc,
		type: TextureType.NormalMap,
	});
	specularMap = MakeTexture(programInfo, {
		dataSrc: specularMapSrc,
		type: TextureType.SpecularMap,
	});
	ambientOcclusion = MakeTexture(programInfo, {
		dataSrc: ambientOcclusionSrc,
		type: TextureType.AmbientOcclusion,
	});
}

export function Spawn() {
	// SETUP NODES
	let tMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(0, 0, 0),
		utils.MakeScaleMatrix(1)
	);
	var toadNode = new RenderNode<ToadState>("cpt-toad", tMatrix);
	toadNode.state.drawInfo = {
		materialColor: [0.0, 0.0, 0.0],
		materialAmbColor: [1, 1, 1],
		materialSpecColor: [0.3, 0.3, 0.3],
		materialEmitColor: [0, 0, 0], // Use emissive map instead
		programInfo: programInfo,
		bufferLength: toad_OBJ.indices.length,
		vertexArrayObject: vao,
		texture: baseTexture,
		emissiveMap: emissiveMap,
		normalMap: normalMap,
		specularMap: specularMap,
		ambientOcclusion: ambientOcclusion,
	};

	toadNode.state.moveSpeed = 2.0;

	var headLight = new LightNode<State>(
		"headlight",
		Light.MakeSpot(
			[1, 0.9, 0.5, 1.0], // color
			120, // coneOut, deg°
			0.5, // coneIn, %
			0.7, // targetDistance
			1 // decay
		),
		utils.multiplyMatrices(
			utils.MakeTranslateMatrix(0, 0.93, 0.5),
			utils.MakeRotateYMatrix(90)
		)
	);

	toadNode.AddAction(MovementAction);

	// Set relationships between nodes
	headLight.SetParent(toadNode);
	toadNode.SetParent(Engine.ROOT_NODE);

	return toadNode;
}

const MovementAction = (deltaTime: number, state: ToadState): void => {
	if (GetMode() != "GAME") return;

	let position = utils.ComputePosition(state.localMatrix, [0, 0, 0]);

	let camera = GetActiveCamera();

	let alpha = Math.atan2(camera.normDir[0], camera.normDir[2]);

	let localDir = [
		-Math.sin(alpha) * Input.moveDir[2] +
			Math.cos(alpha) * Input.moveDir[0],
		0,
		-Math.cos(alpha) * Input.moveDir[2] +
			-Math.sin(alpha) * Input.moveDir[0],
	];

	let input = utils.multiplyVectorScalar(
		localDir,
		deltaTime * state.moveSpeed
	);

	state.localMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(input[0], input[1], input[2]),
		state.localMatrix
	);

	// Camera follow toad
	camera.translation = position;
	camera.Update();
};
