import * as Engine from "../engine/Core";
import { MakeTexture, MakeVAO, TextureType } from "../engine/Models";
import {
	IRenderableState,
	RenderNode,
	ShadowNode,
	State,
	LightNode,
	FindNode,
} from "../engine/SceneGraph";
import { getShader, Features, WebGLProgramInfo } from "../engine/Shaders";
import { gl } from "../engine/Core";
import { utils } from "../utils/utils";
import { Light } from "../engine/Lights";
import * as Input from "../Input";
import { GetMode, moonsToWin, ToggleMode } from "../main";
import * as Map from "../Map";
import * as UI from "../UI";

// Assets
import toad_OBJ from "../assets/cpt_toad/toad.obj";
import bodyTextureSrc from "../assets/cpt_toad/Textures/baked_txt.png";
import emissiveMapSrc from "../assets/cpt_toad/Textures/baked_emm.png";
import normalMapSrc from "../assets/cpt_toad/Textures/baked_nrm.png";
import specularMapSrc from "../assets/cpt_toad/Textures/baked_spc.png";
import ambientOcclusionSrc from "../assets/cpt_toad/Textures/baked_ao.png";
import { GetActiveCamera } from "../main";
import {
	BOX_DEFAULT_BOUNDS,
	PhysicsNode,
	PhysicsState,
} from "../engine/Physics";
import { Shadow } from "../engine/Shadows";

// Define common structure for state of these nodes
interface ToadState extends PhysicsState {
	lookAngle: number;
	lerpingFrom: number;
	lerpingTo: number;
	lerpingTimeElapsed: number;
	lerpDuration: number;

	moveSpeed: number;
	yVelocity: number;
	gravity: number;
	jumpVelocity: number;
	jumpTrigger: number;

	coinCount: number;
	moonCount: number;

