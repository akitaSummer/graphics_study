#version 100 es
#ifdef GL_ES
precision mediump float;
#endif
//1.宏定义
//例如定义圆周率或一个特定的数
#define PI 3.14//圆周率
#define NUM 3//num
//如果程序中宏不在使用，可使用 #undef 指令解除宏定义,例如执行 #undef PI 可以解除圆周率的宏定义
// void main(){
//   gl_FragColor=vec4(NUM)/255.;
// }
// 2.#ifdef定义
// #ifdef GL_ES
// #ifdef GL_FRAGMENT_PRECISION_HIGH
// precision highp float; //着色器支持高精度，限定浮点类型为高精度 GL_FRAGMENT_PRECISION_HIGH 表示片元着色器支持highp精度
// #else
// precision mediump float; //着色器不支持高精度，限定浮点类型为中精度    
// #endif
// #endif
// 3.#if定义
// void main(){
//   gl_FragColor=vec4(3.)/255.;
// }
// #if NUM == 1
// void main(){
//   gl_FragColor=vec4(2.)/255.;
// }
// #else
// void main(){
//   gl_FragColor=vec4(3.)/255.;
// }
// #endif

// 4.#extension
// #extension GL_OES_texture_3D : enable
// void main(){
//   float a[3];

//   gl_FragColor=vec4(2.)/255.;
// }
