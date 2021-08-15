import * as Map from "./Map";

let activeBlock: Map.CellType;

export function SetActiveBlock(type: Map.CellType) {
	activeBlock = type;
}

export function DoActionOnSelectedBlock() {}

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
