import * as DebugLine from "../debug/Lines";
import { utils } from "../utils/utils";
import * as Engine from "./Core";
import { Light } from "./Lights";
import { WebGLProgramInfo } from "./Shaders";

// Object containing data useful for rendering
interface DrawInfo {
	materialColor: number[];
	programInfo: WebGLProgramInfo;
	bufferLength: number;
	vertexArrayObject: WebGLVertexArrayObject;
	texture?: () => void
}

// A function that receives the state of the Node and performs actions on it
export type Action<T> = (state: T) => void;
// A function that receives the state and the view projectection matrix of a Node and renders it
// by calling `gl.drawElements(...)`

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
	name: string;
	constructor(name: string, localMatrix?: number[]) {
		this.name = name;
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

	Update(gl: WebGL2RenderingContext, deltaTime: number, VPMatrix: number[], worldMatrix?: number[]) {
		this.UpdateWorldMatrix(worldMatrix);
		this.ExecuteActions();

		this.children.forEach((child) =>
			child.Update(gl, deltaTime, VPMatrix, this.state.worldMatrix)
		);
	}
}

export class RenderNode<T extends State> extends Node<T> {
	override Update(
		gl: WebGL2RenderingContext,
		deltaTime: number,
		VPMatrix: number[],
		worldMatrix?: number[]
	) {
		super.Update(gl, deltaTime, VPMatrix, worldMatrix);
	
		gl.useProgram(this.state.drawInfo.programInfo.program);

		let projectionMatrix = utils.multiplyMatrices(
			VPMatrix,
			this.state.worldMatrix
		);
		let normalMatrix = utils.invertMatrix(
			utils.transposeMatrix(this.state.worldMatrix)
		);

		gl.uniformMatrix4fv(
			this.state.drawInfo.programInfo.locations.matrix,
			false,
			utils.transposeMatrix(projectionMatrix)
		);
		gl.uniformMatrix4fv(
			this.state.drawInfo.programInfo.locations.normalMatrix,
			false,
			utils.transposeMatrix(normalMatrix)
		);
		gl.uniformMatrix4fv(
			this.state.drawInfo.programInfo.locations.positionMatrix,
			false,
			utils.transposeMatrix(this.state.worldMatrix)
		);

		gl.uniform3fv(this.state.drawInfo.programInfo.locations.materialDiffColor, this.state.drawInfo.materialColor);

		Engine.BindAllLightUniforms(gl, this.state.drawInfo.programInfo.program);

		// Render Texture
		if (this.state.drawInfo.texture) {
			this.state.drawInfo.texture()
		}

		gl.bindVertexArray(this.state.drawInfo.vertexArrayObject);
		gl.drawElements(
			gl.TRIANGLES,
			this.state.drawInfo.bufferLength,
			gl.UNSIGNED_SHORT,
			0
		);
	}
}

export class LightNode<T extends State> extends Node<T> {
	light: Light = new Light();

	constructor(name: string, light: Light, localMatrix?: number[]) {
		super(name, localMatrix);
		this.light = light;
	}

	override Update(
		gl: WebGL2RenderingContext,
		deltaTime: number,
		VPMatrix: number[],
		worldMatrix?: number[]
	) {
		super.Update(gl, deltaTime, VPMatrix, worldMatrix);
		this.light.pos = utils.ComputePosition(
			this.state.worldMatrix,
			[0, 0, 0]
		);
		const forward = [1, 0, 0]; // default direction
		const p2 = utils.ComputePosition(this.state.worldMatrix, forward);
		for (let i = 0; i < 3; i++) {
			this.light.dir[i] = p2[i] - this.light.pos[i];
		}

		this.light.dir = utils.normalize(this.light.dir);

		// Draw a vector to represent the light position
		DebugLine.DrawLine(
			this.light.pos,
			utils.addVectors(this.light.pos, this.light.dir),
			DebugLine.LineColor.YELLOW
		);

		Engine.AddLight(this.light);
	}
}
