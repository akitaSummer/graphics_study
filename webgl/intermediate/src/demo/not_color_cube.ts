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
    gl_FragColor =vec4(0.0,1.0,1.0,1.0);
  }
`;

let uniformAnim: WebGLUniformLocation | null = null;
let count = 0;
let webgl: WebGLRenderingContext & { program: WebGLProgram };
let webglDiv: HTMLCanvasElement;
let angle = 60;

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


    1, 1, 1, 1,  -1, 1, 1, 1,  -1, -1, 1, 1,  1, 1, 1, 1,  -1, -1, 1, 1,  1, -1, 1, 1,   //前面

    1, 1, -1, 1,  1, 1, 1, 1,  1, -1, 1, 1,  1, 1, -1, 1,  1, -1, 1, 1,  1, -1, -1, 1,  //右

    -1, 1, -1, 1,  1, 1, -1, 1,  1, -1, -1, 1,  -1, 1, -1, 1,  1, -1, -1, 1,  -1, -1, -1, 1, //后

    -1, 1, 1, 1,  -1, 1, -1, 1,  -1, -1, -1, 1,  -1, 1, 1, 1,  -1, -1, -1, 1,  -1, -1, 1, 1, //左

    -1, 1, -1, 1,  -1, 1, 1, 1,  1, 1, 1, 1,  -1, 1, -1, 1,  1, 1, 1, 1,  1, 1, -1, 1,  //上

    -1, -1, 1, 1,  -1, -1, -1, 1,  1, -1, -1, 1,  -1, -1, 1, 1,  1, -1, -1, 1,  1, -1, 1, 1,  //下
  ]
  let pointPosition = new Float32Array(arr);
  let aPsotion = webgl.getAttribLocation(webgl.program, "a_position");
  let triangleBuffer = webgl.createBuffer();
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aPsotion);
  webgl.vertexAttribPointer(aPsotion, 4, webgl.FLOAT, false, 4 * 4, 0);

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
  webgl.drawArrays(webgl.TRIANGLES, 0, 36);
}

export { webglStart };
