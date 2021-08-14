import * as Block from "../models/Block";
import * as Core from "./Core";
import * as SceneGraph from "./SceneGraph";

export enum CellType {
	Empty = 0,
	BlockWhite = 1,
	BlockYellow = 2,
}

export class Cell {
	type: CellType;
}

const MAP_MAX_XZ_SIZE = 8;
const MAP_MAX_Y_SIZE = 8;

type Map = Cell[][][];

let map: Map = [];

for (let x = 0; x < MAP_MAX_XZ_SIZE; x++) {
	map[x] = [];
	for (let y = 0; y < MAP_MAX_Y_SIZE; y++) {
		map[x][y] = [];
		for (let z = 0; z < MAP_MAX_XZ_SIZE; z++) {
			map[x][y][z] = {
				type: CellType.Empty,
			};
		}
	}
}

map[0][0][0] = { type: CellType.BlockWhite };
map[0][0][1] = { type: CellType.BlockYellow };
map[1][0][0] = { type: CellType.BlockWhite };
map[0][1][0] = { type: CellType.BlockYellow };

export function initMap(gl: WebGL2RenderingContext) {
	let mapRoot = new SceneGraph.Node("map-root");
	mapRoot.SetParent(Core.ROOT_NODE);

	for (let x = 0; x < MAP_MAX_XZ_SIZE; x++) {
		for (let y = 0; y < MAP_MAX_Y_SIZE; y++) {
			for (let z = 0; z < MAP_MAX_XZ_SIZE; z++) {
				const block = map[x][y][z];

				const spawnCoord = [
					x - MAP_MAX_XZ_SIZE / 2 + 0.5,
					y,
					z - MAP_MAX_XZ_SIZE / 2 + 0.5,
				];

				switch (block.type) {
					case CellType.Empty:
						break;
					case CellType.BlockWhite:
						Block.init(gl, Block.Type.White, spawnCoord, mapRoot);
						break;
					case CellType.BlockYellow:
						Block.init(gl, Block.Type.Yellow, spawnCoord, mapRoot);
						break;
					default:
						break;
				}
			}
		}
	}
}
