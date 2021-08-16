import * as Block from "./models/Block";
import * as Core from "./engine/Core";
import * as SceneGraph from "./engine/SceneGraph";
import * as DebugLine from "./engine/debug/Lines";
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

// Init map
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

export function Init(gl: WebGL2RenderingContext) {
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

export function ClampMapCoordinates(v: number[]) {
	let x = v[0],
		y = v[1],
		z = v[2];

	return [
		x < 0 ? 0 : x >= MAP_MAX_XZ_SIZE ? MAP_MAX_XZ_SIZE - 1 : x,
		y < 0 ? 0 : y >= MAP_MAX_XZ_SIZE ? MAP_MAX_Y_SIZE - 1 : y,
		z < 0 ? 0 : z >= MAP_MAX_XZ_SIZE ? MAP_MAX_XZ_SIZE - 1 : z,
	];
}

export function DrawGrid() {
	const halfMapSize = MAP_MAX_XZ_SIZE / 2;
	const color = DebugLine.LineColor.GREY;
	const epsilon = -0.00001; // so we can see the axis
	for (let x = 0; x <= MAP_MAX_XZ_SIZE; x++) {
		let _x = x - halfMapSize;
		DebugLine.DrawLine(
			[_x, epsilon, -halfMapSize],
			[_x, epsilon, halfMapSize],
			color
		);
	}
	for (let z = 0; z <= MAP_MAX_XZ_SIZE; z++) {
		let _z = z - halfMapSize;
		DebugLine.DrawLine(
			[-halfMapSize, epsilon, _z],
			[halfMapSize, epsilon, _z],
			color
		);
	}
}

export function InitSampleCubes() {
	// EXAMPLE: Place some blocks
	map[0][0][0] = { type: CellType.BlockWhite };
	map[0][0][1] = { type: CellType.BlockYellow };
	map[1][0][0] = { type: CellType.BlockWhite };
	map[0][1][0] = { type: CellType.BlockYellow };
}
