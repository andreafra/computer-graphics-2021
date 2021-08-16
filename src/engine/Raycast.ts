import { DrawLine, LineColor } from "./debug/Lines";
import { utils } from "../utils/utils";
import { cameraMatrix, projectionMatrix, GetCameraPosition } from "./Core";

export function RayCast(
	gl: WebGL2RenderingContext,
	x: number,
	y: number
) {
	const normX = (2 * x) / gl.canvas.width - 1;
	const normY = 1 - (2 * y) / gl.canvas.height;

	//We need to go through the transformation pipeline in the inverse order so we invert the matrices
	const invProj = utils.invertMatrix(projectionMatrix);
	const invView = cameraMatrix;

	//Find the point (un)projected on the near plane, from clip space coords to eye coords
	//z = -1 makes it so the point is on the near plane
	//w = 1 is for the homogeneous coordinates in clip space
	const pointEyeCoords = utils.multiplyMatrixVector(invProj, [
		normX,
		normY,
		-1,
		1,
	]);

	//This finds the direction of the ray in eye space
	//Formally, to calculate the direction you would do dir = point - eyePos but since we are in eye space eyePos = [0,0,0]
	//w = 0 is because this is not a point anymore but is considered as a direction
	var rayEyeCoords = [
		pointEyeCoords[0],
		pointEyeCoords[1],
		pointEyeCoords[2],
		0,
	];

	//We find the direction expressed in world coordinates by multipling with the inverse of the view matrix
	const rayDir = utils.multiplyMatrixVector(invView, rayEyeCoords);
	const normalisedRayDir = utils.normalize(rayDir);
	//The ray starts from the camera in world coordinates

	var rayStartPoint = GetCameraPosition();

	// Draw the ray we're casting
	DrawLine(
		rayStartPoint,
		utils.addVectors(
			rayStartPoint,
			utils.multiplyVectorScalar(rayDir, 100)
		),
		LineColor.PURPLE
	);
}
