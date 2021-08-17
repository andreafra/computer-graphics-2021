import * as Engine from "../engine/Core";
import { MakeTexture, MakeVAO, TextureType } from "../engine/Models";
import { RenderNode, State } from "../engine/SceneGraph";
import { getShader, Features } from "../engine/Shaders";
import { gl } from "../engine/Core";
import { utils } from "../utils/utils";

// Assets
import toad_OBJ from "../assets/cpt_toad/toad.obj";
import bodyTextureSrc from "../assets/cpt_toad/Textures/baked_txt.png";
import emissiveMapSrc from "../assets/cpt_toad/Textures/baked_emm.png";
import normalMapSrc from "../assets/cpt_toad/Textures/baked_nrm.png";
import specularMapSrc from "../assets/cpt_toad/Textures/baked_spc.png";

// Define common structure for state of these nodes
interface ToadState extends State {}

export function Init() {
	// SHADERS
	const programInfo = getShader(
		Features.Texture |
			Features.EmissiveMap |
			Features.NormalMap |
			Features.SpecularMap
	);
	gl.useProgram(programInfo.program);

	// CREATE MODEL
	const vao = MakeVAO(programInfo.program, {
		positions: toad_OBJ.vertices,
		normals: toad_OBJ.vertexNormals,
		indices: toad_OBJ.indices,
		uvCoord: toad_OBJ.textures,
	});

	const baseTexture = MakeTexture(programInfo, {
		dataSrc: bodyTextureSrc,
		type: TextureType.BaseTexture,
	});
	const emissiveMap = MakeTexture(programInfo, {
		dataSrc: emissiveMapSrc,
		type: TextureType.EmissiveMap,
	});
	const normalMap = MakeTexture(programInfo, {
		dataSrc: normalMapSrc,
		type: TextureType.NormalMap,
	});
	const specularMap = MakeTexture(programInfo, {
		dataSrc: specularMapSrc,
		type: TextureType.SpecularMap,
	});

	// SETUP NODES
	let tMatrix = utils.multiplyMatrices(
		utils.MakeTranslateMatrix(0, 0, 0),
		utils.MakeScaleMatrix(1)
	);
	var toadNode = new RenderNode<ToadState>("cpt-toad", tMatrix);
	toadNode.state.drawInfo = {
		materialColor: [0.0, 0.0, 0.0],
		materialSpecColor: [0.3, 0.3, 0.3],
		materialEmitColor: [0, 0, 0], // Use emissive map instead
		programInfo: programInfo,
		bufferLength: toad_OBJ.indices.length,
		vertexArrayObject: vao,
		texture: baseTexture,
		emissiveMap: emissiveMap,
		normalMap: normalMap,
		specularMap: specularMap,
	};

	// Set relationships between nodes
	toadNode.SetParent(Engine.ROOT_NODE);

	return toadNode;
}
