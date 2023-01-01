import { mat4 } from "gl-matrix";

const vertexstring = `
    attribute vec4 a_position;
    uniform mat4 u_formMatrix;
    attribute vec4 a_Normal;
    varying vec4 v_Normal;
    varying vec4 v_position;
    void main(void){
        gl_Position = u_formMatrix * a_position;
        v_position = gl_Position;
        v_Normal= a_Normal;
    }
`;
const fragmentstring = `
    precision mediump float;

    varying vec4 v_Normal;
    varying vec4 v_position;
    uniform vec3 u_PointLightPosition;
    uniform vec3 u_DiffuseLight;
    uniform vec3 u_AmbientLight;
    void main(void){
    vec3 normal = normalize(v_Normal.xyz);
    vec3 lightDirection = normalize(u_PointLightPosition - vec3(v_position.xyz));
    float nDotL = max(dot(lightDirection, normal), 0.0);
    vec3 diffuse = u_DiffuseLight * vec3(1.0,0,1.0)* nDotL;
    vec3 ambient = u_AmbientLight * vec3(1.0,0,1.0);

    gl_FragColor =vec4(diffuse + ambient, 1);
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
let positions: number[] = [];
let indices: number[] = [];

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
  let SPHERE_DIV = 13;

  // Generate coordinates
  for (let j = 0; j <= SPHERE_DIV; j++) {
    let aj = (j * Math.PI) / SPHERE_DIV;
    let sj = Math.sin(aj);
    let cj = Math.cos(aj);
    for (let i = 0; i <= SPHERE_DIV; i++) {
      let ai = (i * 2 * Math.PI) / SPHERE_DIV;
      let si = Math.sin(ai);
      let ci = Math.cos(ai);

      positions.push(si * sj); // X
      positions.push(cj); // Y
      positions.push(ci * sj); // Z
    }
  }
  console.log("positions", positions);
  // Generate indices
  for (let j = 0; j < SPHERE_DIV; j++) {
    for (let i = 0; i < SPHERE_DIV; i++) {
      let p1 = j * (SPHERE_DIV + 1) + i;
      let p2 = p1 + (SPHERE_DIV + 1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }

  let pointPosition = new Float32Array(positions);
  let aPsotion = webgl.getAttribLocation(webgl.program, "a_position");
  let triangleBuffer = webgl.createBuffer();
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, pointPosition, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aPsotion);
  webgl.vertexAttribPointer(aPsotion, 3, webgl.FLOAT, false, 0, 0);

  let aNormal = webgl.getAttribLocation(webgl.program, "a_Normal");
  let normalsBuffer = webgl.createBuffer();
  let normalsArr = new Float32Array(positions);
  webgl.bindBuffer(webgl.ARRAY_BUFFER, normalsBuffer);
  webgl.bufferData(webgl.ARRAY_BUFFER, normalsArr, webgl.STATIC_DRAW);
  webgl.enableVertexAttribArray(aNormal);
  webgl.vertexAttribPointer(aNormal, 3, webgl.FLOAT, false, 0, 0);

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
  webgl.uniform3f(u_AmbientLight, 0.2, 0, 0.2);

  let indexBuffer = webgl.createBuffer();
  let indices1 = new Uint8Array(indices);
  webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, indices1, webgl.STATIC_DRAW);

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

  let ModelMatrix = mat4.create();
  mat4.identity(ModelMatrix);
  mat4.translate(ModelMatrix, ModelMatrix, [0, 0, 0]);

  let ViewMatrix = mat4.create();
  mat4.identity(ViewMatrix);
  mat4.lookAt(ViewMatrix, [3, 3, 7], [0, 0, 0], [0, 1, 0]);

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

  webgl.drawElements(webgl.TRIANGLES, indices.length, webgl.UNSIGNED_BYTE, 0);
}

export { webglStart };
