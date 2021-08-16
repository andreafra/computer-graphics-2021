import { utils } from "./utils/utils";
import * as Engine from "./engine/Core";
import * as Editor from "./Editor";
import { CellType } from "./Map";
import * as Camera from "./Camera";
import { GetEditorMode } from "./main";

let isPointerActive: boolean;
let mouseDownPos: { x: number; y: number; alpha: number; beta: number };

let alpha = 0, // angle between X-axis and camera (X,Z) position - (0,0)
	beta = 0, // angle between XZ plane and camera (X,Y,Z) position - (0,0,0)
	alphaRad = 0,
	betaRad = 0;
/* --------------------------------------------------- */

export function Init(gl: WebGL2RenderingContext) {
	document.addEventListener("keydown", HandleInputFromKeyboad);
	document.addEventListener("keyup", HandleInputReleaseFromKeyboard);
	gl.canvas.addEventListener("pointerdown", HandleInputFromPointer);
	gl.canvas.addEventListener("pointerup", () => (isPointerActive = false));
	gl.canvas.addEventListener("pointermove", HandleDragInputFromPointer);
	gl.canvas.addEventListener("wheel", HandleScroll);
}

export var moveDir = [0, 0, 0];

// Afaik Javascript doesn't let us read keyboard state directly, so we'll have
// to listen for both a key release and a key press

function HandleInputFromKeyboad(ev: KeyboardEvent) {
	if (GetEditorMode() === "EDITOR")
		switch (ev.key) {
			// Movement
			case "w":
				Editor.MoveSelectionForward();
				break;
			case "a":
				Editor.MoveSelectionLeft();
				break;

			case "s":
				Editor.MoveSelectionBackward();
				break;

			case "d":
				Editor.MoveSelectionRight();
				break;

			case "e":
				Editor.MoveSelectionUp();
				break;

			case "q":
				Editor.MoveSelectionDown();
				break;

			// Camera Movement
			case "ArrowUp":
				Camera.cameraOrbit.tz -= 1;
				Camera.Update();
				break;

			case "ArrowDown":
				Camera.cameraOrbit.tz += 1;
				Camera.Update();
				break;

			case "ArrowLeft":
				Camera.cameraOrbit.tx -= 1;
				Camera.Update();
				break;

			case "ArrowRight":
				Camera.cameraOrbit.tx += 1;
				Camera.Update();
				break;

			// Change blocks
			case "0":
				Editor.SetActiveBlock(CellType.Empty);
				break;
			case "1":
				Editor.SetActiveBlock(CellType.BlockWhite);
				break;
			case "2":
				Editor.SetActiveBlock(CellType.BlockYellow);
				break;

			// Select block
			case "Enter":
				Editor.DoActionOnSelectedBlock();
				break;

			// Camera controls
			case "PageUp":
				Camera.cameraOrbit.radius = utils.Clamp(
					Camera.cameraOrbit.radius +
						Camera.CAMERA_DISTANCE_INCREMENT,
					Camera.MIN_CAMERA_DISTANCE,
					Camera.MAX_CAMERA_DISTANCE
				);
				Camera.Update();
				break;
			case "PageDown":
				Camera.cameraOrbit.radius = utils.Clamp(
					Camera.cameraOrbit.radius -
						Camera.CAMERA_DISTANCE_INCREMENT,
					Camera.MIN_CAMERA_DISTANCE,
					Camera.MAX_CAMERA_DISTANCE
				);
				Camera.Update();
				break;
		}

	if (GetEditorMode() === "GAME") {
		switch (ev.key) {
			// Movement
			case "w":
			case "ArrowUp":
				moveDir[2] = 1;
				break;
			case "a":
			case "ArrowLeft":
				moveDir[0] = -1;
				break;
			case "s":
			case "ArrowDown":
				moveDir[2] = -1;
				break;
			case "d":
			case "ArrowRight":
				moveDir[0] = 1;
				break;

			case " ":
				console.log("jump!");
				break;
		}

		console.log(moveDir);
	}
}

function HandleInputReleaseFromKeyboard(ev: KeyboardEvent) {
	if (GetEditorMode() === "GAME") {
		switch (ev.key) {
			// Movement
			case "w":
			case "ArrowUp":
				moveDir[2] = 0;
				break;
			case "a":
			case "ArrowLeft":
				moveDir[0] = 0;
				break;
			case "s":
			case "ArrowDown":
				moveDir[2] = 0;
				break;
			case "d":
			case "ArrowRight":
				moveDir[0] = 0;
				break;

			case " ":
				console.log("jump!");
				break;
		}

		console.log(moveDir);
	}
}

function HandleDragInputFromPointer(ev: PointerEvent) {
	ev.preventDefault();
	if (isPointerActive) {
		// Do stuff with mouse (requires raycasts)
		if (ev.ctrlKey) {
			// ROTATE CAMERA
			alpha =
				(ev.clientX - mouseDownPos.x) * Camera.CAMERA_SPEED +
				mouseDownPos.alpha;
			beta =
				(ev.clientY - mouseDownPos.y) * Camera.CAMERA_SPEED +
				mouseDownPos.beta;

			//alpha = utils.Clamp(alpha, 1, 359);
			beta = utils.Clamp(beta, 15, 89.9);

			alphaRad = utils.degToRad(alpha);
			betaRad = utils.degToRad(beta);
			//console.log(alpha, beta);

			Camera.cameraOrbit.ox = Math.cos(alphaRad) * Math.cos(betaRad);
			Camera.cameraOrbit.oy = Math.sin(betaRad);
			Camera.cameraOrbit.oz = Math.sin(alphaRad) * Math.cos(betaRad);

			Camera.Update();
		} else if (ev.shiftKey) {
			// TODO: PAN CAMERA
		}
	}
}

function HandleInputFromPointer(ev: PointerEvent) {
	ev.preventDefault();
	// Handle mouse down events
	mouseDownPos = {
		x: ev.clientX,
		y: ev.clientY,
		alpha: alpha,
		beta: beta,
	};
	isPointerActive = true;
}

function HandleScroll(ev: any) {
	ev.preventDefault();
	let scrollDir = -Math.sign(ev.wheelDeltaY);

	Camera.cameraOrbit.radius = utils.Clamp(
		Camera.cameraOrbit.radius +
			Camera.CAMERA_DISTANCE_INCREMENT * scrollDir,
		Camera.MIN_CAMERA_DISTANCE,
		Camera.MAX_CAMERA_DISTANCE
	);
	Camera.Update();
}
