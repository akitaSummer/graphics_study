#ifdef GL_ES
precision mediump float;

#endif
// 1.函数定义
// vec4 testFun(float num){
  // return vec4(num );
// }
// void main(){
  // float a =1.;
  // gl_FragColor = testFun(1.)/255.;
// }

// 2.流程控制

// void main(){
  //   float a=1.;
  //   vec4 b=vec4(0.);
  //   if(a==2.){
    //     b=vec4(1.);
  //   }else if(a==1.){
    //     b=vec4(1.,1.,0.,1.);
  //   }else{
    //     b=vec4(0.);
  //   }
  //   gl_FragColor=b;
// }

//3.for循环
// void main(){
//   vec4 a[2];
//   a[0]=vec4(1.);
//   a[1]=vec4(0.9216, 0.098, 0.098, 1.0);

//   for(int i=0;i<2;i++){
//     if(gl_FragCoord.x>200.){
//       gl_FragColor=a[0];
//     }else{
//       gl_FragColor=a[1];
//     }
//   }

// }

// 4.  流程控制
void main() {
    vec4 a[2];
    a[0] = vec4(0.1608, 0.0784, 0.7804, 1.0);
    a[1] = vec4(0.9216, 0.098, 0.098, 1.0);

    for(int i = 0; i < 2; i++) {
        if(gl_FragCoord.x > 300.) {
            break;
    // continue;
    //discard;
        } else if(gl_FragCoord.x > 200. && gl_FragCoord.x < 300.) {
            gl_FragColor = a[0];
        } else {
            gl_FragColor = a[1];
        }
    }

}