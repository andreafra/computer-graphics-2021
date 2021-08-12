import "./style.css";
import { utils } from "./utils/utils";
import { main } from "./engine/Core";
import * as planetSG from "./PlanetsSceneGraph";

function init() {
	const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
	const gl = canvas.getContext("webgl2");
	if (!gl) {
		console.error("GL context not opened");
		return;
	}
	utils.resizeCanvasToDisplaySize(canvas);

	main(gl);

	// Setup Scenegraph nodes
	planetSG.init(gl);
}

window.onload = () => init();
