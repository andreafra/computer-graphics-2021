import { HitNode } from "./engine/Raycast";
import * as Map from "./Map";
import { utils } from "./utils/utils";

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
	if (hit.node) {
		if (editMode === "REMOVE") {
			let mapPos = Map.ToMapCoords(
				utils.addVectors(
					hit.node.GetLocalCoordinates(),
					[-0.5, 0.0, -0.5]
				)
			);
			if (hit.node.name.startsWith("block-")) hit.node.Remove();
			Map.SetCell(mapPos, Map.CellType.Empty);
		}
		if (editMode === "ADD") {
			// Sometimes the coordinates are the one of the block, therefore the block is not placed
			// Keep clicking around and it will spawn eventually lol
			// This is probably because of the approximations of AABB intersection checks
			// and the ToMapCoords flooring of those numbers.
			let pos = Map.ToMapCoords(hit.position);
			let cell = Map.GetCell(pos);
			if (cell && cell.type === Map.CellType.Empty) {
				Map.SetCell(pos, activeBlock);
			}
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
