#version 300 es

precision mediump float;

in vec2 uv;

out vec4 fragColour;

void main(void) 
{
    fragColour = vec4(uv.xy, 0.0, 1.0);
}