import { mat4 } from "gl-matrix";

const vertexstring = `
  attribute vec4 a_position;
  uniform mat4 u_formMatrix;
  uniform mat4 proj;
  attribute vec4 a_color;
  varying vec4 color;
  void main(void){
      gl_Position =  u_formMatrix * a_position;
      color = a_color;
  }
`;
const fragmentstring = `
  precision mediump float;
  varying vec4 color;
  void main(void){
    gl_FragColor =color;
  }
`;

const projMat4 = mat4.create();

let uniformAnim: WebGLUniformLocation | null = null;
let count = 0;
let webgl: WebGLRenderingContext & { program: WebGLProgram };
let webglDiv: HTMLCanvasElement;
let angle = 160;
let near = 0;
let far = 50;

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
  mat4.ortho(
    // @ts-ignore
    [],
    webglDiv.clientWidth,
    webglDiv.clientHeight,
    0,
    -1.0,
    1.0,
    projMat4
  );
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

  let ModelMatrix = mat4.create();
  mat4.identity(ModelMatrix);
  mat4.translate(ModelMatrix, ModelMatrix, [180, 0, 0]);

  let ViewMatrix = mat4.create();
  mat4.identity(ViewMatrix);
  mat4.lookAt(ViewMatrix, [0, 0, 300], [0, 0, -90], [0, 1, 0]);
  let mvMatrix = mat4.create();
  mat4.multiply(mvMatrix, ViewMatrix, ModelMatrix);

  let mvpMatrix = mat4.create();
  mat4.identity(mvpMatrix);
  mat4.multiply(mvpMatrix, ProjMatrix, mvMatrix);

  // prettier-ignore
  let arr = [
    0.0, 100, -80, 1,      1, 0,  0, 1,
    -50, -100, -80, 1,     1, 0,  0, 1, // 红色
    50, -100, -80, 1,      1, 0,  0, 1,

    0, 100, -60, 1,       1.0, 1.0,  0.4, 1,
    -50, -100, -60, 1,      1.0, 1.0,  0.4, 1,
    50, -100,-60, 1,      1.0, 1.0,  0.4, 1,// 黄色

    0.0, 100, -35.0, 1,      0.4,  0.4, 1.0, 1,
    -50, -100, -35.0, 1,     0.4,  0.4, 1.0, 1,
    50, -100, -35.0, 1,      0.4, 0.4, 1.0, 1, // 蓝色

  ];

  let pointPosition = new Float32Array(arr);
  let aPsotion = webgl.getAttribLocation(webgl.program, "a_position");
  let triangleBuffer = webgl.createBuffer();
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aPsotion);
  webgl.vertexAttribPointer(aPsotion, 4, webgl.FLOAT, false, 8 * 4, 0);
  let aColor = webgl.getAttribLocation(webgl.program, "a_color");
  webgl.enableVertexAttribArray(aColor);
  webgl.vertexAttribPointer(aColor, 4, webgl.FLOAT, false, 8 * 4, 4 * 4);

  let uniformMatrix1 = webgl.getUniformLocation(webgl.program, "u_formMatrix");
  webgl.uniformMatrix4fv(uniformMatrix1, false, mvpMatrix);

  webgl.clearColor(0.0, 1.0, 0.0, 1.0);
  webgl.clear(webgl.COLOR_BUFFER_BIT);
  webgl.drawArrays(webgl.TRIANGLES, 0, 9);

  mat4.identity(ModelMatrix);
  mat4.translate(ModelMatrix, ModelMatrix, [-180, 0, 0]);

  mat4.identity(ViewMatrix);
  mat4.lookAt(ViewMatrix, [0, 0, 300], [0, 0, -90], [0, 1, 0]);
  mat4.multiply(mvMatrix, ViewMatrix, ModelMatrix);

  mat4.identity(mvpMatrix);
  mat4.multiply(mvpMatrix, ProjMatrix, mvMatrix);

  webgl.uniformMatrix4fv(uniformMatrix1, false, mvpMatrix);

  webgl.drawArrays(webgl.TRIANGLES, 0, 9);
};

function draw() {
  // webgl.clearColor(0.0, 1.0, 0.0, 1.0);
  // webgl.clear(webgl.COLOR_BUFFER_BIT);
  // webgl.drawArrays(webgl.TRIANGLES, 0, 9);
}

export { webglStart };
