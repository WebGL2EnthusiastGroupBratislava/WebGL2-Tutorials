attribute vec3 vertexPosition;
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform mat4 Mmatrix;

void main(void) 
{
    gl_Position = vec4(vertexPosition, 1.0) * Mmatrix * Vmatrix * Pmatrix;
}