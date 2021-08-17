import { HitNode } from "./engine/Raycast";
import * as Map from "./Map";

type EditMode = "MOVE" | "ADD" | "REMOVE";

let activeBlock: Map.CellType = Map.CellType.Empty;

export let editMode: EditMode = "MOVE";

export function SetActiveBlock(type: Map.CellType) {
	activeBlock = type;
}

export function GetActiveBlock() {
	return activeBlock;
}

export function SetEditMode(mode: EditMode) {
	editMode = mode;
}

export function DoActionOnSelectedBlock(hit: HitNode) {
	console.log(activeBlock);
	if (hit.node) {
		if (editMode === "REMOVE") {
			hit.node.Remove();
		}
	} else {
		let mapPos = Map.ToMapCoords(hit.position);
		if (editMode === "ADD") {
			let cell = Map.GetCell(mapPos);
			if (cell && cell.type === Map.CellType.Empty) {
				Map.SetCell(mapPos, activeBlock);
			}
		}
	}
}

export var selectedBlockCoord = [0, 0, 0];

export function MoveSelectionForward() {
	selectedBlockCoord[2] += 1;
	selectedBlockCoord = Map.ClampMapCoordinates(selectedBlockCoord);
}
export function MoveSelectionBackward() {
	selectedBlockCoord[2] -= 1;
	selectedBlockCoord = Map.ClampMapCoordinates(selectedBlockCoord);
}
export function MoveSelectionLeft() {
	selectedBlockCoord[0] -= 1;
	selectedBlockCoord = Map.ClampMapCoordinates(selectedBlockCoord);
}
export function MoveSelectionRight() {
	selectedBlockCoord[0] += 1;
	selectedBlockCoord = Map.ClampMapCoordinates(selectedBlockCoord);
}
export function MoveSelectionUp() {
	selectedBlockCoord[1] += 1;
	selectedBlockCoord = Map.ClampMapCoordinates(selectedBlockCoord);
}
export function MoveSelectionDown() {
	selectedBlockCoord[1] -= 1;
	selectedBlockCoord = Map.ClampMapCoordinates(selectedBlockCoord);
}
