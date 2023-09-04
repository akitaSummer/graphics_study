
#ifdef GL_ES
precision mediump float;
#endif

void main() {
        //向量定义与
        // vec3 v1 = vec3(1.,1. ,1. );
        // ivec3 iv1 = ivec3(1,1,1);
        // bvec3 bv1 = bvec3( false, false, false); gl_FragColor =vec4(vec3(bv1),1. );
        // vec2 v2 = vec2(1.,.5);
        // vec3 v21 = vec3(v2, 1.); gl_FragColor =vec4(vec3(v21),1. );
        // vec4 v24 = vec4(.5, .5,.5 ,0.5 );  //vec4(.5)   //vec4(.5,.5); //如果初始化传入的数字大于1，就会报错，总结来说要末传全部参数要不传一个，其他都会报错
        // vec3 v23 = vec3(v24); gl_FragColor =vec4(v23,1. );

       //向量取值
      // vec4 v4 = vec4(.1,.2 ,.3,.4 );
        //gl_FragColor =vec4(v4[0]);   
        //gl_FragColor =vec4(v4.r);
        //gl_FragColor =vec4(v4.s);
       //向量获取值

        // vec3 v1 = vec3(1., 3.,1.);
        //返回当前向量长度 约等于3
       // float v1l = length(v1);      //gl_FragColor =vec4(vec3(v1l),1. )/255.;

        //将向量进行归一化处理
      //  vec3 v1nor =normalize(v1);  // gl_FragColor =vec4(v1nor,1. );

        //向量运算
        //加和减
        // vec2 v2 = vec2(0.,.1 );
        // vec2 v21 = vec2(.2,.2 );
        // vec2 v2v21 = v2+v21;
        // gl_FragColor =vec4(v2v21,1.,1. );

        //点成
        // vec2 v2 = vec2(0.,.1 );
        // vec2 v21 = vec2(.2,.2 );
        // float v2v21 = dot(v2,v21 );
        // gl_FragColor =vec4(v2v21 );

        //叉成
        // vec3 v2 = vec3(.1,.2,.3 );
        // vec3 v21 = vec3(.3,.2,.1 );
        // vec3 v2v21 =cross(v2,v21);
        // gl_FragColor =vec4(v2v21.y);

}