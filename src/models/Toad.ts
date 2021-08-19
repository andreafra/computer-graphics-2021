import * as Engine from "../engine/Core";
import { MakeTexture, MakeVAO, TextureType } from "../engine/Models";
import { IRenderableState, RenderNode, State } from "../engine/SceneGraph";
import { getShader, Features, WebGLProgramInfo } from "../engine/Shaders";
import { gl } from "../engine/Core";
import { utils } from "../utils/utils";
import { Light } from "../engine/Lights";
import { LightNode } from "../engine/SceneGraph";
import * as Input from "../Input";
import { GetMode } from "../main";
import * as Map from "../Map";

// Assets
import toad_OBJ from "../assets/cpt_toad/toad.obj";
import bodyTextureSrc from "../assets/cpt_toad/Textures/baked_txt.png";
import emissiveMapSrc from "../assets/cpt_toad/Textures/baked_emm.png";
import normalMapSrc from "../assets/cpt_toad/Textures/baked_nrm.png";
import specularMapSrc from "../assets/cpt_toad/Textures/baked_spc.png";
import ambientOcclusionSrc from "../assets/cpt_toad/Textures/baked_ao.png";
import { GetActiveCamera } from "../main";
import { DrawLine, LineColor } from "../engine/debug/Lines";
import {
	BOX_DEFAULT_BOUNDS,
	PhysicsNode,
	PhysicsState,
} from "../engine/Physics";

// Define common structure for state of these nodes
interface ToadState extends PhysicsState {
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
	var toadNode = new PhysicsNode<ToadState>("cpt-toad", tMatrix);
	toadNode.state = {
		// Box bounds
		bounds: BOX_DEFAULT_BOUNDS,
		radius: 0.5,
		height: 1,
		// Render
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
		...toadNode.state,
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

let lookAngle = 0;
let lerping = { from: lookAngle, to: lookAngle, timeElapsed: 0 };
const lerpDuration = 0.1;

const MovementAction = (
	deltaTime: DOMHighResTimeStamp,
	node: PhysicsNode<ToadState>
): void => {
	let state = node.state as ToadState;

	if (GetMode() != "GAME") return;

	let worldPosition = utils.ComputePosition(state.worldMatrix, [0, 0, 0]);
	let localPosition = utils.ComputePosition(state.localMatrix, [0, 0, 0]);

	let camera = GetActiveCamera();

	let alpha = Math.atan2(camera.normDir[0], camera.normDir[2]);

	let targetDir = [
		-Math.sin(alpha) * Input.moveDir[2] +
			Math.cos(alpha) * Input.moveDir[0],
		0,
		-Math.cos(alpha) * Input.moveDir[2] +
			-Math.sin(alpha) * Input.moveDir[0],
	];
	targetDir = utils.normalize(targetDir);

	let blockCollisions = node.Intersects(
		Engine.GetAllNodesWithBoxBounds().filter((n) =>
			n.name.startsWith("block-")
		)
	);
	for (let otherNode of blockCollisions) {
		let toadPos = node.GetWorldCoordinates();
		let otherPos = otherNode.GetWorldCoordinates();
		let collisionTrueDirection = utils.subtractVectors(otherPos, toadPos);

		let toadMapPosition = Map.ToMapCoords(toadPos);
		let otherMapPosition = Map.ToMapCoords(otherPos);

		// This is definitely not the fastest nor best way to do this...
		while (utils.ManhattanDistance(toadMapPosition, otherMapPosition) > 1) {
			toadPos = utils.addVectors(
				toadPos,
				utils.multiplyVectorScalar(collisionTrueDirection, 0.1)
			);
			toadMapPosition = Map.ToMapCoords(toadPos);
		}
		if (utils.ManhattanDistance(toadMapPosition, otherMapPosition) == 0) {
			// If we went down to zero, we were exactly diagonal. Revert back.
			toadPos = node.GetWorldCoordinates();
			toadMapPosition = Map.ToMapCoords(toadPos);
		}

		let collisionNormal = utils.normalize(
			utils.subtractVectors(otherMapPosition, toadMapPosition)
		);
		let velocityToScrub = utils.dot(targetDir, collisionNormal);
		if (velocityToScrub > 0) {
			targetDir = utils.subtractVectors(
				targetDir,
				utils.multiplyVectorScalar(collisionNormal, velocityToScrub)
			);
		}
	}

	let translation = utils.multiplyVectorScalar(
		targetDir,
		deltaTime * state.moveSpeed
	);

	if (translation[0] != 0 || translation[2] != 0) {
		let newAngle = -Math.atan2(targetDir[0], targetDir[2]);
		if (newAngle != lerping.to) {
			lerping.from = lookAngle;
			lerping.to = newAngle;
			lerping.timeElapsed = 0;
		}
		if (lerping.timeElapsed < lerpDuration) {
			lookAngle = utils.LerpAngle(
				lerping.from,
				lerping.to,
				lerping.timeElapsed / lerpDuration
			);
		} else {
			lookAngle = newAngle;
		}
	} else {
		lerping.from = lookAngle;
		lerping.timeElapsed = 0;
	}
	lerping.timeElapsed += deltaTime;

	state.localMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(
			localPosition[0] + translation[0],
			localPosition[1] + translation[1],
			localPosition[2] + translation[2]
		),
		utils.MakeRotateYMatrix(utils.radToDeg(lookAngle))
	);

	// Camera follow toad
	camera.translation = worldPosition;
	camera.Update();
};
