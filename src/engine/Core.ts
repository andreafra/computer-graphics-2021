import { utils } from "../utils/utils";
import { Node, State } from "./SceneGraph";

export const ROOT_NODE: Node<State> = new Node();
let gl: WebGL2RenderingContext;
let projectionMatrix = utils.identityMatrix();
let cameraMatrix = utils.identityMatrix();

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
	ROOT_NODE.UpdateAndRender(deltaTime, viewProjectionMatrix);

	// Render next frame
	requestAnimationFrame(Render);
}

export function SetProjection(m: number[]) {
	projectionMatrix = m;
}

export function SetCamera(m: number[]) {
	cameraMatrix = m;
}

export function Start() {
	requestAnimationFrame(Render);
}

export function GetCamera(): number[] {
	return cameraMatrix;
}

export function GetTime() {
	return lastUpdate;
}
