import "./style.css";
import { utils } from "./utils/utils";
import * as Engine from "./engine/Core";
import * as toad from "./models/Toad";
import * as block from "./models/Block";
import * as Map from "./engine/Map";
import * as Grid from "./models/Grid";
import { Light } from "./engine/Lights";
import { LightNode } from "./engine/SceneGraph";
import * as DebugLine from "./debug/Lines";

async function init() {
	const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
	const gl = canvas.getContext("webgl2");
	if (!gl) {
		console.error("GL context not opened");
		return;
	}
	utils.resizeCanvasToDisplaySize(canvas);

	let cameraDistance = 5;

	Engine.Setup(gl);
	Engine.SetProjection(
		utils.MakePerspective(60.0, canvas.width / canvas.height, 1.0, 2000.0)
	);
	Engine.SetCamera(
		utils.LookAt(
			[cameraDistance, cameraDistance, cameraDistance], // Position
			[0.0, 0.0, 0.0], // Target
			[0.0, 1.0, 0.0] // Up
		)
	);

	DebugLine.Setup(gl);

	// Setup Scenegraph nodes
	Grid.init(gl);
	Map.initMap(gl);

	// Add some light
	let sunlightColor = [0.9, 1.0, 1.0, 1.0];
	let sunlightNode = new LightNode(
		"sunlight",
		Light.MakeDirectional(sunlightColor),
		utils.multiplyMatrices(
			utils.MakeRotateZMatrix(60),
			utils.MakeRotateYMatrix(-30)));
	sunlightNode.SetParent(Engine.ROOT_NODE);

	// Draw axis in origin
	DebugLine.DrawLine(gl, [0, 0, 0], [5, 0, 0], 1);
	DebugLine.DrawLine(gl, [0, 0, 0], [0, 5, 0], 2);
	DebugLine.DrawLine(gl, [0, 0, 0], [0, 0, 5], 3);

	Engine.Start();
}

window.onload = () => init();
