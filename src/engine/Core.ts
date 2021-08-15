import { utils } from "../utils/utils";
import { Node, State } from "./SceneGraph";
import { Light } from "./Lights";
import * as DebugLine from "../debug/Lines";

export const ROOT_NODE: Node<State> = new Node();
let gl: WebGL2RenderingContext;
let projectionMatrix = utils.identityMatrix();
let cameraMatrix = utils.identityMatrix();

let renderQueue: (() => void)[] = [];

const N_LIGHTS = 16;
const lights = new Array<Light>(N_LIGHTS);
let lightIdx = 0;

// Entrypoint of the WebGL program
export function Setup(_gl: WebGL2RenderingContext) {
	gl = _gl;

	// ONCE
	gl.clearColor(0.85, 0.85, 0.85, 1.0);
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
	renderQueue = [];
	lights.fill(new Light());
	lightIdx = 0;
	ROOT_NODE.Update(deltaTime, viewProjectionMatrix);
	for (let renderAction of renderQueue) {
		renderAction();
	}

	DebugLine.Render(gl, viewProjectionMatrix);

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

export function GetTime() {
	return lastUpdate;
}

export function QueueRender(renderAction: () => void) {
	renderQueue.push(renderAction);
}

export function BindAllLightUniforms(
	gl: WebGL2RenderingContext,
	program: WebGLProgram
) {
	gl.uniform3fv(
		gl.getUniformLocation(program, "LType"),
		lights.map((l) => l.EncodeTypeOneHot()).flat(1)
	);
	gl.uniform3fv(
		gl.getUniformLocation(program, "LPos"),
		lights.map((l) => l.pos).flat(1)
	);
	gl.uniform3fv(
		gl.getUniformLocation(program, "LDir"),
		lights.map((l) => l.dir.map((d) => -d)).flat(1)
	);
	gl.uniform1fv(
		gl.getUniformLocation(program, "LConeOut"),
		lights.map((l) => l.coneOut)
	);
	gl.uniform1fv(
		gl.getUniformLocation(program, "LConeIn"),
		lights.map((l) => l.coneIn)
	);
	gl.uniform1fv(
		gl.getUniformLocation(program, "LDecay"),
		lights.map((l) => l.decay)
	);
	gl.uniform1fv(
		gl.getUniformLocation(program, "LTarget"),
		lights.map((l) => l.target)
	);
	gl.uniform4fv(
		gl.getUniformLocation(program, "LColor"),
		lights.map((l) => l.lightColor).flat(1)
	);
}

export function AddLight(light: Light) {
	if (lightIdx > 2) throw "Cannot add any more lights";
	lights[lightIdx] = light;
	lightIdx++;
}
