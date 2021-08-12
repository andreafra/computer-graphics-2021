import { utils } from "../utils/utils";
import { Node, State } from "./SceneGraph";

export const ROOT_NODE: Node<State> = new Node();

// Entrypoint of the WebGL program
export function main(gl: WebGL2RenderingContext) {
	// ONCE
	gl.clearColor(0.85, 0.85, 0.85, 1.0);
	gl.enable(gl.DEPTH_TEST);


	// Render Loop
	let lastUpdate = 0;
	function Render(time: DOMHighResTimeStamp) {
		// Calc delta time
		time *= 0.001; // convert to seconds
		const deltaTime = time - lastUpdate; // in seconds
		lastUpdate = time;

		// Refresh canvas
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Compute the projection matrix
		const aspect = gl.canvas.width / gl.canvas.height;
		// Kinda constant
		const projectionMatrix = utils.MakePerspective(
			60.0,
			aspect,
			1.0,
			2000.0
		);

		// Compute the camera matrix using look at.
		const cameraPosition = [0.0, -200.0, 0.0];
		const target = [0.0, 0.0, 0.0];
		const up = [0.0, 0.0, 1.0];
		const cameraMatrix = utils.LookAt(cameraPosition, target, up);
		const viewMatrix = utils.invertMatrix(cameraMatrix);

		const viewProjectionMatrix = utils.multiplyMatrices(
			projectionMatrix,
			viewMatrix
		);

		// Navigate the SceneGraph tree to update all elements // O(n)
		ROOT_NODE.UpdateAndRender(deltaTime, viewProjectionMatrix);

		// Render next frame
		requestAnimationFrame(Render);
	}

	// Render the first frame
	requestAnimationFrame(Render);
}
