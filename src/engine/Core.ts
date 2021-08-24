import { utils } from "../utils/utils";
import { Light } from "./Lights";
//import { DoRaycast } from "./Raycast";
import { IRenderableState, Node, RenderNode, State } from "./SceneGraph";
import * as DebugLine from "./debug/Lines";
import { WebGLProgramInfo, MAX_LIGHTS, MAX_SHADOWS } from "./Shaders";
import { IBoxBounds, PhysicsNode, PhysicsState } from "./Physics";
import { Shadow } from "./Shadows";

export const ROOT_NODE: Node<State> = new Node("root");
export let gl: WebGL2RenderingContext;
export let projectionMatrix = utils.identityMatrix();
export let cameraMatrix = utils.identityMatrix();

const lights = new Array<Light>();
const shadows = new Array<Shadow>();
let ambientLight = [0, 0, 0];

let renderQueue: ((VPMatrix: number[]) => void)[] = [];

// Entrypoint of the WebGL program
export function Setup(_gl: WebGL2RenderingContext) {
	gl = _gl;

	// ONCE
	gl.clearColor(1, 1, 1, 1);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
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

	// Navigate the SceneGraph tree to update all elements // O(n)
	lights.length = 0;
	shadows.length = 0;
	renderQueue = [];
	ROOT_NODE.Update(deltaTime);

	const viewProjectionMatrix = utils.multiplyMatrices(
		projectionMatrix,
		utils.invertMatrix(cameraMatrix)
	);

	for (let renderFunction of renderQueue) {
		renderFunction(viewProjectionMatrix);
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

export function SetAmbientLight(color: number[]) {
	ambientLight = color;
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

export function QueueRender(renderFunction: (VPMatrix: number[]) => void) {
	renderQueue.push(renderFunction);
}

export function BindAllLightUniforms(programInfo: WebGLProgramInfo) {
	gl.uniform1i(programInfo.locations.lightsCount, lights.length);
	if (lights.length == 0) return; // Uniforms can be left uninitialized (will default to 0)

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
		lights.map((l) => l.color).flat(1)
	);

	gl.uniform3fv(programInfo.locations.ambientLight, ambientLight);
}

export function AddLight(light: Light) {
	if (lights.length >= MAX_LIGHTS) throw "Cannot add any more lights";
	lights.push(light);
}

export function AddShadow(shadow: Shadow) {
	if (shadows.length >= MAX_SHADOWS) throw "Cannot add any more shadows";
	shadows.push(shadow);
}

export function BindAllShadowUniforms(programInfo: WebGLProgramInfo) {
	gl.uniform1i(programInfo.locations.shadowsCount, shadows.length);
	if (shadows.length == 0) return; // Uniforms can be left uninitialized (will default to 0)

	gl.uniform3fv(
		programInfo.locations.shadowPos,
		shadows.map((s) => s.pos).flat(1)
	);
	gl.uniform3fv(
		programInfo.locations.shadowDir,
		shadows.map((s) => s.dir.map((d) => -d)).flat(1)
	);
	gl.uniform1fv(
		programInfo.locations.shadowConeOut,
		shadows.map((s) => s.coneOut)
	);
	gl.uniform1fv(
		programInfo.locations.shadowConeIn,
		shadows.map((s) => s.coneIn)
	);
	gl.uniform1fv(
		programInfo.locations.shadowDecay,
		shadows.map((s) => s.decay)
	);
	gl.uniform1fv(
		programInfo.locations.shadowTarget,
		shadows.map((s) => s.target)
	);
	gl.uniform4fv(
		programInfo.locations.shadowColor,
		shadows.map((s) => s.color).flat(1)
	);
}

export function GetAllNodesWithBoxBounds() {
	let nodes: Node<IBoxBounds>[] = [];
	type X = Node<State>;

	function GetRenderNodes(_nodes: X[]) {
		_nodes.forEach((node) => {
			if ((<IBoxBounds>node.state).bounds)
				nodes.push(node as Node<IBoxBounds>);
			GetRenderNodes(node.children);
		});
	}

	GetRenderNodes(ROOT_NODE.children);

	return nodes;
}

export function GetAllPhysicsNodes() {
	let nodes: PhysicsNode<PhysicsState>[] = [];
	type X = Node<State>;

	function GetRenderNodes(_nodes: X[]) {
		_nodes.forEach((node) => {
			if (node instanceof PhysicsNode)
				nodes.push(node as PhysicsNode<PhysicsState>);
			GetRenderNodes(node.children);
		});
	}

	GetRenderNodes(ROOT_NODE.children);

	return nodes;
}
