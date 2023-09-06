#ifdef GL_ES
precision mediump float;
#endif

//1.参数限定词
// const
 // 声明定义常量
// const int age = 18;
// const vec4 color = vec4(0.5, 0.5, 0.5, 0.5);

// // 也可以用于限定函数的参数
// void doSomething(const float param) {
//     param = 0.1; // Error! 不可！

// }
//in 但内部修改不影响传入前的变量
void doSomethingIn(in float param) {
    param = 2.;
    gl_FragColor = vec4(param) / 255.;
}

//out 会影响到函数外部传入的变量
void doSomethingOut(out float param) {

    param = 3.;

}
//inout 会影响到函数外部传入的变量
void doSomethingInout(inout float param) {
    param = 4.;

}
uniform float a;

varying float c;

void main() {
    float a = 1.;
// doSomethingIn(a);
 //doSomethingOut(a);
//doSomethingInout(a);
    gl_FragColor = vec4(a) / 255.;
//  gl_FragColor = vec4(a)/255.;

// 2.精度限定词 
// 示例：声明 float 类型的默认精度为 highp
// precision highp float;
// mediump vec2 p;
// 函数声明（返回值和参数）也适用
// highp float foo(highp param);
// 3.储存限定符

}