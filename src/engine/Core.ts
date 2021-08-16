import { utils } from "../utils/utils";
import { Light } from "./Lights";
//import { DoRaycast } from "./Raycast";
import { Node, RenderNode, State } from "./SceneGraph";
import * as DebugLine from "./debug/Lines";
import { WebGLProgramInfo } from "./Shaders";

export const ROOT_NODE: Node<State> = new Node("root");
export let gl: WebGL2RenderingContext;
export let projectionMatrix = utils.identityMatrix();
export let cameraMatrix = utils.identityMatrix();

const N_LIGHTS = 16;
const lights = new Array<Light>(N_LIGHTS);
let lightIdx = 0;

let renderQueue: (() => void)[] = [];

// Entrypoint of the WebGL program
export function Setup(_gl: WebGL2RenderingContext) {
	gl = _gl;

	// ONCE
	gl.clearColor(1, 1, 1, 1);
	gl.enable(gl.DEPTH_TEST);
}

let lastUpdate: DOMHighResTimeStamp = 0;
function Render(time: DOMHighResTimeStamp) {
	// Calc delta time
	time *= 0.001; // convert to seconds
	const deltaTime = time - lastUpdate; // in seconds
	lastUpdate = time;

	// Refresh canvas
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const viewProjectionMatrix = utils.multiplyMatrices(
		projectionMatrix,
		utils.invertMatrix(cameraMatrix)
	);

	// Navigate the SceneGraph tree to update all elements // O(n)
	lights.fill(new Light());
	lightIdx = 0;
	renderQueue = [];
	ROOT_NODE.Update(deltaTime, viewProjectionMatrix);
	for (let renderFunction of renderQueue) {
		renderFunction();
	}

	DebugLine.Render(viewProjectionMatrix);

	// Render next frame
	requestAnimationFrame(Render);
}

function PrintSceneGraph() {
	console.log(ROOT_NODE);
}

export function SetProjection(m: number[]) {
	projectionMatrix = m;
}

export function SetCamera(m: number[]) {
	cameraMatrix = m;
}

export function Start() {
	PrintSceneGraph();
	requestAnimationFrame(Render);
}

export function GetCamera(): number[] {
	return cameraMatrix;
}

export function GetCameraPosition(): number[] {
	// Eye of the camera is at local origin
	return utils.ComputePosition(cameraMatrix, [0, 0, 0]);
}

export function GetTime() {
	return lastUpdate;
}

export function QueueRender(renderAction: () => void) {
	renderQueue.push(renderAction);
}

export function BindAllLightUniforms(programInfo: WebGLProgramInfo) {
	gl.uniform3fv(
		programInfo.locations.lightType,
		lights.map((l) => l.EncodeTypeOneHot()).flat(1)
	);
	gl.uniform3fv(
		programInfo.locations.lightPos,
		lights.map((l) => l.pos).flat(1)
	);
	gl.uniform3fv(
		programInfo.locations.lightDir,
		lights.map((l) => l.dir.map((d) => -d)).flat(1)
	);
	gl.uniform1fv(
		programInfo.locations.lightConeOut,
		lights.map((l) => l.coneOut)
	);
	gl.uniform1fv(
		programInfo.locations.lightConeIn,
		lights.map((l) => l.coneIn)
	);
	gl.uniform1fv(
		programInfo.locations.lightDecay,
		lights.map((l) => l.decay)
	);
	gl.uniform1fv(
		programInfo.locations.lightTarget,
		lights.map((l) => l.target)
	);
	gl.uniform4fv(
		programInfo.locations.lightColor,
		lights.map((l) => l.lightColor).flat(1)
	);
}

export function AddLight(light: Light) {
	if (lightIdx > 2) throw "Cannot add any more lights";
	lights[lightIdx] = light;
	lightIdx++;
}

export function GetSceneRenderNodes() {
	let nodes: RenderNode<State>[] = [];
	type X = Node<State>;

	function GetRenderNodes(_nodes: X[]) {
		_nodes.forEach((node) => {
			if (node instanceof RenderNode) nodes.push(node);
			GetRenderNodes(node.children);
		});
	}

	GetRenderNodes(ROOT_NODE.children);

	return nodes;
}

// export function EnableRaycast(
// 	canvas: HTMLCanvasElement,
// 	viewport: { width: number; height: number },
// 	cameraOrigin: number[]
// ) {
// 	canvas.addEventListener("mousedown", (ev: MouseEvent) => {
// 		DoRaycast(
// 			{ x: ev.x, y: ev.y },
// 			viewport,
// 			projectionMatrix,
// 			cameraMatrix,
// 			cameraOrigin
// 		);
// 	});
// }
