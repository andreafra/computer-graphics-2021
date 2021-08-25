import "./style.css";
import { utils } from "./utils/utils";
import * as Engine from "./engine/Core";
import * as Toad from "./models/Toad";
import { Light } from "./engine/Lights";
import {
	LightNode,
	ShadowNode,
	Node,
	State,
	FindNode,
} from "./engine/SceneGraph";
import * as Lines from "./engine/Lines";
import * as UI from "./UI";
import * as Skybox from "./Skybox";
import { Camera } from "./Camera";
import * as Input from "./Input";
import * as Map from "./Map";

type Mode = "EDITOR" | "GAME";

let mode: Mode = "EDITOR";

export let moonsToWin = 1;

let editorCamera: Camera, gameCamera: Camera;

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
				20.0,
				canvas.width / canvas.height,
				1.0,
				2000.0
			)
		)
	);

	Engine.Setup(gl);

	// Setup camera for editor
	editorCamera = new Camera("editor");
	gameCamera = new Camera("game");

	UI.Init();
	Input.Init();
	Lines.Setup();

	// Setup Scenegraph nodes
	Map.InitSampleCubes();
	Map.Init();
	Toad.Init();

	Skybox.Init();
	Skybox.Spawn();

	// Add some light
	Engine.SetAmbientLight([0.3, 0.3, 0.4]);
	let sunlightColor = [1.0, 1.0, 0.9];
	let sunlightNode = new LightNode(
		"sunlight",
		Light.MakeDirectional(sunlightColor),
		utils.MakeRotateXYZMatrix(30, 30, 120)
	);
	sunlightNode.SetParent(Engine.ROOT_NODE);

	Engine.Start(); // v-v-vroom
}

export function GetMode() {
	return mode;
}

let lastSavedMap: string;
export function ToggleMode(): Mode {
	FindNode((n) => n.name === "cpt-toad").forEach((n) => n.Remove());
	if (mode === "EDITOR") {
		lastSavedMap = Map.Serialize();

		let spawnPoint = FindNode((n) => n.name === "flag-start")[0];
		let moons = FindNode((n) => n.name === "moon");
		if (spawnPoint) {
			if (moons.length === 0) {
				alert("You must add at least 1 Moon to play the level");
				mode = "EDITOR";
			} else {
				Input.ResetMoveDir();
				moonsToWin = moons.length;
				Toad.Spawn(spawnPoint.state.worldMatrix);
				// spawnPoint.SetParent(null); // Remove spawn location while playing
				mode = "GAME";
				UI.ToggleUIMode();
			}
		} else {
			alert("You must add a Spawn location first!");
			mode = "EDITOR";
		}
	} else {
		// "GAME"
		Map.Clear();
		Map.Deserialize(lastSavedMap);
		Map.LoadMap();
		mode = "EDITOR";
		UI.ToggleUIMode();
	}

	GetActiveCamera().Update();
	return mode;
}

export function GetActiveCamera() {
	return mode === "EDITOR" ? editorCamera : gameCamera;
}

window.onload = () => init();
