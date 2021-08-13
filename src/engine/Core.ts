import { utils } from "../utils/utils";
import { Node, State } from "./SceneGraph";
import { Light } from "./Lights";

export const ROOT_NODE: Node<State> = new Node();
let gl: WebGL2RenderingContext;
let projectionMatrix = utils.identityMatrix();
let cameraMatrix = utils.identityMatrix();

let renderQueue: (() => void)[] = [];

const lights = [new Light(), new Light(), new Light()];
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
	for(let i = 0; i < lights.length; i++)
		lights[i] = new Light();
	lightIdx = 0;
	ROOT_NODE.Update(deltaTime, viewProjectionMatrix);
	for (let renderAction of renderQueue) {
		renderAction();
	}

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

export function BindAllLightUniforms(gl: WebGL2RenderingContext, program: WebGLProgram) {
	for (let i = 0; i < 3; i++) {
		lights[i].BindUniforms(gl, program, i);
	}
}

export function AddLight(light: Light) {
	if (lightIdx > 2)
		throw "Cannot add any more lights"
	lights[lightIdx] = light;
	lightIdx++;
}