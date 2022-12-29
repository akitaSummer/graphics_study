import { mat4 } from "gl-matrix";

const vertexstring = `
  attribute vec4 a_position;
  uniform mat4 u_formMatrix;
  attribute vec4 a_color;
  varying vec4 color;
  attribute vec2 a_outUV;
  varying vec2 v_inUV;
  void main(void){
      gl_Position = u_formMatrix * a_position;
      color = a_color;
      v_inUV = a_outUV;
  }
`;
const fragmentstring = `
  precision mediump float;
  varying vec4 color;
  uniform sampler2D texture;
  varying vec2 v_inUV;
  void main(void){
    gl_FragColor =texture2D(texture, v_inUV);
  }
`;

let webgl: WebGLRenderingContext & { program: WebGLProgram };
let webglDiv: HTMLCanvasElement;
let angle = 45;

let moveState: boolean;
let mouseDownX = 0;
let mouseDownY = 0;
let offsetX = 0;
let offsetY = 0;
let beforeOffsetX = 0;
let beforeOffsetY = 0;
let wheelMove = 0;

let uniformTexture: WebGLUniformLocation | null = 0;
let texture: WebGLTexture & { image: HTMLImageElement };

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
  initEvent();
};

const initEvent = () => {
  document.onmousedown = (e) => {
    moveState = true;

    mouseDownX = e.clientX;
    mouseDownY = e.clientY;
  };
  document.onmousemove = (e) => {
    if (!moveState) {
      return;
    } else {
      offsetX = e.clientX - mouseDownX;
      offsetY = e.clientY - mouseDownY;
    }
    initBuffer();
  };
  document.onmouseup = (e) => {
    moveState = false;
    beforeOffsetX = offsetX + beforeOffsetX;
    beforeOffsetY = offsetY + beforeOffsetY;
  };
  // @ts-ignore
  document.onmousewheel = (e) => {
    wheelMove += e.wheelDelta / 100;
    initBuffer();
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

    1, 1, 1, 1, 1, 1,    -1, 1,1, 1, 0, 1,    - 1,-1, 1, 1, 0, 0,     1,1,1, 1, 1, 1,     - 1,- 1,1, 1, 0, 0,    1,- 1, 1, 1, 1, 0,   //前面

    1, 1, -1, 1,1, 1,     1, 1, 1, 1,0, 1,     1, -1, 1, 1, 0, 0,     1, 1, -1, 1,1,1,    1, -1, 1, 1,0,0,       1, -1, -1, 1,1,0,  //右

    -1, 1, -1, 1,1,1,     1, 1, -1, 1,0,1,     1, -1, -1, 1,0,0,      -1, 1, -1, 1,1,1,   1, -1, -1, 1,0,0,     -1, -1, -1, 1,1,0, //后


    -1, 1, 1, 1,1,1,      -1, 1, -1, 1,1,0,    -1, -1, -1, 1,0,0,     -1, 1, 1, 1,1,1,    -1, -1, -1, 1,0,0,     -1, -1, 1, 1,1,0, //左

    -1, 1, -1, 1, 0,1,    -1, 1, 1, 1, 0,0,    1, 1, 1, 1,1,0,        -1, 1, -1, 1,0,1,    1, 1, 1, 1,1,0,        1, 1, -1, 1,1,1,  //上

    -1, -1, 1, 1,0,1,     -1, -1, -1, 1,0,0,    1, -1, -1, 1,1,0,     -1, -1, 1, 1,0,1,    1, -1, -1, 1,1,0,      1, -1, 1, 1,1,1,  //下

  ]

  let pointPosition = new Float32Array(arr);
  let aPsotion = webgl.getAttribLocation(webgl.program, "a_position");
  let triangleBuffer = webgl.createBuffer();
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aPsotion);
  webgl.vertexAttribPointer(aPsotion, 4, webgl.FLOAT, false, 6 * 4, 0);

  let attribOutUV = webgl.getAttribLocation(webgl.program, "a_outUV");
  webgl.enableVertexAttribArray(attribOutUV);
  webgl.vertexAttribPointer(attribOutUV, 2, webgl.FLOAT, false, 6 * 4, 4 * 4);
  //矩阵变换
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

  let ModelMatrixx = mat4.create();
  mat4.identity(ModelMatrixx);
  mat4.rotate(
    ModelMatrixx,
    ModelMatrixx,
    ((offsetX + beforeOffsetX) * Math.PI) / 180,
    [0, 1, 0]
  );

  let ModelMatrixy = mat4.create();
  mat4.identity(ModelMatrixy);
  mat4.rotate(
    ModelMatrixy,
    ModelMatrixy,
    ((offsetY + beforeOffsetY) * Math.PI) / 180,
    [1, 0, 0]
  );

  let ModelMatrixxy = mat4.create();
  mat4.identity(ModelMatrixxy);
  mat4.multiply(ModelMatrixxy, ModelMatrixx, ModelMatrixy);

  let ModelMatrixWheel = mat4.create();
  mat4.identity(ModelMatrixWheel);
  console.log(wheelMove);
  mat4.translate(ModelMatrixWheel, ModelMatrixWheel, [0, 0, wheelMove]);
  mat4.multiply(ModelMatrixWheel, ModelMatrixWheel, ModelMatrixxy);

  let ViewMatrix = mat4.create();
  mat4.identity(ViewMatrix);
  mat4.lookAt(ViewMatrix, [0, 0, 10], [0, 0, 0], [0, 1, 0]);

  let mvMatrix = mat4.create();
  mat4.identity(mvMatrix);
  mat4.multiply(mvMatrix, ViewMatrix, ModelMatrixxy);

  let mvpMatrix = mat4.create();
  mat4.identity(mvpMatrix);
  mat4.multiply(mvpMatrix, ProjMatrix, mvMatrix);
  webgl.uniformMatrix4fv(uniformMatrix1, false, mvpMatrix);

  //纹理绘制
  uniformTexture = webgl.getUniformLocation(webgl.program, "texture");
  if (!texture) {
    texture = initTexture("/asserts/container2_specular.png");
  }
};

