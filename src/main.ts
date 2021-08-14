import "./style.css";
import { utils } from "./utils/utils";
import * as Engine from "./engine/Core";
import * as planets from "./PlanetsSceneGraph";
import * as toad from "./Toad";

async function init() {
	const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
	const gl = canvas.getContext("webgl2");
	if (!gl) {
		console.error("GL context not opened");
		return;
	}
	utils.resizeCanvasToDisplaySize(canvas);

	Engine.Setup(gl);
	Engine.SetProjection(
		utils.MakePerspective(60.0, canvas.width / canvas.height, 1.0, 2000.0)
	);
	Engine.SetCamera(
		utils.LookAt(
			[0.0, -200.0, 0.0], // Position
			[0.0, 0.0, 0.0], // Target
			[0.0, 0.0, 1.0] // Up
		)
	);

	// Setup Scenegraph nodes
	planets.init(gl);

	toad.init(gl);

	Engine.Start();
}

window.onload = () => init();
