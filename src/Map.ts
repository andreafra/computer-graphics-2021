import * as Block from "./models/Block";
import * as Brick from "./models/Brick";
import * as Moon from "./models/Moon";
import * as Coin from "./models/Coin";
import * as Enemy from "./models/Enemy";
import * as Flag from "./models/Flag";
import * as Engine from "./engine/Core";
import * as SceneGraph from "./engine/SceneGraph";
import * as Lines from "./engine/Lines";
import { utils } from "./utils/utils";

export enum CellType {
	Empty = 0,
	BlockWhite,
	BlockYellow,
	Brick,
	Moon,
	Coin,
	Enemy,
	Spawn,
}

export interface Cell {
	type: CellType;
	node?: SceneGraph.RenderNode<SceneGraph.IRenderableState>;
}

const MAP_MAX_XZ_SIZE = 8;
const MAP_MAX_Y_SIZE = 8;
const HALF_MAP_SIZE = MAP_MAX_XZ_SIZE / 2;

type Map = Cell[][][];

let map: Map = [];
let mapRoot: SceneGraph.Node<SceneGraph.State>;

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
	Block.Init();
	Brick.Init();
	Moon.Init();
	Coin.Init();
	Enemy.Init();
	Flag.Init();

	mapRoot = new SceneGraph.Node("map-root");
	mapRoot.SetParent(Engine.ROOT_NODE);

	let grid = MakeGrid();
	mapRoot.AddAction((deltaTime, node) => grid.forEach(Engine.AddLine));

	LoadMap();

	return mapRoot;
}

export function LoadMap() {
	for (let x = 0; x < MAP_MAX_XZ_SIZE; x++) {
		for (let y = 0; y < MAP_MAX_Y_SIZE; y++) {
			for (let z = 0; z < MAP_MAX_XZ_SIZE; z++) {
				const block = map[x][y][z];

				InitCell(x, y, z, block);
			}
		}
	}
}

function InitCell(x: number, y: number, z: number, block: Cell) {
	const spawnCoord = [
		x - MAP_MAX_XZ_SIZE / 2 + 0.5,
		y,
		z - MAP_MAX_XZ_SIZE / 2 + 0.5,
	];
	switch (block.type) {
		case CellType.Empty:
			map[x][y][z].node = null;
			break;
		case CellType.BlockWhite:
			map[x][y][z].node = Block.Spawn(
				Block.Type.White,
				spawnCoord,
				mapRoot
			);
			break;
		case CellType.BlockYellow:
			map[x][y][z].node = Block.Spawn(
				Block.Type.Yellow,
				spawnCoord,
				mapRoot
			);
			break;
		case CellType.Brick:
			map[x][y][z].node = Brick.Spawn(spawnCoord, mapRoot);
			break;
		case CellType.Moon:
			map[x][y][z].node = Moon.Spawn(spawnCoord, mapRoot);
			break;
		case CellType.Coin:
			map[x][y][z].node = Coin.Spawn(spawnCoord, mapRoot);
			break;
		case CellType.Enemy:
			map[x][y][z].node = Enemy.Spawn(spawnCoord, mapRoot);
			break;
		case CellType.Spawn:
			map.forEach((a) =>
				a.forEach((b) =>
					b.forEach((c) => {
						if (map[x][y][z] != c && c.type == CellType.Spawn) {
							Remove(c);
						}
					})
				)
			);
			map[x][y][z].node = Flag.Spawn(
				Flag.Type.Start,
				spawnCoord,
				mapRoot
			);
			break;
		default:
			break;
	}
}

function Remove(c: Cell) {
	c.type = CellType.Empty;
	c.node.Remove();
	c.node = null;
}

