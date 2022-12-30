import { mat4 } from "gl-matrix";

const vertexstring = `
  attribute vec4 a_position;
  uniform mat4 u_formMatrix;
  attribute vec4 a_Normal;
  uniform vec3 u_PointLightPosition;
  uniform vec3 u_DiffuseLight;
  uniform vec3 u_AmbientLight;
  varying vec4 v_Color;
  uniform mat4 u_NormalMatrix;
  void main(void){
    gl_Position = u_formMatrix * a_position;
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
    vec3 lightDirection = normalize(vec3(gl_Position.xyz) - u_PointLightPosition);
    float nDotL =  max(dot(lightDirection, normal), 0.0);
    vec3 diffuse = u_DiffuseLight * vec3(1.0,0,1.0)* nDotL;
    vec3 ambient = u_AmbientLight * vec3(1.0,0,1.0);
    v_Color = vec4(diffuse + ambient, 1);
  }
`;

const fragmentstring = `
  precision mediump float;
  varying vec4 v_Color;
  void main(void){
    gl_FragColor =v_Color;
  }
`;

let uniformAnim: WebGLUniformLocation | null = null;
let count = 0;
let webgl: WebGLRenderingContext & { program: WebGLProgram };
let webglDiv: HTMLCanvasElement;
let angle = 45;

const webglStart = () => {
  init();
  tick();
};
const tick = () => {
  requestAnimationFrame(tick);
  initBuffer();
  draw();
};
const init = () => {
  initWebgl();
  initShader();
  initBuffer();
};

const initWebgl = () => {
  webglDiv = document.querySelector<HTMLCanvasElement>("#myCanvas")!;
  // @ts-ignore
  webgl = webglDiv.getContext("webgl")!;
  webgl.viewport(0, 0, webglDiv.clientWidth, webglDiv.clientHeight);
};

const initShader = () => {
  let vsshader = webgl.createShader(webgl.VERTEX_SHADER)!;
  let fsshader = webgl.createShader(webgl.FRAGMENT_SHADER)!;

  webgl.shaderSource(vsshader, vertexstring);
  webgl.shaderSource(fsshader, fragmentstring);

  webgl.compileShader(vsshader);
  webgl.compileShader(fsshader);
  if (!webgl.getShaderParameter(vsshader, webgl.COMPILE_STATUS)) {
    var err = webgl.getShaderInfoLog(vsshader);
    alert(err);
    return;
  }
  if (!webgl.getShaderParameter(fsshader, webgl.COMPILE_STATUS)) {
    var err = webgl.getShaderInfoLog(fsshader);
    alert(err);
    return;
  }
  let program = webgl.createProgram()!;
  webgl.attachShader(program, vsshader);
  webgl.attachShader(program, fsshader);

  webgl.linkProgram(program);
  webgl.useProgram(program);

  webgl.program = program;
};

const initBuffer = () => {
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  // prettier-ignore
  let arr = [
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, // v0-v1-v2-v3 
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, // v0-v3-v4-v5 
    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, // v0-v5-v6-v1 
    -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v1-v6-v7-v2 
    -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v7-v4-v3-v2 
    1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0 // v4-v7-v6-v5 
  ]

  // prettier-ignore
  let normals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
]);

  // prettier-ignore
  let index = [
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // right
    8, 9, 10, 8, 10, 11,    // up
    12, 13, 14, 12, 14, 15,    // left
    16, 17, 18, 16, 18, 19,    // down
    20, 21, 22, 20, 22, 23     // back
];

  let pointPosition = new Float32Array(arr);
  let aPsotion = webgl.getAttribLocation(webgl.program, "a_position");
  let triangleBuffer = webgl.createBuffer();
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aPsotion);
  webgl.vertexAttribPointer(aPsotion, 4, webgl.FLOAT, false, 4 * 4, 0);

  let aNormal = webgl.getAttribLocation(webgl.program, "a_Normal");
  let normalsBuffer = webgl.createBuffer();
  let normalsArr = new Float32Array(normals);
  webgl.bindBuffer(webgl.ARRAY_BUFFER, normalsBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, normalsArr, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aNormal);
  webgl.vertexAttribPointer(aNormal, 3, webgl.FLOAT, false, 3 * 4, 0);

  let u_DiffuseLight = webgl.getUniformLocation(
    webgl.program,
    "u_DiffuseLight"
  );
  webgl.uniform3f(u_DiffuseLight, 1.0, 1.0, 1.0);
  let u_LightDirection = webgl.getUniformLocation(
    webgl.program,
    "u_PointLightPosition"
  );
  webgl.uniform3fv(u_LightDirection, [10, 0, 0]);
  let u_AmbientLight = webgl.getUniformLocation(
    webgl.program,
    "u_AmbientLight"
  );
  webgl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  let indexBuffer = webgl.createBuffer();
  let indices = new Uint8Array(index);
  webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, indices, webgl.STATIC_DRAW);

  let ProjMatrix = mat4.create();
  mat4.identity(ProjMatrix);
  //角度小，看到的物体大，角度大，看到的物体小。
  mat4.perspective(
    ProjMatrix,
    (angle * Math.PI) / 180,
    webglDiv.clientWidth / webglDiv.clientHeight,
    1,
    1000
  ); //修改可视域范围

  let uniformMatrix1 = webgl.getUniformLocation(webgl.program, "u_formMatrix");

  let ModelMatrix = mat4.create();
  mat4.identity(ModelMatrix);
  mat4.translate(ModelMatrix, ModelMatrix, [1, 0, 0]);

  let uniformNormalMatrix = webgl.getUniformLocation(
    webgl.program,
    "u_NormalMatrix"
  );
  let normalMatrix = mat4.create();
  mat4.identity(normalMatrix);
  mat4.invert(normalMatrix, ModelMatrix);
  mat4.transpose(normalMatrix, ModelMatrix);
  webgl.uniformMatrix4fv(uniformNormalMatrix, false, normalMatrix);

  let ViewMatrix = mat4.create();
  mat4.identity(ViewMatrix);
  mat4.lookAt(ViewMatrix, [5, 5, 5], [0, 0, 0], [0, 1, 0]);

  let mvMatrix = mat4.create();
  mat4.identity(mvMatrix);
  mat4.multiply(mvMatrix, ViewMatrix, ModelMatrix);

  let mvpMatrix = mat4.create();
  mat4.identity(mvpMatrix);
  mat4.multiply(mvpMatrix, ProjMatrix, mvMatrix);
  webgl.uniformMatrix4fv(uniformMatrix1, false, mvpMatrix);
};

function draw() {
  webgl.clearColor(0, 0, 0, 1);
  webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
  webgl.enable(webgl.DEPTH_TEST);

  webgl.drawElements(webgl.TRIANGLES, 36, webgl.UNSIGNED_BYTE, 0);
}

export { webglStart };
