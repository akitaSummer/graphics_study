#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 resolution;
void main() {
    vec2 p = gl_FragCoord.xy / resolution;
    gl_FragColor = vec4(p.xy, 0.0, 1.0);
}