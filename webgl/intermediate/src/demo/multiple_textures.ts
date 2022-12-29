import { mat4 } from "gl-matrix";

const vertexstring = `
  attribute vec4 a_position;
  uniform   mat4    proj;
  attribute vec2 outUV;
  varying vec2 inUV;
  void main(void){
      gl_Position =  a_position;
      inUV = outUV;
  }
`;
const fragmentstring = `
  precision mediump float;
  uniform sampler2D texture;
  uniform sampler2D texture1;
  uniform float anim;
  varying vec2 inUV;
  void main(void){
    vec4 color1 =texture2D(texture,inUV);
    vec4 color2 =texture2D(texture1, vec2(inUV.x + anim, inUV.y));

    gl_FragColor = color1 + color2 ;
  }
`;

const projMat4 = mat4.create();

let uniformTexture: WebGLUniformLocation = 0;
let uniformTexture1: WebGLUniformLocation = 0;
let uniformAnim: WebGLUniformLocation = 0;
let count = 0;
let webgl: WebGLRenderingContext & { program: WebGLProgram };

let texture0: WebGLTexture & { image: HTMLImageElement };
let texture1: WebGLTexture & { image: HTMLImageElement };

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
    // 六个一组，前四个为点，后两个为纹理坐标
    // -0.5, -0.5, 0, 1,    0, 0, 
    // -0.5, 0.5, 0, 1,     0, -1, 
    // 0.5, 0.5, 0, 1,      1, -1, 
    // 0.5, -0.5, 0, 1,     1, 0,

    -0.5, -0.5, 0, 1,      0, 0,
    -0.5, 0.5, 0, 1,       0, 1,
    0.5, 0.5, 0, 1,        1, 1,
    0.5, -0.5, 0, 1,       1, 0,
  ];
  let index = [0, 1, 2, 2, 0, 3];
  let pointPosition = new Float32Array(arr);
  let aPsotion = webgl.getAttribLocation(webgl.program, "a_position");
  let triangleBuffer = webgl.createBuffer();
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aPsotion);
  webgl.vertexAttribPointer(aPsotion, 4, webgl.FLOAT, false, 6 * 4, 0);

  let uniformProj = webgl.getUniformLocation(webgl.program, "proj");
  webgl.uniformMatrix4fv(uniformProj, false, projMat4);

  let attribOutUV = webgl.getAttribLocation(webgl.program, "outUV");
  webgl.enableVertexAttribArray(attribOutUV);
  webgl.vertexAttribPointer(attribOutUV, 2, webgl.FLOAT, false, 6 * 4, 4 * 4);

  let indexarr = new Uint8Array(index); // 索引缓冲， 划分为三角形渲染
  let indexBuffer = webgl.createBuffer();
  webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, indexarr, webgl.STATIC_DRAW);

  uniformTexture = webgl.getUniformLocation(webgl.program, "texture")!;
  uniformTexture1 = webgl.getUniformLocation(webgl.program, "texture1")!;

  texture1 = initTexture("/asserts/fog.png");
  texture0 = initTexture("/asserts/山水图像纹理映射.png");
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
  webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.LINEAR);
  webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
  webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.REPEAT); // x
  webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.REPEAT); // y

  // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
  // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
};

const initTexture = (imageFile: string) => {
  // @ts-ignore
  let textureHandle: WebGLTexture & { image: HTMLImageElement } =
    webgl.createTexture()!;
  textureHandle.image = new Image();
  textureHandle.image.src = imageFile;
  textureHandle.image.onload = () => {
    handleLoadedTexture(textureHandle);
  };
  return textureHandle;
};

function draw() {
  webgl.clearColor(0.0, 1.0, 0.0, 1.0);
  webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
  webgl.enable(webgl.DEPTH_TEST);

  //纹理变动
  uniformAnim = webgl.getUniformLocation(webgl.program, "anim")!;
  count = count + 0.01;
  webgl.uniform1f(uniformAnim, count);
  webgl.activeTexture(webgl.TEXTURE0);
  webgl.bindTexture(webgl.TEXTURE_2D, texture0);
  webgl.uniform1i(uniformTexture, 0);

  webgl.activeTexture(webgl.TEXTURE1);
  webgl.bindTexture(webgl.TEXTURE_2D, texture1);
  webgl.uniform1i(uniformTexture1, 1);

  webgl.drawElements(webgl.TRIANGLES, 6, webgl.UNSIGNED_BYTE, 0);
}

// requestAnimFrame = (() => {
//   return (
//     window.requestAnimationFrame ||
//     window.webkitRequestAnimationFrame ||
//     window.mozRequestAnimationFrame ||
//     window.oRequestAnimationFrame ||
//     window.msRequestAnimationFrame ||
//     function (callback, element) {
//       window.setTimeout(callback, 1000 / 60);
//     }
//   );
// })();

export { webglStart };
