import { utils } from "./utils/utils";
import * as Editor from "./Editor";
import * as Map from "./Map";
import { Camera } from "./Camera";
import { GetActiveCamera, GetMode } from "./main";
import { gl } from "./engine/Core";
import * as Raycast from "./engine/Raycast";

let isPointerActive: boolean;
let isPointerSecondaryActive: boolean;
let lastPointerPos: { x: number; y: number };

let pressedState = { left: false, right: false, up: false, down: false };

const DRAG_SPEED = 0.25;

export function Init() {
	document.addEventListener("keydown", HandleInputKeyDown);
	document.addEventListener("keyup", HandleInputKeyUp);
	gl.canvas.addEventListener("pointerdown", HandleInputPointerDown);
	gl.canvas.addEventListener("pointerup", () => {
		isPointerActive = false;
		isPointerSecondaryActive = false;
	});
	gl.canvas.addEventListener("pointermove", HandleInputPointerDrag);
	gl.canvas.addEventListener("contextmenu", HandleRightClick);
	gl.canvas.addEventListener("wheel", HandleInputScroll);
}

export var moveDir = [0, 0, 0];

// Afaik Javascript doesn't let us read keyboard state directly, so we'll have
// to listen for both a key release and a key press

function HandleInputKeyDown(ev: KeyboardEvent) {
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
				t = GetActiveCamera().translation;
				t[2] -= 1;
				GetActiveCamera().translation = t;
				break;

			case "ArrowDown":
				t = GetActiveCamera().translation;
				t[2] += 1;
				GetActiveCamera().translation = t;
				break;

			case "ArrowLeft":
				t = GetActiveCamera().translation;
				t[0] -= 1;
				GetActiveCamera().translation = t;
				break;

			case "ArrowRight":
				t = GetActiveCamera().translation;
				t[0] += 1;
				GetActiveCamera().translation = t;
				break;

			// Change blocks
			case "0":
				Editor.SetActiveBlock(Map.CellType.Empty);
				break;
			case "1":
				Editor.SetActiveBlock(Map.CellType.BlockYellow);
				break;
			case "2":
				Editor.SetActiveBlock(Map.CellType.BlockWhite);
				break;

			// Camera controls
			case "PageUp":
				GetActiveCamera().IncrementDistance();
				break;
			case "PageDown":
				GetActiveCamera().DecrementDistance();
				break;
		}
	}
	if (GetMode() === "GAME") {
		switch (ev.key) {
			// Movement
			case "w":
			case "ArrowUp":
				pressedState.up = true;
				moveDir[2] = 1;
				break;
			case "a":
			case "ArrowLeft":
				pressedState.left = true;
				moveDir[0] = -1;
				break;
			case "s":
			case "ArrowDown":
				pressedState.down = true;
				moveDir[2] = -1;
				break;
			case "d":
			case "ArrowRight":
				pressedState.right = true;
				moveDir[0] = 1;
				break;

			case " ":
				console.log("jump!");
				break;
		}
	}
}

function HandleInputKeyUp(ev: KeyboardEvent) {
	if (GetMode() === "GAME") {
		switch (ev.key) {
			// Movement
			case "w":
			case "ArrowUp":
				pressedState.up = false;
				moveDir[2] = pressedState.down ? -1 : 0;
				break;
			case "a":
			case "ArrowLeft":
				pressedState.left = false;
				moveDir[0] = pressedState.right ? 1 : 0;
				break;
			case "s":
			case "ArrowDown":
				pressedState.down = false;
				moveDir[2] = pressedState.up ? 1 : 0;
				break;
			case "d":
			case "ArrowRight":
				pressedState.right = false;
				moveDir[0] = pressedState.left ? -1 : 0;
				break;

			case " ":
				console.log("jump!");
				break;
		}
	}
}

function HandleInputPointerDrag(ev: PointerEvent) {
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

	lastPointerPos = {
		x: ev.clientX,
		y: ev.clientY,
	};
}

function HandleRightClick(ev: MouseEvent) {
	ev.preventDefault();
	isPointerSecondaryActive = true;
	return false;
}

function HandleInputPointerDown(ev: PointerEvent) {
	ev.preventDefault();
	// Handle mouse down events
	lastPointerPos = {
		x: ev.clientX,
		y: ev.clientY,
	};
	isPointerActive = true;

	if (ev.button == 0 && !ev.ctrlKey) {
		// Raycast
		let hit = Raycast.Hit(ev.clientX, ev.clientY);
		if (GetMode() == "EDITOR") Editor.DoActionOnSelectedBlock(hit);
	}
}

function HandleInputScroll(ev: any) {
	ev.preventDefault();
	let scrollDir = -Math.sign(ev.wheelDeltaY);

	if (scrollDir > 0) GetActiveCamera().IncrementDistance();
	else GetActiveCamera().DecrementDistance();
}

function RotateCamera(x: number, y: number) {
	GetActiveCamera().Rotate(
		(x - lastPointerPos.x) * DRAG_SPEED,
		(y - lastPointerPos.y) * DRAG_SPEED
	);
}
