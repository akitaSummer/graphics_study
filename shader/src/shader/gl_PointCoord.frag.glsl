#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 resolution;
void main() {

    gl_FragColor = vec4(gl_PointCoord.xy, 0.0, 1.0);
}