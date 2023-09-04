
#ifdef GL_ES
precision mediump float;
#endif

void main() {
  //矩阵定义
    mat4 mat44 = mat4(1., 2., 3., 4., 5., 6., 7., 8., 9., 10., 11., 12., 13., 14., 15., 16.);

  //矩阵取值
  //  float m1 = mat44[0][2];
  //  gl_FragColor =vec4(m1)/255.;
  //矩阵与浮点相乘
  //  mat44*=10.;    //mat44=mat44*10.;
  //  float m1 = mat44[0][2];
  //  gl_FragColor =vec4(m1)/255.;
  //矩阵与点（矢量）相乘
  // vec4 resmat =  mat44* vec4(0.,1.,1.,1.);
  // //   // 草稿演算一下
  //  float m1 = resmat[0];
  //   gl_FragColor =vec4(m1)/255.;
  //矩阵与矩阵相乘
    // mat4 mat441=mat4( 1.);

    // mat4 mat4res= mat44*mat441;
    // //第一列的第二行
    // gl_FragColor =vec4(mat4res[0][1])/255.;
}