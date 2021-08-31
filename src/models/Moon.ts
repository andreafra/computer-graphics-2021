import { MakeTexture, MakeVAO, TextureType } from "../engine/Models";
import {
	RenderNode,
	Node,
	State,
	IRenderableState,
	LightNode,
} from "../engine/SceneGraph";
import { utils } from "../utils/utils";
import { getShader, Features, WebGLProgramInfo } from "../engine/Shaders";
import * as Engine from "../engine/Core";
import { Light } from "../engine/Lights";

// Assets
import moon_OBJ from "../assets/moon/moon.obj";
import baseTextureSrc from "../assets/moon/Textures/shinebody_alb.png";
import normalMapSrc from "../assets/moon/Textures/shinebody_nrm.png";
import emissMapSrc from "../assets/moon/Textures/shinebody_emm.png";
import { gl } from "../engine/Core";
import { BOX_DEFAULT_BOUNDS, IBoxBounds } from "../engine/Physics";

// Define common structure for state of these nodes
interface MoonState extends IRenderableState, IBoxBounds {
	spawnCoord: number[];
	spawnTime: DOMHighResTimeStamp;

	hoverDistance: number;
	hoverSpeed: number;
	spinSpeed: number;
}

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

function HoverAction(
	deltaTime: DOMHighResTimeStamp,
	node: RenderNode<MoonState>
) {
	let state = node.state;
	let yPos = utils.ComputePosition(state.localMatrix, [0, 0, 0])[1];
	let hoverAround = state.spawnCoord[1];
	let timeOffset = Engine.GetTime() - state.spawnTime;
	state.localMatrix = utils.multiplyMatrices(
		state.localMatrix,
		utils.MakeTranslateMatrix(
			0,
			state.hoverDistance * Math.sin(state.hoverSpeed * timeOffset) +
				hoverAround -
				yPos,
			0
		)
	);
}

function SpinAction(
	deltaTime: DOMHighResTimeStamp,
	node: RenderNode<MoonState>
) {
	let state = node.state;
	state.localMatrix = utils.multiplyMatrices(
		state.localMatrix,
		utils.MakeRotateYMatrix(state.spinSpeed * deltaTime)
	);
}

export function Spawn(spawnCoord: number[], mapRoot: Node<State>) {
	// SETUP NODES
	let scale = 1;
	let boundsScale = 1 / 3;

	let bounds = BOX_DEFAULT_BOUNDS.map((pos) =>
		pos.map((x) => x * scale * boundsScale)
	);
	bounds[1][1] += scale * boundsScale;

	let tMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(spawnCoord[0], spawnCoord[1], spawnCoord[2]),
		utils.MakeScaleMatrix(scale)
	);
	var moonNode = new RenderNode<MoonState>("moon", tMatrix);
	moonNode.state = {
		bounds: bounds,
		// render
		materialColor: [1.0, 1.0, 1.0],
		materialAmbColor: [0, 0, 0],
		materialSpecColor: [0.3, 0.3, 0.3],
		materialEmitColor: [0, 0, 0], // Use emissive map instead
		programInfo: programInfo,
		bufferLength: moon_OBJ.indices.length,
		vertexArrayObject: vao,
		texture: baseTexture,
		normalMap: normalMap,
		emissiveMap: emissiveMap,
		...moonNode.state,
	};
	moonNode.state.spawnCoord = spawnCoord;
	moonNode.state.spawnTime = Engine.GetTime();
	moonNode.state.hoverDistance = 0.06; // 6% of a block
	moonNode.state.hoverSpeed = 1.5;
	moonNode.state.spinSpeed = 45; // degrees per second

	moonNode.AddAction(HoverAction);
	moonNode.AddAction(SpinAction);

	let moonLight = new LightNode<State>(
		"moon-light",
		Light.MakePoint(
			[0.29, 1.0, 0.57], // color
			0.4, // target distance
			2 // decay
		),
		utils.MakeTranslateMatrix(0, 0.6, 0)
	);
	moonLight.SetParent(moonNode);

	// Set relationships between nodes
	moonNode.SetParent(mapRoot);

	return moonNode;
}
