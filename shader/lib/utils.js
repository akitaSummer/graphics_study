/**
 *
 * @param {*} gl
 * @param {*} vshader
 * @param {*} fshader
 */
function getShaderAndWebGLVersion(gl) {
  console.log(
    `${gl.getParameter(gl.VERSION)}与${gl.getParameter(
      gl.SHADING_LANGUAGE_VERSION
    )}`
  );
  return;
}

/**
 * 初始化shader
 * @param gl
 * @param vshader
 * @param fshader
 * @return true
 */
function initShaders(gl, vshader, fshader) {
  var program = createProgram(gl, vshader, fshader);
  if (!program) {
    console.log("创建项目失败！");
    reject(false);
  }

  gl.useProgram(program);
  gl.program = program;
}

/**
 *
 * @param {*} filename
 * @param {*} onLoadShader
 */
function loadShaderFromFile(filename) {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
        resolve(request.responseText);
      }
    };
    request.open("GET", filename, true);
    request.send();
  });
}
/**
 *
 * @param {*} gl  webgl
 * @param {*} startPosition  开始点的坐标
 * @param {*} rectangle  长宽的范围
 * @returns
 */
function readPixelReturnFloat(gl, startPosition, rectangle) {
  //像素容器
  let pixel = new Uint8Array(rectangle[0] * rectangle[1] * 4);
  //抓取像素
  gl.readPixels(
    startPosition[0],
    startPosition[1],
    rectangle[0],
    rectangle[1],
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixel
  );
  let resarr = Array.prototype.slice.call(pixel);

  resarr = resarr.map((x) => Number(Number(x / 255.0).toFixed(2)));
  return resarr;
}

/**
 *
 * @param {*} gl  webgl
 * @param {*} startPosition  开始点的坐标
 * @param {*} rectangle  长宽的范围
 * @returns
 */
function readPixelReturnInt(gl, startPosition, rectangle) {
  //像素容器
  let pixel = new Uint8Array(rectangle[0] * rectangle[1] * 4);
  //抓取像素
  gl.readPixels(
    startPosition[0],
    startPosition[1],
    rectangle[0],
    rectangle[1],
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixel
  );
  return pixel;
}

/**
 * 创建项目
 * @param gl
 * @param vshader
 * @param fshader
 * @return program
 */
function createProgram(gl, vshader, fshader) {
  var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  var program = gl.createProgram();
  if (!program) {
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    var error = gl.getProgramInfoLog(program);
    console.log("Failed to link program: " + error);
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  return program;
}

/**
 * 创建shader对象
 * @param gl
 * @param type
 * @param source
 * @return shaderobj
 */
function loadShader(gl, type, source) {
  var shader = gl.createShader(type);
  if (shader == null) {
    console.log("unable to create shader");
    return null;
  }

  gl.shaderSource(shader, source);

  gl.compileShader(shader);

  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    var error = gl.getShaderInfoLog(shader);
    console.log("Failed to compile shader: " + error);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * 初始化webgl
 * @param canvas
 * @param opt_debug
 * @return
 */
function getWebGLContext(canvas, opt_debug) {
  var gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) return null;
  if (arguments.length < 2 || opt_debug) {
    gl = WebGLDebugUtils.makeDebugContext(gl);
  }

  return gl;
}

function angleToRadian(angle) {
  return (angle / 180) * Math.PI;
}
/**
 * 世界坐标系转屏幕坐标系
 * @param {*} worldPosition  世界坐标
 * @param {*} MVPMatrix      MVP变换矩阵
 * @param {*} viewWH         视口宽高
 * @returns
 */
function worldToScreen(worldPosition, MVPMatrix, viewWH) {
  console.log(111);
  let screenPosition = glMatrix.vec4.create();
  worldPosition = glMatrix.mat4.multiply(
    screenPosition,
    MVPMatrix,
    worldPosition
  );
  // screenPosition[0]/=screenPosition[3];
  // screenPosition[1]/=screenPosition[3];
  // screenPosition[2]/=screenPosition[3];

  // screenPosition[0]=screenPosition[0]*0.5+0.5;
  // screenPosition[1]=screenPosition[1]*0.5+0.5;
  // screenPosition[2]=screenPosition[2]*0.5+0.5;

  for (let i = 0; i < screenPosition.length - 1; i++) {
    screenPosition[i] /= screenPosition[screenPosition.length - 1];
    screenPosition[i] = screenPosition[i] * 0.5 + 0.5;
  }
  screenPosition[0] = screenPosition[0] * viewWH[0];
  screenPosition[1] = viewWH[1] - screenPosition[1] * viewWH[1];
  screenPosition = screenPosition.slice(0, -1);
  return screenPosition;
}

function screenToWorld(screenPosition, InverseMVPMatrix, viewWH) {
  let worldPosition = glMatrix.vec4.create();
  screenPosition[0] = screenPosition[0] / viewWH[0];
  screenPosition[1] = (viewWH[1] - screenPosition[1]) / viewWH[1];
  screenPosition[2] = screenPosition[2];
  console.log(screenPosition.length);
  for (let i = 0; i < screenPosition.length; i++) {
    screenPosition[i] = screenPosition[i] * 2 - 1;
  }
  worldPosition = glMatrix.mat4.multiply(
    worldPosition,
    InverseMVPMatrix,
    screenPosition
  );
  worldPosition[0] /= worldPosition[3];
  worldPosition[1] /= worldPosition[3];
  worldPosition[2] /= worldPosition[3];
  worldPosition = worldPosition.slice(0, -1);

  return worldPosition;
}

/**
 *
 * @param {屏幕坐标系} screen
 * @param {转职矩阵} inverseMVPMatrix
 * @param {画布宽高} viewWH
 * @returns
 */
function getModelSelectPosition(screen, inverseMVPMatrix, viewWH) {
  var minWorld = glMatrix.vec4.create();
  var maxWorld = glMatrix.vec4.create();
  var screen1 = screen.slice(0);
  screen1[2] = screen1[2] + 1;
  minWorld = screenToWorld(screen, inverseMVPMatrix, viewWH);
  maxWorld = screenToWorld(screen1, inverseMVPMatrix, viewWH);
  var dir = glMatrix.vec3.create();
  glMatrix.vec3.subtract(dir, maxWorld, minWorld);
  glMatrix.vec3.normalize(dir, dir);
  var tm = Math.abs(minWorld[1] / dir[1]);
  var target = new Float32Array(3);
  target[0] = minWorld[0] + tm * dir[0];
  target[1] = minWorld[1] + tm * dir[1];
  target[2] = minWorld[2] + tm * dir[2];
  return target;
}

/**
 *
 * @param {*} 图片地址
 * @returns
 */
function initTexture(gl, imageFile, textureName) {
  var texture;
  texture = gl.createTexture();
  uniformTexture = gl.getUniformLocation(gl.program, textureName);
  texture.image = new Image();
  texture.image.src = imageFile;
  texture.image.onload = function () {
    handleLoadedTexture(texture);
  };
  return texture;
}
/**
 *
 * @param {*} 纹理
 */
function handleLoadedTexture(texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    texture.image
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.bindTexture(gl.TEXTURE_2D, null);
}