	invulnerable: boolean;
	invulnerabilityTime: number;
	invulnerabilityTimeElapsed: number;
	lives: number;
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

export function Spawn(localMatrix: number[]) {
	// SETUP NODES
	var toadNode = new PhysicsNode<ToadState>("cpt-toad", localMatrix);
	toadNode.state = {
		// Box bounds
		bounds: BOX_DEFAULT_BOUNDS,
		radius: 0.5,
		height: 0.95, // sneak under a block
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

	toadNode.state.lookAngle = 0;
	toadNode.state.lerpingFrom = toadNode.state.lookAngle;
	toadNode.state.lerpingTo = toadNode.state.lookAngle;
	toadNode.state.lerpingTimeElapsed = 0;
	toadNode.state.lerpDuration = 0.1;

	toadNode.state.moveSpeed = 2.0;
	toadNode.state.yVelocity = 0;
	toadNode.state.gravity = 12;
	toadNode.state.jumpVelocity = 5.5;
	toadNode.state.jumpTrigger = 0.1;

	toadNode.state.coinCount = 0;
	toadNode.state.moonCount = 0;

	toadNode.state.lives = 3;
	toadNode.state.invulnerable = false;
	toadNode.state.invulnerabilityTime = 1.0; // seconds
	toadNode.state.invulnerabilityTimeElapsed = 0;

	UI.HandleLivesChanged(toadNode.state.lives);
	UI.HandleCoinsChanged(toadNode.state.coinCount);
	UI.HandleMoonsChanged(toadNode.state.moonCount);

	var headLight = new LightNode<State>(
		"cpt-toad-headlight",
		Light.MakeSpot(
			[1.0, 0.9, 0.0], // color
			90, // coneOut, deg°
			0.5, // coneIn, %
			0.7, // targetDistance
			1 // decay
		),
		utils.multiplyMatrices(
			utils.MakeTranslateMatrix(0, 0.93, 0.5),
			utils.MakeRotateYMatrix(90)
		)
	);

	var shadowBelow = new ShadowNode(
		"cpt-toad-shadow",
		Shadow.Make(
			[1, 1, 1], // color
			40, // coneOut, deg°
			0.5, // coneIn, %
			1.3, // targetDistance
			1 // decay)
		),
		utils.MakeTranslateMatrix(0, 1, 0)
	);

	toadNode.AddAction(JumpAction);
	toadNode.AddAction(MovementAction);
	toadNode.AddAction(DestroyBrick); // Run after MovementAction otherwise we miss a roof-hit
	toadNode.AddAction(CollectCoin);
	toadNode.AddAction(CollectMoon);
	toadNode.AddAction(HitEnemy);
	toadNode.AddAction(DieFromFall);
	toadNode.AddAction(CheckIfGameOver);

	// Set relationships between nodes
	headLight.SetParent(toadNode);
	shadowBelow.SetParent(toadNode);
	toadNode.SetParent(Engine.ROOT_NODE);

	return toadNode;
}

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
	if (state.yVelocity > 0) targetDir[1] = state.yVelocity;

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
			if (toadMapPosition[1] < otherMapPosition[1]) {
				// Let me jump man...
				toadMapPosition[1] = otherMapPosition[1];
			} else {
				toadPos = utils.addVectors(
					toadPos,
					utils.multiplyVectorScalar(collisionTrueDirection, 0.1)
				);
				toadMapPosition = Map.ToMapCoords(toadPos);
			}
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
	if (state.yVelocity > 0) {
		state.yVelocity = targetDir[1];
		targetDir[1] = 0;
	}

	let translation = utils.multiplyVectorScalar(
		targetDir,
		deltaTime * state.moveSpeed
	);

	if (
		Math.abs(translation[0]) > 0.00001 ||
		Math.abs(translation[2]) > 0.00001
	) {
		let newAngle = -Math.atan2(targetDir[0], targetDir[2]);
		if (newAngle != state.lerpingTo) {
			state.lerpingFrom = state.lookAngle;
			state.lerpingTo = newAngle;
			state.lerpingTimeElapsed = deltaTime;
		}
		if (state.lerpingTimeElapsed < state.lerpDuration) {
			state.lookAngle = utils.LerpAngle(
				state.lerpingFrom,
				state.lerpingTo,
				state.lerpingTimeElapsed / state.lerpDuration
			);
		} else {
			state.lookAngle = newAngle;
		}
	} else {
		state.lerpingFrom = state.lookAngle;
		state.lerpingTimeElapsed = 0;
	}
	state.lerpingTimeElapsed += deltaTime;

	// Handle gravity differently
	// Don't ever let toad collide with the ground or bad things happen above
	state.yVelocity -= state.gravity * deltaTime;
	if (
		state.yVelocity < 0 &&
		Map.IsGrounded(
			utils.addVectors(worldPosition, [
				0,
				Math.max(-0.99, state.yVelocity * deltaTime),
				0,
			]),
			state.radius / 2
		)
	) {
		state.yVelocity = 0;
		localPosition[1] = Math.floor(localPosition[1]) + 0.001;
		translation[1] = 0;
	} else {
		translation[1] = state.yVelocity * deltaTime;
	}

	state.localMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(
			localPosition[0] + translation[0],
			localPosition[1] + translation[1],
			localPosition[2] + translation[2]
		),
		utils.MakeRotateYMatrix(utils.radToDeg(state.lookAngle))
	);

	// Camera follow toad
	camera.translation = worldPosition;
	camera.Update();
};

const JumpAction = (
	deltaTime: DOMHighResTimeStamp,
	node: PhysicsNode<ToadState>
): void => {
	if (GetMode() != "GAME") return;

	if (Input.moveDir[1] == 1) {
		Input.moveDir[1] = 0;
		let pos = node.GetWorldCoordinates();
		if (
			Map.IsGrounded(
				utils.addVectors(pos, [0, -node.state.jumpTrigger, 0]),
				node.state.radius / 2
			)
		) {
			node.state.yVelocity = node.state.jumpVelocity;
		}
	}
};

