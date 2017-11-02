/// <reference path="../node_modules/@types/webgl2/index.d.ts" />

class Lesson1
{
    private gl : WebGL2RenderingContext;
    private canvas : HTMLCanvasElement;
    private indices : number[];
    private vbo : WebGLBuffer;
    private ibo : WebGLBuffer;
    private texcoordBuffer : WebGLBuffer;
    private shader : SimpleShaderProgram;
    private projectionMatrix : BABYLON.Matrix;
    private viewMatrix : BABYLON.Matrix;
    private modelMatrix : BABYLON.Matrix;
    private rotation : number = 0;

    private Resize() 
    {
        // Lookup the size the browser is displaying the canvas.
        let displayWidth  = this.canvas.clientWidth;
        let displayHeight = this.canvas.clientHeight;
       
        // Check if the canvas is not the same size.
        if (this.canvas.width  != displayWidth || this.canvas.height != displayHeight) 
        {
            // Make the canvas the same size
            this.canvas.width  = displayWidth;
            this.canvas.height = displayHeight;
        }
    }

    Main()
    {
        this.canvas = <HTMLCanvasElement>document.getElementById("webgl-canvas");
        this.gl = this.canvas.getContext("webgl2");
        this.Resize();

        let vertices = [
            -1,-1,-1,   1,-1,-1,    1,1,-1,     -1,1,-1,
            -1,-1, 1,   1,-1, 1,    1, 1, 1,    -1, 1, 1,
            -1,-1,-1,   -1, 1,-1,   -1, 1, 1,   -1,-1, 1,
            1,-1,-1,    1, 1,-1,    1, 1, 1,    1,-1, 1,
            -1,-1,-1,   -1,-1, 1,   1,-1, 1,    1,-1,-1,
            -1, 1,-1,   -1, 1, 1,   1, 1, 1,    1, 1,-1, 
        ];

        let colours = [
            5,3,7, 5,3,7, 5,3,7, 5,3,7,
            1,1,3, 1,1,3, 1,1,3, 1,1,3,
            0,0,1, 0,0,1, 0,0,1, 0,0,1,
            1,0,0, 1,0,0, 1,0,0, 1,0,0,
            1,1,0, 1,1,0, 1,1,0, 1,1,0,
            0,1,0, 0,1,0, 0,1,0, 0,1,0
        ];

        let texcoords = [
            // Front face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
  
            // Back face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
  
            // Top face
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
  
            // Bottom face
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
  
            // Right face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
  
            // Left face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
          ];

        this.indices = [
            0,1,2,      0,2,3,      4,5,6, 
            4,6,7,      8,9,10,     8,10,11, 
            12,13,14,   12,14,15,   16,17,18,
            16,18,19,   20,21,22,   20,22,23 
        ];

        //vertex buffer object
        this.vbo = GpuBuffer.CreateBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        
        //index buffer object
        this.ibo = GpuBuffer.CreateBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);

        //Texture Coordinate buffer object
        this.texcoordBuffer = GpuBuffer.CreateBuffer(this.gl, this.gl.ARRAY_BUFFER, new Float32Array(texcoords), this.gl.STATIC_DRAW)

        this.shader = new SimpleShaderProgram(this.gl);
        this.shader.CompileVertexShader("/shaders/simplevertex.glsl");
        this.shader.CompilePixelShader("/shaders/simplepixel.glsl");
        this.shader.LinkShader();
        this.shader.InitializeUniforms();

        this.projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(Math.PI / 2, this.canvas.width/this.canvas.height, 1, 100);
        this.viewMatrix = BABYLON.Matrix.Identity();
        
        this.Render();
    }

    Render = () => 
    {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        
        this.gl.clearColor(0.392, 0.584, 0.929, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        this.modelMatrix = BABYLON.Matrix.Identity();
        this.modelMatrix = this.modelMatrix.multiply(BABYLON.Matrix.RotationY(this.rotation));
        this.modelMatrix = this.modelMatrix.multiply(BABYLON.Matrix.RotationX(this.rotation));
        this.modelMatrix = this.modelMatrix.multiply(BABYLON.Matrix.Translation(0, 0, 10));
        this.rotation += 0.01;

        this.shader.SetActive();
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        let location = this.shader.GetAttribLocation("vertexPosition");
        this.gl.vertexAttribPointer(location, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(location);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        let texCoordLocation = this.shader.GetAttribLocation("texCoord");
        this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(texCoordLocation);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);        
        this.shader.SetModelMatrix(this.modelMatrix);
        this.shader.SetViewMatrix(this.viewMatrix);
        this.shader.SetProjectionMatrix(this.projectionMatrix);
        this.shader.SendUniformsToGpu();
        
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