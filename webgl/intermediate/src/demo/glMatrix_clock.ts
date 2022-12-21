import { mat4 } from "gl-matrix";

const vertexstring = `
  attribute vec4 a_position;
  uniform mat4 u_formMatrix;
  void main(void){
      gl_Position =u_formMatrix * a_position;
  }
`;
const fragmentstring = `
  precision mediump float;
  void main(void){
    gl_FragColor =vec4(1.0,1.0,0.0,1.0);
  }
`;

let uniformAnim: WebGLUniformLocation = 0;
let count = 0;
let webgl: WebGLRenderingContext & { program: WebGLProgram };

const webglStart = () => {
  init();
  tick();
};
const tick = () => {
  window.setTimeout(tick, 1000);

  initBuffer1();
  initBuffer2();
  initBuffer3();
  count = count + 1;
};
const init = () => {
  initWebgl();
  initShader();
};

const initWebgl = () => {
  let webglDiv = document.querySelector<HTMLCanvasElement>("#myCanvas")!;
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

const initBuffer1 = () => {
  let modelView = mat4.create();
  mat4.identity(modelView);
  mat4.scale(modelView, modelView, [1, 1, 1]);
  //一分钟 转0.5度
  // (Math.PI/180) (0.5/60)  *count
  let angle = ((-Math.PI / 1800) * count * 5) / 60;
  mat4.rotate(modelView, modelView, angle, [0, 0, 1]);

  // prettier-ignore
  let arr = [
      0, 0, 0, 1,
      0, 0.05, 0, 1,
      0.3, 0, 0, 1,

      0.3, 0, 0, 1,
      0, 0.05, 0, 1,
      0.3, 0.05, 0, 1

  ]
  let pointPosition = new Float32Array(arr);
  let aPsotion = webgl.getAttribLocation(webgl.program, "a_position");
  let triangleBuffer = webgl.createBuffer();
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aPsotion);
  webgl.vertexAttribPointer(aPsotion, 4, webgl.FLOAT, false, 4 * 4, 0);

  let uniformMatrix = webgl.getUniformLocation(webgl.program, "u_formMatrix");
  webgl.uniformMatrix4fv(uniformMatrix, false, modelView);

  webgl.clearColor(0.0, 1.0, 0.0, 1.0);
  webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
  webgl.enable(webgl.DEPTH_TEST);

  webgl.drawArrays(webgl.TRIANGLES, 0, 6);
};

const initBuffer2 = () => {
  let modelView1 = mat4.create();
  mat4.identity(modelView1);
  mat4.scale(modelView1, modelView1, [1, 1, 1]);
  let angle = (-Math.PI / 1800) * count;
  mat4.rotate(modelView1, modelView1, angle, [0, 0, 1]);
  // prettier-ignore
  let arr = [
  0, 0, 0, 1,
      0, 0.05, 0, 1,
      0.4, 0, 0, 1,

      0.4, 0, 0, 1,
      0, 0.05, 0, 1,
      0.4, 0.05, 0, 1

  ]
  let pointPosition = new Float32Array(arr);
  let aPsotion = webgl.getAttribLocation(webgl.program, "a_position");
  let triangleBuffer = webgl.createBuffer();
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aPsotion);
  webgl.vertexAttribPointer(aPsotion, 4, webgl.FLOAT, false, 4 * 4, 0);

  let uniformMatrix = webgl.getUniformLocation(webgl.program, "u_formMatrix");
  webgl.uniformMatrix4fv(uniformMatrix, false, modelView1);

  webgl.drawArrays(webgl.TRIANGLES, 0, 6);
};

const initBuffer3 = () => {
  let modelView1 = mat4.create();
  mat4.identity(modelView1);
  mat4.scale(modelView1, modelView1, [1, 1, 1]);
  let angle = (-Math.PI / 30) * count;

  mat4.rotate(modelView1, modelView1, angle, [0, 0, 1]);
  // prettier-ignore
  let arr = [
  0, 0, 0, 1,
      0, 0.05, 0, 1,
      0.8, 0, 0, 1,

      0.8, 0, 0, 1,
      0, 0.05, 0, 1,
      0.8, 0.05, 0, 1

  ]
  let pointPosition = new Float32Array(arr);
  let aPsotion = webgl.getAttribLocation(webgl.program, "a_position");
  let triangleBuffer = webgl.createBuffer();
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aPsotion);
  webgl.vertexAttribPointer(aPsotion, 4, webgl.FLOAT, false, 4 * 4, 0);

  let uniformMatrix = webgl.getUniformLocation(webgl.program, "u_formMatrix");
  webgl.uniformMatrix4fv(uniformMatrix, false, modelView1);

  webgl.drawArrays(webgl.TRIANGLES, 0, 6);
};

function draw() {
  //   webgl.clearColor(0.0, 1.0, 0.0, 1.0);
  //   webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
  //   webgl.enable(webgl.DEPTH_TEST);
  //   //纹理变动
  //   uniformAnim = webgl.getUniformLocation(webgl.program, "anim")!;
  //   count = count + 0.01;
  //   webgl.uniform1f(uniformAnim, count);
  //   webgl.drawArrays(webgl.TRIANGLES, 0, 6);
}

export { webglStart };
