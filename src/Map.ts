import * as Block from "./models/Block";
import * as Core from "./engine/Core";
import * as SceneGraph from "./engine/SceneGraph";
import * as DebugLine from "./engine/debug/Lines";
import { gl } from "./engine/Core";
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
const HALF_MAP_SIZE = MAP_MAX_XZ_SIZE / 2;

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

export function Init() {
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
						Block.init(Block.Type.White, spawnCoord, mapRoot);
						break;
					case CellType.BlockYellow:
						Block.init(Block.Type.Yellow, spawnCoord, mapRoot);
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
	const color = DebugLine.LineColor.GREY;
	const epsilon = -0.00001; // so we can see the axis
	for (let x = 0; x <= MAP_MAX_XZ_SIZE; x++) {
		let _x = x - HALF_MAP_SIZE;
		DebugLine.DrawLine(
			[_x, epsilon, -HALF_MAP_SIZE],
			[_x, epsilon, HALF_MAP_SIZE],
			color
		);
	}
	for (let z = 0; z <= MAP_MAX_XZ_SIZE; z++) {
		let _z = z - HALF_MAP_SIZE;
		DebugLine.DrawLine(
			[-HALF_MAP_SIZE, epsilon, _z],
			[HALF_MAP_SIZE, epsilon, _z],
			color
		);
	}
}

export function ToMapCoords(n: number[]) {
	let p = [];
	p[0] = Math.floor(n[0]) + HALF_MAP_SIZE;
	let y = Math.floor(n[1]);
	p[1] = Math.max(y, 0);
	p[2] = Math.floor(n[2]) + HALF_MAP_SIZE;
	return p;
}

export function InitSampleCubes() {
	// EXAMPLE: Place some blocks
	map[0][0][0] = { type: CellType.BlockWhite };
	map[0][0][1] = { type: CellType.BlockYellow };
	map[1][0][0] = { type: CellType.BlockWhite };
	map[0][1][0] = { type: CellType.BlockYellow };
}
