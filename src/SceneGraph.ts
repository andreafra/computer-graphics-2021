import { utils } from "./utils/utils";

interface DrawInfo {
	materialColor: number[];
	programInfo: WebGLProgram;
	bufferLength: number;
	vertexArray: WebGLVertexArrayObject;
}

export class Node {
	parent: Node;
	children: Node[];
	localMatrix: number[];
	worldMatrix: number[];
	drawInfo: DrawInfo;

	constructor() {
		this.parent = null;
		this.children = [];
		this.localMatrix = utils.identityMatrix();
		this.worldMatrix = utils.identityMatrix();
		this.drawInfo = null;
	}
	SetParent = (newParent: Node) => {
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

	UpdateWorldMatrix = (matrix?: number[]) => {
		if (matrix) {
			this.worldMatrix = utils.multiplyMatrices(matrix, this.localMatrix);
		} else {
			utils.copy(this.localMatrix, this.worldMatrix);
		}

		// now process all the children
		this.children.forEach((child) =>
			child.UpdateWorldMatrix(this.worldMatrix)
		);
	};
}
