import { HitNode } from "./engine/Raycast";
import * as Map from "./Map";
import { utils } from "./utils/utils";
import { saveAs } from "file-saver";

type EditMode = "ADD" | "REMOVE";

let activeBlock: Map.CellType = Map.CellType.Empty;

export let editMode: EditMode; // Initialized elsewhere

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
			if (!hit.node.name.startsWith("cpt-toad")) Map.RemoveNode(hit.node);
		}
		if (editMode === "ADD") {
			// Move the point away from the current node to make sure
			// that any rounding does not make it fall within its bounds.
			let newNodePosition = utils.addVectors(
				hit.position,
				utils.multiplyVectorScalar(hit.ray.dir, -0.15)
			);
			let pos = Map.ToMapCoords(newNodePosition);
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

export function ExportMap() {
	let file = new Blob([Map.Serialize()], {
		type: "text/plain;charset=utf-8",
	});
	saveAs(file, "map.json");
}
export function ImportMap(s: string) {
	Map.Clear();
	Map.Deserialize(s);
	Map.LoadMap();
}
