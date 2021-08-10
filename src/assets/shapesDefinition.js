//3D cube vertex coordinates and indices

var vertices = [
  // Vertex #:
  1.0,
  1.0,
  -1.0, //  0
  1.0,
  -1.0,
  -1.0, //  1
  -1.0,
  1.0,
  -1.0, //  2
  1.0,
  1.0,
  1.0, //  3
  -1.0,
  1.0,
  1.0, //  4
  1.0,
  -1.0,
  1.0, //  5
  1.0,
  1.0,
  -1.0, //  6
  1.0,
  1.0,
  1.0, //  7
  1.0,
  -1.0,
  -1.0, //  8
  1.0,
  -1.0,
  -1.0, //  9
  1.0,
  -1.0,
  1.0, // 10
  -1.0,
  -1.0,
  -1.0, // 11
  -1.0,
  -1.0,
  -1.0, // 12
  -1.0,
  -1.0,
  1.0, // 13
  -1.0,
  1.0,
  -1.0, // 14
  1.0,
  1.0,
  1.0, // 15
  1.0,
  1.0,
  -1.0, // 16
  -1.0,
  1.0,
  1.0, // 17
  -1.0,
  -1.0,
  -1.0, // 18
  -1.0,
  -1.0,
  1.0, // 19
  1.0,
  -1.0,
  1.0, // 20
  -1.0,
  -1.0,
  1.0, // 21
  -1.0,
  1.0,
  1.0, // 22
  -1.0,
  1.0,
  -1.0, // 23
];

var indices = [
  // Face #:
  0,
  1,
  2, //  0
  1,
  18,
  2, //  1
  3,
  4,
  5, //  2
  4,
  19,
  5, //  3
  6,
  7,
  8, //  4
  7,
  20,
  8, //  5
  9,
  10,
  11, //  6
  10,
  21,
  11, //  7
  12,
  13,
  14, //  8
  13,
  22,
  14, //  9
  15,
  16,
  17, // 10
  16,
  23,
  17, // 11
];

var normals = [
  // Color #:
  0.0,
  0.0,
  -1.0, //  0
  0.0,
  0.0,
  -1.0, //  1
  0.0,
  0.0,
  -1.0, //  2
  0.0,
  0.0,
  1.0, //  3
  0.0,
  0.0,
  1.0, //  4
  0.0,
  0.0,
  1.0, //  5
  1.0,
  0.0,
  0.0, //  6
  1.0,
  0.0,
  0.0, //  7
  1.0,
  0.0,
  0.0, //  8
  0.0,
  -1.0,
  0.0, //  9
  0.0,
  -1.0,
  0.0, // 10
  0.0,
  -1.0,
  0.0, // 11
  -1.0,
  0.0,
  0.0, // 12
  -1.0,
  0.0,
  0.0, // 13
  -1.0,
  0.0,
  0.0, // 14
  0.0,
  1.0,
  0.0, // 15
  0.0,
  1.0,
  0.0, // 16
  0.0,
  1.0,
  0.0, // 17
  0.0,
  0.0,
  -1.0, // 18
  0.0,
  0.0,
  1.0, // 19
  1.0,
  0.0,
  0.0, // 20
  0.0,
  -1.0,
  0.0, // 21
  -1.0,
  0.0,
  0.0, // 22
  0.0,
  1.0,
  0.0, // 23
];

export var vertexPositionData = [];
export var normalData = [];
export var indexData = [];

export function initSphere() {
  let latitudeBands = 10;
  let longitudeBands = 10;
  let radius = 5.0;

  // Calculate sphere vertex positions and normals.
  for (let latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
    let theta = (latNumber * Math.PI) / latitudeBands;
    let sinTheta = Math.sin(theta);
    let cosTheta = Math.cos(theta);

    for (let longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
      let phi = (longNumber * 2 * Math.PI) / longitudeBands;
      let sinPhi = Math.sin(phi);
      let cosPhi = Math.cos(phi);

      let x = cosPhi * sinTheta;
      let y = cosTheta;
      let z = sinPhi * sinTheta;

      vertexPositionData.push(radius * x);
      vertexPositionData.push(radius * y);
      vertexPositionData.push(radius * z);

      normalData.push(x);
      normalData.push(y);
      normalData.push(z);
    }
  }

  // Calculate sphere indices.
  for (let latNumber = 0; latNumber < latitudeBands; ++latNumber) {
    for (let longNumber = 0; longNumber < longitudeBands; ++longNumber) {
      let first = latNumber * (longitudeBands + 1) + longNumber;
      let second = first + longitudeBands + 1;

      indexData.push(first);
      indexData.push(second);
      indexData.push(first + 1);

      indexData.push(second);
      indexData.push(second + 1);
      indexData.push(first + 1);
    }
  }

  // vertexPositionData =vertices ;
  // normalData =normals;
  // indexData =indices;

  return indexData.length;
}
