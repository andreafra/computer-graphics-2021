import * as Core from "./Core";
import * as Editor from "./Editor";
import { CellType } from "./Map";

let isPointerActive: boolean;

export function Init(gl: WebGL2RenderingContext) {
	document.addEventListener("keydown", HandleInputFromKeyboad);
	document.addEventListener("keyup", HandleInputReleaseFromKeyboard);
	gl.canvas.addEventListener("pointerdown", () => (isPointerActive = true));
	gl.canvas.addEventListener("pointerdown", HandleInputFromPointer);
	gl.canvas.addEventListener("pointerup", () => (isPointerActive = false));
	gl.canvas.addEventListener("pointermove", HandleDragInputFromPointer);
}

export var moveDir = [0, 0, 0];

// Afaik Javascript doesn't let us read keyboard state directly, so we'll have
// to listen for both a key release and a key press

function HandleInputFromKeyboad(ev: KeyboardEvent) {
	if (Core.EditorMode === "EDITOR")
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
		}

	if (Core.EditorMode === "GAME") {
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
	if (Core.EditorMode === "GAME") {
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
	if (isPointerActive) {
		// Do stuff with mouse (requires raycasts)
	}
}

function HandleInputFromPointer(ev: PointerEvent) {
	// Handle mouse down events
}
