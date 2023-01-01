import { mat4 } from "gl-matrix";

const vertexstring = `
  attribute vec4 a_position;
  uniform mat4 u_formMatrix;
  attribute vec4 a_Normal;
  uniform vec3 u_PointLightPosition;
  uniform vec3 u_DiffuseLight;
  uniform vec3 u_AmbientLight;
  varying vec4 v_Color;
  void main(void){
    gl_Position = u_formMatrix * a_position;
    vec3 normal = normalize(a_Normal.xyz);
    vec3 lightDirection = normalize(u_PointLightPosition - vec3(gl_Position.xyz));
    float nDotL = max(dot(lightDirection, normal), 0.0);
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

let webgl: WebGLRenderingContext & { program: WebGLProgram };
let webglDiv: HTMLCanvasElement;
let angle = 45;
let g_joint1Angle = 0.0;
let ANGLE_STEP = 3.0;
let g_arm1Angle = -90.0;
let indices: Uint8Array;

let uniformTexture: WebGLUniformLocation | null = 0;
let texture: WebGLTexture & { image: HTMLImageElement };

const webglStart = () => {
  init();
  tick();
};
const tick = () => {
  requestAnimationFrame(tick);
  clearn();
  draw();
};
const init = () => {
  initWebgl();
  initShader();
  initBuffer();
  initEvent();
  clearn();
  initLight();
  draw();
};

const initEvent = () => {
  document.onkeydown = (ev) => {
    switch (ev.keyCode) {
      case 38:
        if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
        break;
      case 40:
        if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
        break;
      case 39:
        g_arm1Angle += ANGLE_STEP;
        break;
      case 37:
        g_arm1Angle -= ANGLE_STEP;
        break;
      default:
        return;
    }
    clearn();
    draw();
  };
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

const initLight = () => {
  let u_DiffuseLight = webgl.getUniformLocation(
    webgl.program,
    "u_DiffuseLight"
  );
  webgl.uniform3f(u_DiffuseLight, 1.0, 1.0, 1.0);
  let u_LightDirection = webgl.getUniformLocation(
    webgl.program,
    "u_PointLightPosition"
  );
  webgl.uniform3fv(u_LightDirection, [3.0, 3.0, 4.0]);
  let u_AmbientLight = webgl.getUniformLocation(
    webgl.program,
    "u_AmbientLight"
  );
  webgl.uniform3f(u_AmbientLight, 0.8, 0.8, 0.8);
};

const initBuffer = () => {
  // prettier-ignore
  let vertices = new Float32Array([
      1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5, 0.0, 1.5, 1.5, 0.0, 1.5, // v0-v1-v2-v3 front
      1.5, 10.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5, 1.5, 10.0, -1.5, // v0-v3-v4-v5 right
      1.5, 10.0, 1.5, 1.5, 10.0, -1.5, -1.5, 10.0, -1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
      -1.5, 10.0, 1.5, -1.5, 10.0, -1.5, -1.5, 0.0, -1.5, -1.5, 0.0, 1.5, // v1-v6-v7-v2 left
      -1.5, 0.0, -1.5, 1.5, 0.0, -1.5, 1.5, 0.0, 1.5, -1.5, 0.0, 1.5, // v7-v4-v3-v2 down
      1.5, 0.0, -1.5, -1.5, 0.0, -1.5, -1.5, 10.0, -1.5, 1.5, 10.0, -1.5  // v4-v7-v6-v5 back
  ]);

  // prettier-ignore
  let normals = new Float32Array([
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
      1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
      0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
      -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
      0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
      0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0  // v4-v7-v6-v5 back
  ]);

  // prettier-ignore
  indices = new Uint8Array([
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // right
    8, 9, 10, 8, 10, 11,    // up
    12, 13, 14, 12, 14, 15,    // left
    16, 17, 18, 16, 18, 19,    // down
    20, 21, 22, 20, 22, 23     // back
]);

  let pointPosition = new Float32Array(vertices);
  let aPsotion = webgl.getAttribLocation(webgl.program, "a_position");
  let triangleBuffer = webgl.createBuffer();
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aPsotion);
  webgl.vertexAttribPointer(aPsotion, 3, webgl.FLOAT, false, 0, 0);

  let aNormal = webgl.getAttribLocation(webgl.program, "a_Normal");
  let normalsBuffer = webgl.createBuffer();
  let normalsArr = new Float32Array(normals);
  webgl.bindBuffer(webgl.ARRAY_BUFFER, normalsBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, normalsArr, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aNormal);
  webgl.vertexAttribPointer(aNormal, 3, webgl.FLOAT, false, 0, 0);

  let indexBuffer = webgl.createBuffer();
  let indices1 = new Uint8Array(indices);
  webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, indices1, webgl.STATIC_DRAW);
};

const clearn = () => {
  webgl.clearColor(0, 0, 0, 1);
  webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
  webgl.enable(webgl.DEPTH_TEST);
};

const initTransformation = (
  angele: number,
  rotateArr: Float32Array,
  ModelMatrix = mat4.create()
) => {
  let ProjMatrix = mat4.create();
  mat4.identity(ProjMatrix);
  mat4.perspective(
    ProjMatrix,
    (angle * Math.PI) / 180,
    webglDiv.clientWidth / webglDiv.clientHeight,
    1,
    1000
  ); //修改可视域范围

  let uniformMatrix1 = webgl.getUniformLocation(webgl.program, "u_formMatrix");

  mat4.rotate(ModelMatrix, ModelMatrix, degreesToRads(angele), rotateArr);
  let ViewMatrix = mat4.create();
  mat4.identity(ViewMatrix);
  mat4.lookAt(ViewMatrix, [50, 50, 50], [0, 0, 0], [0, 1, 0]);

  let mvMatrix = mat4.create();
  mat4.identity(mvMatrix);
  mat4.multiply(mvMatrix, ViewMatrix, ModelMatrix);

  let mvpMatrix = mat4.create();
  mat4.identity(mvpMatrix);
  mat4.multiply(mvpMatrix, ProjMatrix, mvMatrix);
  webgl.uniformMatrix4fv(uniformMatrix1, false, mvpMatrix);
  return ModelMatrix;
};

const degreesToRads = (deg: number) => (deg * Math.PI) / 180.0;

function draw() {
  let modelArr = initTransformation(g_joint1Angle, new Float32Array([0, 1, 0]));
  // webgl.drawElements(webgl.TRIANGLES, indices.length, webgl.UNSIGNED_BYTE, 0);

  mat4.translate(modelArr, modelArr, [0, 0, 0]);
  let mvpArr = initTransformation(
    g_arm1Angle,
    new Float32Array([0, 1, 0]),
    modelArr
  );
  webgl.drawElements(webgl.TRIANGLES, indices.length, webgl.UNSIGNED_BYTE, 0);
}

export { webglStart };
