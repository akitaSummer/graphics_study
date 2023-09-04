
#ifdef GL_ES
precision mediump float;
#endif

struct Light {
    vec3 position;//光源位置
    vec4 color;//光源颜色,

} Light1;
void main() {
  //定义 运算
    Light1.position = vec3(1., 2., 3.);
    Light light3 = Light(vec3(1., 2., 3.), vec4(8., 2., 4., 1.));
  // Light light2=Light(vec3(10.,2.,3.),vec4(8.,2.,4.,1.));
  // float a=1.;
  // if(light1==light2){
  //   a=2.;
  // }
  // gl_FragColor=vec4(a)/255.;

  //定义 访问
  // Light light1=Light(vec3(1.,2.,3.),vec4(8.,2.,4.,1.));
    gl_FragColor = vec4(Light1.position, 1.) / 255.;
}