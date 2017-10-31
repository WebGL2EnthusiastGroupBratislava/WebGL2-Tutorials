/// <reference path="../node_modules/@types/webgl2/index.d.ts" />
/// <reference path="../utility/ShaderProgram.ts" />
/// <reference path="../babylon/babylon.math.ts" />


class Lesson1
{
    private gl : WebGL2RenderingContext;
    private canvas : HTMLCanvasElement;
    private indices : number[];
    private vbo: WebGLBuffer;
    private ibo: WebGLBuffer;
    private shader : ShaderProgram;
    private projectionMatrix : BABYLON.Matrix;
    private viewMatrix : BABYLON.Matrix;
    private modelMatrix : BABYLON.Matrix;
    private modelMatUniformLoc : WebGLUniformLocation;
    private viewMatUniformLoc : WebGLUniformLocation;
    private projMatUniformLoc : WebGLUniformLocation;


    private Resize() {
        // Lookup the size the browser is displaying the canvas.
        var displayWidth  = this.canvas.clientWidth;
        var displayHeight = this.canvas.clientHeight;
       
        // Check if the canvas is not the same size.
        if (this.canvas.width  != displayWidth ||
            this.canvas.height != displayHeight) {
       
          // Make the canvas the same size
          this.canvas.width  = displayWidth;
          this.canvas.height = displayHeight;
        }
    }

    Main()
    {
        this.canvas = <HTMLCanvasElement>document.getElementById("webgl-canvas");
        this.gl = this.canvas.getContext("webgl");
        this.Resize();
        var vertices = [
        -1,-1,-1, 
        1,-1,-1,
         1, 1,-1,
         -1, 1,-1,

        -1,-1, 1, 1,-1, 1, 1, 1, 1, -1, 1, 1,
        -1,-1,-1, -1, 1,-1, -1, 1, 1, -1,-1, 1,
        1,-1,-1, 1, 1,-1, 1, 1, 1, 1,-1, 1,
        -1,-1,-1, -1,-1, 1, 1,-1, 1, 1,-1,-1,
        -1, 1,-1, -1, 1, 1, 1, 1, 1, 1, 1,-1, 
        ];

        var colors = [
        5,3,7, 5,3,7, 5,3,7, 5,3,7,
        1,1,3, 1,1,3, 1,1,3, 1,1,3,
        0,0,1, 0,0,1, 0,0,1, 0,0,1,
        1,0,0, 1,0,0, 1,0,0, 1,0,0,
        1,1,0, 1,1,0, 1,1,0, 1,1,0,
        0,1,0, 0,1,0, 0,1,0, 0,1,0
        ];

        this.indices = [
        0,1,2, 0,2,3, 4,5,6, 4,6,7,
        8,9,10, 8,10,11, 12,13,14, 12,14,15,
        16,17,18, 16,18,19, 20,21,22, 20,22,23 
        ];

        this.projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(Math.PI / 2, this.canvas.width/this.canvas.height, 1, 100);
        console.log(this.projectionMatrix);

        function get_projection(angle, a, zMin, zMax) {
            var ang = Math.tan((angle*.5)*Math.PI/180);//angle*.5
            return [
               0.5/ang, 0 , 0, 0,
               0, 0.5*a/ang, 0, 0,
               0, 0, -(zMax+zMin)/(zMax-zMin), -1,
               0, 0, (-2*zMax*zMin)/(zMax-zMin), 0 
            ];
         }
			
         var proj_matrix = get_projection(40, this.canvas.width/this.canvas.height, 1, 100);
         console.log(proj_matrix);

         
        //vertex buffer object
        this.vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        
        //index buffer object
        this.ibo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

        this.shader = new ShaderProgram(this.gl);
        this.shader.CompileVertexShader("/shaders/simplevertex.glsl");
        this.shader.CompilePixelShader("/shaders/simplepixel.glsl");
        this.shader.LinkShader();

        this.modelMatrix = BABYLON.Matrix.Translation(0, 0, 10);
        this.viewMatrix = BABYLON.Matrix.Identity();

        let mat = this.modelMatrix.multiply(this.viewMatrix.multiply(this.projectionMatrix));
        let vec = new BABYLON.Vector3(1, 1, 1);
        let result = BABYLON.Vector3.TransformCoordinates(vec, mat);
        console.log(result);

        this.modelMatUniformLoc = this.shader.GetUniformLocation("Mmatrix");
        this.viewMatUniformLoc = this.shader.GetUniformLocation("Vmatrix");
        this.projMatUniformLoc = this.shader.GetUniformLocation("Pmatrix");

        this.Render();
    }

    Render = () => 
    {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        
        this.gl.clearColor(0.392, 0.584, 0.929, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.shader.SetActive();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        
        let location = this.shader.GetAttribLocation("vertexPosition");
        this.gl.vertexAttribPointer(location, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(location);

        this.gl.uniformMatrix4fv(this.projMatUniformLoc, false, this.projectionMatrix.m);
        this.gl.uniformMatrix4fv(this.viewMatUniformLoc, false, this.viewMatrix.m);
        this.gl.uniformMatrix4fv(this.projMatUniformLoc, false, this.modelMatrix.m);
        
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);

        this.gl.disableVertexAttribArray(location);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.useProgram(null);
        requestAnimationFrame(this.Render);
    }
}

let l = new Lesson1();
l.Main();