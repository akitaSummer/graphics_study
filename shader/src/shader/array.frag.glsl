#ifdef GL_ES
precision mediump float;
#endif
struct Light {
    vec3 position;//光源位置
    vec4 color;//光源颜色
};

void main() {
   //定义数组
    float array1[2];
    vec2 array2[2];
    bool array3[2];
    Light array4[2];
  //数组赋值与访问

    array1[0] = 1.;
    array2[0] = vec2(2.);
    array3[0] = true;
    array4[0] = Light(vec3(1., 2., 3.), vec4(8., 2., 4., 1.));
//数组运算
    // int array = array4.length();
    gl_FragColor = vec4(array1[0], array1[1], 1., 1.) / 255.;
//  gl_FragColor=vec4(array2[0].x)/255.;
//  gl_FragColor=vec4(array3[0])/255.;
//  gl_FragColor=vec4(array4[0].color.r)/255.;

}