const handleLoadedTexture = (
  texture: WebGLTexture & { image: HTMLImageElement }
) => {
  webgl.bindTexture(webgl.TEXTURE_2D, texture);
  webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, 666);

  webgl.texImage2D(
    webgl.TEXTURE_2D,
    0,
    webgl.RGBA,
    webgl.RGBA,
    webgl.UNSIGNED_BYTE,
    texture.image
  );
  webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.LINEAR); // 纹理放大方式
  webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR); // 纹理缩小方式
  webgl.texParameteri(
    webgl.TEXTURE_2D,
    webgl.TEXTURE_WRAP_S,
    webgl.CLAMP_TO_EDGE
  ); // 纹理水平填充方式
  webgl.texParameteri(
    webgl.TEXTURE_2D,
    webgl.TEXTURE_WRAP_T,
    webgl.CLAMP_TO_EDGE
  ); // 纹理垂直填充方式

  // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.REPEAT); // x
  // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.REPEAT); // y
};

const initTexture = (imageFile: string) => {
  // @ts-ignore
  let textureHandle: WebGLTexture & { image: HTMLImageElement } =
    webgl.createTexture()!;
  textureHandle.image = new Image();
  textureHandle.image.src = imageFile;
  textureHandle.image.onload = function () {
    handleLoadedTexture(textureHandle);
  };
  return textureHandle;
};

function draw() {
  webgl.clearColor(0, 0, 0, 1);
  webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
  webgl.enable(webgl.DEPTH_TEST);
  webgl.activeTexture(webgl.TEXTURE0);
  webgl.bindTexture(webgl.TEXTURE_2D, texture);
  webgl.uniform1i(uniformTexture, 0);
  webgl.drawArrays(webgl.TRIANGLES, 0, 36);
}

export { webglStart };
