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
  inittext(near, far);
  document.onkeydown = (event) => {
    if (String.fromCharCode(event.keyCode) == "W") {
      near += 1;
    } else if (String.fromCharCode(event.keyCode) == "S") {
      near -= 1;
    } else if (String.fromCharCode(event.keyCode) == "A") {
      far -= 1;
    } else if (String.fromCharCode(event.keyCode) == "D") {
      far += 1;
    }

    inittext(near, far);
    initBuffer();
    draw();
  };
};

const inittext = (near: number, far: number) => {
  const text = document.getElementById("text");
  if (text) {
    text.innerHTML = "near:" + near + "<br/>" + "far:" + far;
  }
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
  let ProjMatrix = mat4.create();
  mat4.identity(ProjMatrix);
  mat4.ortho(ProjMatrix, -100, 100, -100, 100, near, far); //修改可视域范围

  // prettier-ignore
  let arr = [
    0.0, 70, -40, 1,      1, 0,  0, 1,
    -50, -30, -40, 1,     1, 0,  0, 1, // 绿色
    50, -30, -40, 1,      1, 0,  0, 1,

    50, 40, -20, 1, 1.0, 1.0,  0.4, 1,
    -50, 40, -20, 1, 1.0, 1.0,  0.4, 1,
    0.0, -60,-20, 1, 1.0, 1.0,  0.4, 1,// 黄色

    0.0, 50, 0.0, 1,  0.4,  0.4, 1.0, 1,
    -50, -50, 0.0, 1,  0.4,  0.4, 1.0, 1,
    50, -50, 0.0, 1,  0.4,  0.4, 1.0, 1, // 蓝色

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
  webgl.uniformMatrix4fv(uniformMatrix1, false, ProjMatrix);
};

function draw() {
  webgl.clearColor(0.0, 1.0, 0.0, 1.0);
  webgl.clear(webgl.COLOR_BUFFER_BIT);
  webgl.drawArrays(webgl.TRIANGLES, 0, 9);
}

export { webglStart };
