import { utils } from "./utils/utils";
import * as Engine from "./engine/Core";
import * as Editor from "./Editor";
import { CellType } from "./Map";
import { Camera } from "./Camera";
import { GetMode } from "./main";

let editorCamera: Camera;

let isPointerActive: boolean;
let isPointerSecondaryActive: boolean;
let mouseDownPos: { x: number; y: number; alpha: number; beta: number };

const DRAG_SPEED = 0.25;

let alpha = 0, // angle between X-axis and camera (X,Z) position - (0,0)
	beta = 0, // angle between XZ plane and camera (X,Y,Z) position - (0,0,0)
	alphaRad = 0,
	betaRad = 0;
/* --------------------------------------------------- */

export function Init(gl: WebGL2RenderingContext) {
	document.addEventListener("keydown", HandleInputFromKeyboad);
	document.addEventListener("keyup", HandleInputReleaseFromKeyboard);
	gl.canvas.addEventListener("pointerdown", HandleInputFromPointer);
	gl.canvas.addEventListener("pointerup", () => {
		isPointerActive = false;
		isPointerSecondaryActive = false;
	});
	gl.canvas.addEventListener("pointermove", HandleDragInputFromPointer);
	gl.canvas.addEventListener("contextmenu", HandleRightClick);
	gl.canvas.addEventListener("wheel", HandleScroll);

	// Get editor camera
	editorCamera = Camera.Get("editor");
}

export var moveDir = [0, 0, 0];

// Afaik Javascript doesn't let us read keyboard state directly, so we'll have
// to listen for both a key release and a key press

function HandleInputFromKeyboad(ev: KeyboardEvent) {
	if (GetMode() === "EDITOR") {
		let t: number[];

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
				t = editorCamera.translation;
				t[2] -= 1;
				editorCamera.translation = t;
				break;

			case "ArrowDown":
				t = editorCamera.translation;
				t[2] += 1;
				editorCamera.translation = t;
				break;

			case "ArrowLeft":
				t = editorCamera.translation;
				t[0] -= 1;
				editorCamera.translation = t;
				break;

			case "ArrowRight":
				t = editorCamera.translation;
				t[0] += 1;
				editorCamera.translation = t;
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
				editorCamera.IncrementDistance();
				break;
			case "PageDown":
				editorCamera.DecrementDistance();
				break;
		}
	}
	if (GetMode() === "GAME") {
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
	if (GetMode() === "GAME") {
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
			RotateCamera(ev.clientX, ev.clientY);
		} else if (ev.shiftKey) {
			// TODO: PAN CAMERA
		}
	}
	if (isPointerSecondaryActive) {
		RotateCamera(ev.clientX, ev.clientY);
	}
}

function HandleRightClick(ev: MouseEvent) {
	ev.preventDefault();
	isPointerSecondaryActive = true;
	return false;
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

	if (scrollDir > 0) editorCamera.IncrementDistance();
	else editorCamera.DecrementDistance();
}

function RotateCamera(x: number, y: number) {
	// ROTATE CAMERA
	alpha = (x - mouseDownPos.x) * DRAG_SPEED + mouseDownPos.alpha;
	beta = (y - mouseDownPos.y) * DRAG_SPEED + mouseDownPos.beta;

	beta = utils.Clamp(beta, 15, 89.9);

	alphaRad = utils.degToRad(alpha);
	betaRad = utils.degToRad(beta);

	editorCamera.normDir = [
		Math.cos(alphaRad) * Math.cos(betaRad),
		Math.sin(betaRad),
		Math.sin(alphaRad) * Math.cos(betaRad),
	];
}
