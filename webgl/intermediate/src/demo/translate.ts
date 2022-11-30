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

const projMat4 = mat4.create();

let uniformAnim: WebGLUniformLocation = 0;
let count = 0;
let webgl: WebGLRenderingContext & { program: WebGLProgram };

const webglStart = () => {
  init();
  tick();
};
const tick = () => {
  requestAnimationFrame(tick);
  draw();
};
const init = () => {
  initWebgl();
  initShader();
  initBuffer();
};

const initWebgl = () => {
  let webglDiv = document.querySelector<HTMLCanvasElement>("#myCanvas")!;
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
  // prettier-ignore
  let matrixArr = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0.1, 0, 0, 1
  ];
  const arr = [
    0, 0, 0, 1, 0, 0.05, 0, 1, 0.5, 0, 0, 1,

    0.5, 0, 0, 1, 0, 0.05, 0, 1, 0.5, 0.05, 0, 1,
  ];
  const pointPosition = new Float32Array(arr);
  const aPsotion = webgl.getAttribLocation(webgl.program, "a_position");
  const triangleBuffer = webgl.createBuffer();
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aPsotion);
  webgl.vertexAttribPointer(aPsotion, 4, webgl.FLOAT, false, 4 * 4, 0);

  const matrixPosition = new Float32Array(matrixArr);
  const uniformMatrix = webgl.getUniformLocation(webgl.program, "u_formMatrix");
  webgl.uniformMatrix4fv(uniformMatrix, false, matrixPosition);
};

function draw() {
  webgl.clearColor(0.0, 1.0, 0.0, 1.0);
  webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
  webgl.enable(webgl.DEPTH_TEST);

  //纹理变动
  uniformAnim = webgl.getUniformLocation(webgl.program, "anim")!;
  count = count + 0.01;
  webgl.uniform1f(uniformAnim, count);

  webgl.drawArrays(webgl.TRIANGLES, 0, 6);
}

export { webglStart };
