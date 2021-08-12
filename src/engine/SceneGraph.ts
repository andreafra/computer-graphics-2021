import { utils } from "../utils/utils";

// Object containing data useful for rendering
interface DrawInfo {
	materialColor: number[];
	program: WebGLProgram;
	bufferLength: number;
	vertexArrayObject: WebGLVertexArrayObject;
}

// A function that receives the state of the Node and performs actions on it
export type Action<T> = (state: T) => void;
// A function that receives the state and the view projectection matrix of a Node and renders it
// by calling `gl.drawElements(...)`
export type RenderAction<T> = (state: T, VPMatrix: number[]) => void;

// The state of a node. Extend it if you need other variables for that node
export interface State {
	localMatrix: number[];
	worldMatrix: number[];
	drawInfo: DrawInfo;
}

// A simple node of a tree. It has a state (object containing data)
// and an array of Actions (functions) that are called each update
export class Node<T extends State> {
	parent: Node<State>;
	children: Node<State>[];
	state: T;
	actions: Action<T>[];

	constructor(localMatrix?: number[]) {
		this.parent = null;
		this.children = [];
		this.actions = [];
		this.state = {
			localMatrix: localMatrix || utils.identityMatrix(),
			worldMatrix: utils.identityMatrix(),
			drawInfo: null,
			...this.state,
		};
	}

	// Private:
	private ExecuteActions = () => {
		this.actions.forEach((action) => action(this.state));
	};

	private UpdateWorldMatrix = (matrix?: number[]) => {
		if (matrix) {
			this.state.worldMatrix = utils.multiplyMatrices(
				matrix,
				this.state.localMatrix
			);
		} else {
			utils.copy(this.state.localMatrix, this.state.worldMatrix);
		}
	};

	// Public:
	SetParent = (newParent: Node<State>) => {
		// remove us from our parent
		if (this.parent) {
			var idx = this.parent.children.indexOf(this);
			if (idx >= 0) {
				this.parent.children.splice(idx, 1);
			}
		}

		// Add us to our new parent
		if (newParent) {
			newParent.children.push(this);
		}
		this.parent = newParent;
	};

	AddAction(action: (state: T) => void) {
		this.actions.push(action);
	}

	UpdateAndRender = (
		deltaTime: number,
		VPMatrix: number[],
		worldMatrix?: number[]
	) => {
		this.UpdateWorldMatrix(worldMatrix);
		this.ExecuteActions();
		// Draw if render node
		if (this instanceof RenderNode) {
			this.Render(VPMatrix);
		}
		this.children.forEach((child) =>
			child.UpdateAndRender(deltaTime, VPMatrix, this.state.worldMatrix)
		);
	};
}

export class RenderNode<T extends State> extends Node<T> {
	renderAction: RenderAction<State>;

	Render(VPMatrix: number[]) {
		this.renderAction(this.state, VPMatrix);
	}
}
