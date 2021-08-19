import { RenderNode, State, Node, IRenderableState } from "./SceneGraph";
import * as Engine from "./Core";
import { utils } from "../utils/utils";

export type IBounds = IBoxBounds & ICylindricBounds;

export type PhysicsState = IRenderableState & IBounds;

export class PhysicsNode<T extends PhysicsState> extends RenderNode<T> {
	Intersects(otherNodes = Engine.GetAllNodesWithBoxBounds()) {
		let collisions = [];
		otherNodes = otherNodes.filter((n) => n != this);
		for (let otherNode of otherNodes) {
			if (otherNode.state.bounds) {
				if (this.state.radius && this.state.height) {
					if (TestCylinderVsBoxCollision(this, otherNode)) {
						collisions.push(otherNode);
					}
				} else if (this.state.bounds) {
					if (TestBoxVsBoxCollision(this, otherNode)) {
						collisions.push(otherNode);
					}
				}
			}
		}
		return collisions;
	}
}

// [0] is min, [1] is max
// Default is a cube 1x1x1 with center at 0.0,0.5,0.0 since our models grow up on the Y axis
export interface IBoxBounds extends State {
	bounds: number[][];
}

export interface ICylindricBounds extends State {
	radius: number;
	height: number;
}

export const BOX_DEFAULT_BOUNDS = [
	[-0.5, 0, -0.5],
	[0.5, 1, 0.5],
];

export function BoxBoundsToWorldCoordinates(
	bounds: number[][],
	worldMatrix: number[]
) {
	let x = worldMatrix[3] / worldMatrix[15];
	let y = worldMatrix[7] / worldMatrix[15];
	let z = worldMatrix[11] / worldMatrix[15];

	return [
		[bounds[0][0] + x, bounds[0][1] + y, bounds[0][2] + z],
		[bounds[1][0] + x, bounds[1][1] + y, bounds[1][2] + z],
	];
}

/// AABB vs AABB (Axis Aligned Bounding Box)
export function TestBoxVsBoxCollision(
	a: Node<IBoxBounds>,
	b: Node<IBoxBounds>
): boolean {
	let aBounds = BoxBoundsToWorldCoordinates(
		a.state.bounds,
		a.state.worldMatrix
	);
	let bBounds = BoxBoundsToWorldCoordinates(
		b.state.bounds,
		b.state.worldMatrix
	);
	let aMin = aBounds[0];
	let aMax = aBounds[1];
	let bMin = bBounds[0];
	let bMax = bBounds[1];

	return (
		aMin[0] <= bMax[0] &&
		aMax[0] >= bMin[0] &&
		aMin[1] <= bMax[1] &&
		aMax[1] >= bMin[1] &&
		aMin[2] <= bMax[2] &&
		aMax[2] >= bMin[2]
	);
}

export function TestCylinderVsBoxCollision(
	cylinder: Node<ICylindricBounds>,
	box: Node<IBoxBounds>
): boolean {
	let cylWCoord = utils.ComputePosition(
		cylinder.state.worldMatrix,
		[0, 0, 0]
	);
	let cylX = cylWCoord[0];
	let cylZ = cylWCoord[2];
	let cylYMin = cylWCoord[1];
	let cylYMax = cylWCoord[1] + cylinder.state.height;

	let boxBounds = BoxBoundsToWorldCoordinates(
		box.state.bounds,
		box.state.worldMatrix
	);

	let x = utils.Clamp(cylX, boxBounds[0][0], boxBounds[1][0]);
	let z = utils.Clamp(cylZ, boxBounds[0][2], boxBounds[1][2]);

	let dist = Math.sqrt(Math.pow(x - cylX, 2) + Math.pow(z - cylZ, 2));

	return (
		dist < cylinder.state.radius &&
		cylYMin <= boxBounds[1][1] &&
		cylYMax >= boxBounds[0][1]
	);
}
