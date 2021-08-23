import * as DebugLine from "./debug/Lines";
import { utils } from "../utils/utils";
import * as Engine from "./Core";
import { Light } from "./Lights";
import { WebGLProgramInfo } from "./Shaders";
import { gl } from "./Core";
import { Shadow } from "./Shadows";

// A function that receives the state of the Node and performs actions on it
export type Action<T extends State> = (
	deltaTime: number,
	node: Node<T>
) => void;
// A function that receives the state and the view projectection matrix of a Node and renders it
// by calling `gl.drawElements(...)`

// The state of a node. Extend it if you need other variables for that node
export class State {
	localMatrix: number[];
	worldMatrix: number[];
}

export type IRenderableState = IRenderable & State;

export interface IRenderable {
	shouldRender?: boolean;
	materialColor: number[];
	materialAmbColor: number[];
	materialSpecColor: number[];
	materialEmitColor: number[];
	programInfo: WebGLProgramInfo;
	bufferLength: number;
	vertexArrayObject: WebGLVertexArrayObject;
	texture?: () => void;
	emissiveMap?: () => void;
	normalMap?: () => void;
	specularMap?: () => void;
	ambientOcclusion?: () => void;
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

	// Private:
	private ExecuteActions = (deltaTime: number) => {
		this.actions.forEach((action) => action(deltaTime, this));
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

		return this;
	};

	AddAction(action: (deltaTime: number, node: Node<T>) => void) {
		this.actions.push(action);
	}

	Update(deltaTime: number, worldMatrix?: number[]) {
		this.UpdateWorldMatrix(worldMatrix);
		this.ExecuteActions(deltaTime);

		this.children.forEach((child) =>
			child.Update(deltaTime, this.state.worldMatrix)
		);
	}

	Remove() {
		this.SetParent(null);
	}

	GetWorldCoordinates() {
		return utils.ComputePosition(this.state.worldMatrix, [0, 0, 0]);
	}
}

export function FindNode(
	matchFn: (n: Node<State>) => boolean,
	root = Engine.ROOT_NODE
) {
	let found = new Array<Node<State>>();
	root.children.forEach((n) => {
		if (matchFn(n)) found.push(n);
		found = found.concat(FindNode(matchFn, n));
	});
	return found;
}

export class RenderNode<T extends IRenderableState> extends Node<T> {
	override Update(deltaTime: number, worldMatrix?: number[]) {
		super.Update(deltaTime, worldMatrix);
		Engine.QueueRender((VPMatrix: number[]) => this.Render(VPMatrix));
	}

	Render(VPMatrix: number[]) {
		if (this.state.shouldRender == false) return;

		gl.useProgram(this.state.programInfo.program);

		let projectionMatrix = utils.multiplyMatrices(
			VPMatrix,
			this.state.worldMatrix
		);
		let normalMatrix = utils.invertMatrix(
			utils.transposeMatrix(this.state.worldMatrix)
		);

		gl.uniformMatrix4fv(
			this.state.programInfo.locations.matrix,
			false,
			utils.transposeMatrix(projectionMatrix)
		);
		gl.uniformMatrix4fv(
			this.state.programInfo.locations.normalMatrix,
			false,
			utils.transposeMatrix(normalMatrix)
		);
		gl.uniformMatrix4fv(
			this.state.programInfo.locations.positionMatrix,
			false,
			utils.transposeMatrix(this.state.worldMatrix)
		);

		gl.uniform3fv(
			this.state.programInfo.locations.materialDiffColor,
			this.state.materialColor
		);
		gl.uniform3fv(
			this.state.programInfo.locations.materialAmbColor,
			this.state.materialAmbColor
		);
		gl.uniform3fv(
			this.state.programInfo.locations.materialSpecColor,
			this.state.materialSpecColor
		);
		gl.uniform3fv(
			this.state.programInfo.locations.materialEmitColor,
			this.state.materialEmitColor
		);

		gl.uniform3fv(
			this.state.programInfo.locations.eyePos,
			Engine.GetCameraPosition()
		);

		Engine.BindAllLightUniforms(this.state.programInfo);
		Engine.BindAllShadowUniforms(this.state.programInfo);

		// Render Texture
		if (this.state.texture) {
			this.state.texture();
		}
		if (this.state.emissiveMap) {
			this.state.emissiveMap();
		}
		if (this.state.normalMap) {
			this.state.normalMap();
		}
		if (this.state.specularMap) {
			this.state.specularMap();
		}
		if (this.state.ambientOcclusion) {
			this.state.ambientOcclusion();
		}

		gl.bindVertexArray(this.state.vertexArrayObject);
		gl.drawElements(
			gl.TRIANGLES,
			this.state.bufferLength,
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

	override Update(deltaTime: number, worldMatrix?: number[]) {
		super.Update(deltaTime, worldMatrix);
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
		// DebugLine.DrawLine(
		// 	this.light.pos,
		// 	utils.addVectors(this.light.pos, this.light.dir),
		// 	DebugLine.LineColor.YELLOW
		// );

		Engine.AddLight(this.light);
	}
}

export class ShadowNode<T extends State> extends Node<T> {
	shadow: Shadow = new Shadow();

	constructor(name: string, shadow: Shadow, localMatrix?: number[]) {
		super(name, localMatrix);
		this.shadow = shadow;
	}

	override Update(deltaTime: number, worldMatrix?: number[]) {
		super.Update(deltaTime, worldMatrix);
		this.shadow.pos = utils.ComputePosition(
			this.state.worldMatrix,
			[0, 0, 0]
		);
		const down = [0, -1, 0]; // default direction
		const p2 = utils.ComputePosition(this.state.worldMatrix, down);

		this.shadow.dir = utils.subtractVectors(p2, this.shadow.pos);

		this.shadow.dir = utils.normalize(this.shadow.dir);

		Engine.AddShadow(this.shadow);
	}
}
