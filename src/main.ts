import "./style.css";
import { utils } from "./utils/utils";
import * as Engine from "./engine/Core";
import * as toad from "./models/Toad";
import * as block from "./models/Block";
import * as Map from "./engine/Map";
import * as Grid from "./models/Grid";
import { Light } from "./engine/Lights";
import { LightNode } from "./engine/SceneGraph";
import * as Camera from "./engine/Camera";
import * as DebugLine from "./debug/Lines";

async function init() {
	const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
	const gl = canvas.getContext("webgl2");
	if (!gl) {
		console.error("GL context not opened");
		return;
	}
	// Callback allows us to update the projection matrix
	utils.resizeCanvasToDisplaySize(canvas, () =>
		Engine.SetProjection(
			utils.MakePerspective(
				60.0,
				canvas.width / canvas.height,
				1.0,
				2000.0
			)
		)
	);

	Engine.Setup(gl);
	Camera.Update();

	DebugLine.Setup(gl);

	// Setup Scenegraph nodes
	Map.Init(gl);
	Map.DrawGrid();

	// Add some light
	let sunlightColor = [0.9, 1.0, 1.0, 1.0];
	let sunlightNode = new LightNode(
		"sunlight",
		Light.MakeDirectional(sunlightColor),
		utils.MakeRotateXYZMatrix(30, 30, 120)
	);
	sunlightNode.SetParent(Engine.ROOT_NODE);

	// Draw axis in origin
	DebugLine.DrawLine([0, 0, 0], [5, 0, 0], 1);
	DebugLine.DrawLine([0, 0, 0], [0, 5, 0], 2);
	DebugLine.DrawLine([0, 0, 0], [0, 0, 5], 3);

	Engine.Start();

	// Engine.EnableRaycast(
	// 	canvas,
	// 	{
	// 		width: canvas.width,
	// 		height: canvas.height,
	// 	},
	// 	cameraWorldCoord
	// );
}

window.onload = () => init();
