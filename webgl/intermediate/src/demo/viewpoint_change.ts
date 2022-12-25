import { mat4 } from "gl-matrix";

const vertexstring = `
  attribute vec4 a_position;
  uniform mat4 u_formMatrix;
  attribute vec4 a_color;
  varying vec4 color;
  void main(void){
      gl_Position = u_formMatrix * a_position;
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
  let arr = [
      0.0, 0.5, -0.4, 1, 0.4, 1.0, 0.4, 1,
      -0.5, -0.5, -0.4, 1, 0.4, 1.0, 0.4, 1,
      0.5, -0.5, -0.4, 1, 0.4, 1.0, 0.4, 1,

      0.5, 0.4, -0.2, 1, 1.0, 1.0, 0.4, 1,
      -0.5, 0.4, -0.2, 1, 1.0, 1.0, 0.4, 1,
      0.0, -0.6, -0.2, 1, 1.0, 1.0, 0.4, 1,

      0.0, 0.5, 0.0, 1, 0.4, 0.4, 1.0, 1,
      -0.5, -0.5, 0.0, 1, 0.4, 0.4, 1.0, 1,
      0.5, -0.5, 0.0, 1, 0.4, 0.4, 1.0, 1,

      // 0.0, 0.6, -0.4, 1,    0.4, 1.0, 1,1, // The back green one
      // -0.5, -0.4, -0.4,  1, 0.4, 1.0, 1,1,
      // 0.5, -0.4, -0.4, 1,  0.4, 1.0,1,1,

      // 0.5, 0.4, -0.2,  1, 1.0, 1.0, 0.4,1, // The middle yellow one
      // -0.5, 0.4, -0.2, 1,  1.0, 1.0, 0.4,1,
      // 0.0, -0.6, -0.2,1,   1.0, 1.0, 0.4,1,

      // 0.0, 0.5, 0.0,  1,   0.4, 0.4, 1.0,1, // The front blue one 
      // -0.5, -0.5, 0.0,1,  0.4, 0.4, 1.0,1,
      // 0.5, -0.5, 0.0, 1,  0.4, 0.4, 1.0,1,
  ]

  const pointPosition = new Float32Array(arr);
  const aPsotion = webgl.getAttribLocation(webgl.program, "a_position");
  const triangleBuffer = webgl.createBuffer();
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aPsotion);
  webgl.vertexAttribPointer(aPsotion, 4, webgl.FLOAT, false, 8 * 4, 0);
  let aColor = webgl.getAttribLocation(webgl.program, "a_color");
  webgl.enableVertexAttribArray(aColor);
  webgl.vertexAttribPointer(aColor, 4, webgl.FLOAT, false, 8 * 4, 4 * 4);

  let modelView = mat4.create();
  mat4.identity(modelView);
  modelView = mat4.lookAt(modelView, [0, 0, 0.2], [0, 0, 0], [0, 1, 0]);
  console.log(modelView);

  let uniformMatrix1 = webgl.getUniformLocation(webgl.program, "u_formMatrix");
  webgl.uniformMatrix4fv(uniformMatrix1, false, modelView);
};

function draw() {
  webgl.clearColor(0.0, 1.0, 0.0, 1.0);
  webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
  webgl.drawArrays(webgl.TRIANGLES, 0, 9);
}

export { webglStart };