export function RemoveNode(node: SceneGraph.Node<SceneGraph.State>) {
	map.forEach((a) =>
		a.forEach((b) =>
			b.forEach((c) => {
				if (c.node == node) Remove(c);
			})
		)
	);
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

function MakeGrid() {
	let grid = new Array<Lines.Line>();
	const color = Lines.LineColor.GREY;
	for (let x = 0; x <= MAP_MAX_XZ_SIZE; x++) {
		let _x = x - HALF_MAP_SIZE;
		grid.push(
			Lines.MakeLine(
				[_x, 0, -HALF_MAP_SIZE],
				[_x, 0, HALF_MAP_SIZE],
				color
			)
		);
	}
	for (let z = 0; z <= MAP_MAX_XZ_SIZE; z++) {
		let _z = z - HALF_MAP_SIZE;
		grid.push(
			Lines.MakeLine(
				[-HALF_MAP_SIZE, 0, _z],
				[HALF_MAP_SIZE, 0, _z],
				color
			)
		);
	}
	return grid;
}

export function ToMapCoords(n: number[]) {
	let p = [];
	p[0] = Math.floor(n[0]) + HALF_MAP_SIZE;
	p[1] = Math.floor(n[1]);
	p[2] = Math.floor(n[2]) + HALF_MAP_SIZE;
	return p;
}

export function SetCell(coords: number[], type: CellType) {
	if (AreValidCoordinates(coords)) {
		let cell = { type: type };
		map[coords[0]][coords[1]][coords[2]] = cell;
		InitCell(coords[0], coords[1], coords[2], cell);
	}
}

export function GetCell(coords: number[]) {
	if (AreValidCoordinates(coords)) {
		return map[coords[0]][coords[1]][coords[2]];
	} else return null;
}

function AreValidCoordinates(coords: number[]) {
	return (
		coords[0] >= 0 &&
		coords[1] >= 0 &&
		coords[2] >= 0 &&
		coords[0] < MAP_MAX_XZ_SIZE &&
		coords[1] < MAP_MAX_XZ_SIZE &&
		coords[2] < MAP_MAX_XZ_SIZE
	);
}

export function IsGrounded(pos: number[], radius?: number) {
	let cellBelow = GetCell(ToMapCoords(pos));
	if (cellBelow?.node?.name.startsWith("block-")) return true;
	if (!radius) return false;

	cellBelow = GetCell(ToMapCoords(utils.addVectors(pos, [radius, 0, 0])));
	if (cellBelow?.node?.name.startsWith("block-")) return true;
	cellBelow = GetCell(ToMapCoords(utils.addVectors(pos, [-radius, 0, 0])));
	if (cellBelow?.node?.name.startsWith("block-")) return true;
	cellBelow = GetCell(ToMapCoords(utils.addVectors(pos, [0, 0, radius])));
	if (cellBelow?.node?.name.startsWith("block-")) return true;
	cellBelow = GetCell(ToMapCoords(utils.addVectors(pos, [0, 0, -radius])));
	if (cellBelow?.node?.name.startsWith("block-")) return true;
}

export function InitSampleCubes() {
	// EXAMPLE: Place some blocks
	map[0][1][0] = { type: CellType.BlockWhite };
	map[0][1][1] = { type: CellType.BlockYellow };
	map[1][1][0] = { type: CellType.BlockWhite };
	map[0][2][0] = { type: CellType.BlockYellow };

	// Also place a floor
	for (let x = 0; x < MAP_MAX_XZ_SIZE; x++) {
		for (let z = 0; z < MAP_MAX_XZ_SIZE; z++) {
			map[x][0][z] = { type: Math.floor(Math.random() * 2 + 1) };
		}
	}
}

export function Clear() {
	for (let x = 0; x < MAP_MAX_XZ_SIZE; x++) {
		for (let y = 0; y < MAP_MAX_Y_SIZE; y++) {
			for (let z = 0; z < MAP_MAX_XZ_SIZE; z++) {
				map[x][y][z].node?.Remove();
			}
		}
	}
}

export function Serialize() {
	return JSON.stringify(map.map((a) => a.map((b) => b.map((c) => c.type))));
}

export function Deserialize(s: string) {
	map = (JSON.parse(s) as number[][][]).map((a) =>
		a.map((b) => b.map((c) => ({ type: c })))
	);
}
