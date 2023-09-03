#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 resolution;
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;  
    // 此处存在缺陷，因为在实际情况中画布的宽高比是不等于1的，
    // 如果按照此比例去绘制图形会出现拉伸情况，我们后面再一起讨论如何对此进行优化
    uv -= .5;
    gl_FragColor = vec4(uv.xy, 0.0, 1.0);
}