const DestroyBrick = (
	deltaTime: DOMHighResTimeStamp,
	node: PhysicsNode<ToadState>
): void => {
	if (GetMode() != "GAME") return;

	let bricks = node.Intersects(
		Engine.GetAllNodesWithBoxBounds().filter((n) => n.name == "block-brick")
	);

	for (let b of bricks) {
		let toadCellPos = Map.ToMapCoords(node.GetWorldCoordinates());
		let brickCellPos = Map.ToMapCoords(b.GetWorldCoordinates());
		if (
			toadCellPos[0] == brickCellPos[0] &&
			toadCellPos[1] == brickCellPos[1] - 1 &&
			toadCellPos[2] == brickCellPos[2]
		) {
			Map.RemoveNode(b);
			return; // only remove one if for whatever reason we matched more
		}
	}
};

const CollectCoin = (
	deltaTime: DOMHighResTimeStamp,
	node: PhysicsNode<ToadState>
): void => {
	if (GetMode() != "GAME") return;

	let state = node.state;

	let coins = node.Intersects(
		Engine.GetAllNodesWithBoxBounds().filter((n) => n.name == "coin")
	);

	for (let c of coins) {
		Map.RemoveNode(c);
		state.coinCount++;

		if (state.coinCount >= 10) {
			state.coinCount -= 10;
			state.lives++;
			UI.HandleLivesChanged(state.lives);
		}

		UI.HandleCoinsChanged(state.coinCount);
	}
};

const CollectMoon = (
	deltaTime: DOMHighResTimeStamp,
	node: PhysicsNode<ToadState>
): void => {
	if (GetMode() != "GAME") return;

	let moons = node.Intersects(
		Engine.GetAllNodesWithBoxBounds().filter((n) => n.name == "moon")
	);

	for (let c of moons) {
		Map.RemoveNode(c);
		node.state.moonCount++;

		UI.HandleMoonsChanged(node.state.moonCount);
	}
	if (node.state.moonCount >= moonsToWin) {
		alert("You won!");
		ToggleMode();
	}
};

const FALL_KILL_HEIGHT = -5;

const DieFromFall = (
	deltaTime: DOMHighResTimeStamp,
	node: PhysicsNode<ToadState>
): void => {
	if (node.GetWorldCoordinates()[1] <= FALL_KILL_HEIGHT) {
		node.state.yVelocity = 0;
		let spawnPoint = FindNode((n) => n.name === "flag-start")[0];
		let spawnPointCoords = spawnPoint.GetWorldCoordinates();

		node.state.localMatrix = utils.MakeTranslateMatrix(
			spawnPointCoords[0],
			spawnPointCoords[1],
			spawnPointCoords[2]
		);
		node.state.lives--;
		UI.HandleLivesChanged(node.state.lives);
	}
};
const HitEnemy = (
	deltaTime: DOMHighResTimeStamp,
	node: PhysicsNode<ToadState>
): void => {
	if (GetMode() != "GAME") return;

	let state = node.state;

	// Tick time...
	if (state.invulnerable) {
		// Blink toad to show invulnerability
		if (Math.sin(20 * state.invulnerabilityTimeElapsed) > 0) {
			state.shouldRender = false;
		} else {
			state.shouldRender = true;
		}

		state.invulnerabilityTimeElapsed += deltaTime;
	}
	if (state.invulnerabilityTimeElapsed >= state.invulnerabilityTime) {
		state.invulnerable = false;
		state.invulnerabilityTimeElapsed = 0;
		state.shouldRender = true;
	}

	let enemies = node.Intersects(
		Engine.GetAllNodesWithBoxBounds().filter((n) => n.name == "enemy")
	);

	if (enemies.length > 0 && !state.invulnerable) {
		state.lives--;
		state.invulnerable = true;

		UI.HandleLivesChanged(state.lives);
	}
};

const CheckIfGameOver = (
	deltaTime: DOMHighResTimeStamp,
	node: PhysicsNode<ToadState>
): void => {
	if (node.state.lives < 0) {
		ToggleMode();
		alert("Game Over!");
	}
};
