import * as Engine from "../engine/Core";
import { MakeTexture, MakeVAO } from "../engine/Models";
import { RenderNode, State } from "../engine/SceneGraph";
import { utils } from "../utils/utils";
import { getShader } from "../engine/Shaders";

// Assets
import toad_OBJ from "../assets/cpt_toad/toad.obj";
import bodyTextureSrc from "../assets/cpt_toad/Textures/baked_txt.png";

// Define common structure for state of these nodes
interface ToadState extends State {}

export function init(gl: WebGL2RenderingContext) {
	// SHADERS
	const programInfo = getShader(gl, true /* useTextures */);
	gl.useProgram(programInfo.program);

	// CREATE MODEL
	const vao = MakeVAO(gl, programInfo.program, {
		positions: toad_OBJ.vertices,
		normals: toad_OBJ.vertexNormals,
		indices: toad_OBJ.indices,
		uvCoord: toad_OBJ.textures,
	});

	const SetupTextureRender = MakeTexture(gl, programInfo.program, {
		dataSrc: bodyTextureSrc,
	});

	// SETUP NODES
	let tMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(0, 0, 0),
		utils.MakeScaleMatrix(1)
	);
	var toadNode = new RenderNode<ToadState>("cpt-toad", tMatrix);
	toadNode.state.drawInfo = {
		materialColor: [0.0, 0.0, 0.0],
		programInfo: programInfo,
		bufferLength: toad_OBJ.indices.length,
		vertexArrayObject: vao,
		texture: SetupTextureRender,
	};

	// Set relationships between nodes
	toadNode.SetParent(Engine.ROOT_NODE);
}
