/// <reference path="../node_modules/@types/webgl2/index.d.ts" />

enum BindFlags 
{
    VERTEX_BUFFER = 1,
    INDEX_BUFFER
}

enum BufferUsage 
{
    STATIC_DRAW = 1,
    DYNAMIC_DRAW
}

// Descriptor of OpenGL Buffers, so we could abstract things away nicely
interface BufferDescriptor
{
    usage : BufferUsage;
    bindFlags : BindFlags
}

interface ViewportDescriptor
{
    x : number;
    y : number;
    width : number;
    height : number;
}

class GraphicsDeviceContext
{
    //The WebGL2 rendering context
    private gl : WebGL2RenderingContext;
    //The HTML Canvas element
    private canvas : HTMLCanvasElement;

    public constructor(glcontext : WebGL2RenderingContext, glcanvas : HTMLCanvasElement) 
    { 
        this.canvas = glcanvas;
        this.gl = glcontext;
    }

    public RSSetViewport(viewport? : ViewportDescriptor)
    {
        if(viewport == null)
        {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
        else
        {
            this.gl.viewport(viewport.x , viewport.y, viewport.width, viewport.height);
        }
    }
}

class GraphicsDeviceWebGL2
{
    //The WebGL2 rendering context
    private gl;
    //The HTML Canvas element
    private canvas : HTMLCanvasElement;
    handleContextLost(event) {
        event.preventDefault();
        console.error("context lost!");
    }
      
    handleContextRestored(event) {
    }

    public constructor(canvasName : string) 
    { 
        this.canvas = <HTMLCanvasElement>document.getElementById(canvasName);
        this.gl = this.canvas.getContext("webgl2");

        this.canvas.addEventListener(
            "webglcontextlost", this.handleContextLost, false);
        this.canvas.addEventListener(
            "webglcontextrestored", this.handleContextRestored, false);
    }


   
    public GetDevice() : WebGL2RenderingContext
    {
        return this.gl;
    }

    //Creates device context for state switching
    //TODO: Deal with multiple contexts
    public GetDeviceContext()
    {
        return new GraphicsDeviceContext(this.gl, this.canvas);
    }
    
    public CheckIfWebGLContextWasCreated()
    {
        if (!this.gl) 
        {
            console.error("your browser is probably not compatible with webgl2");
            return this.gl.CONTEXT_LOST_WEBGL;
        }
        return this.gl.NO_ERROR;
    }

    //This internal method maps valid WebGL buffer usage bindings
    private DecodeBindFlag(flags : BindFlags)
    {
        switch(flags)
        {
            case BindFlags.VERTEX_BUFFER:
            {
                return this.gl.ARRAY_BUFFER;
            }
            case BindFlags.INDEX_BUFFER:
            {
                return this.gl.ELEMENT_ARRAY_BUFFER;
            }
            default:
            {
                return this.gl.INVALID_VALUE;
            }
        }
    }

    public CreateBuffer(descriptor : BufferDescriptor, initialData)
    {
        console.log(initialData);
        let bindFlag = this.DecodeBindFlag(descriptor.bindFlags);
        // Create an empty buffer object to store vertex buffer
        let buffer = this.gl.createBuffer();
        this.gl.bindBuffer(bindFlag, buffer);
        if(bindFlag == this.gl.ARRAY_BUFFER)
        {
            this.gl.bufferData(bindFlag, new Float32Array(initialData), this.gl.STATIC_DRAW);
        }
        else
        {
            this.gl.bufferData(bindFlag, new Uint16Array(initialData), this.gl.STATIC_DRAW);
        }
        this.gl.bindBuffer(bindFlag, null);
        return buffer;
    }

    public CreatePixelShader(shaderCode : string)
    {
        // Create fragment shader object
        let shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(shader, shaderCode); 
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) 
        {
            var info = this.gl.getShaderInfoLog(shader);
            throw 'Could not compile WebGL program. \n\n' + info;
        }
        return shader;
    }

    public CreateVertexShader(shaderCode : string)
    {
        // Create fragment shader object
        let shader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(shader, shaderCode); 
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) 
        {
            var info = this.gl.getShaderInfoLog(shader);
            throw 'Could not compile WebGL program. \n\n' + info;
        }
        return shader;
    }

    public CreateShaderProgram(vertexShader, pixelShader) : WebGLProgram
    {
        let shaderProgram = this.gl.createProgram();
        // Attach a vertex and pixel shader
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, pixelShader);
        this.gl.linkProgram(shaderProgram);

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) 
        {
            var info = this.gl.getProgramInfoLog(shaderProgram);
            throw 'Could not compile WebGL program. \n\n' + info;
        }

        return shaderProgram;
    }
}

class Lesson0
{
    gl : WebGL2RenderingContext;
    vbo : WebGLBuffer;
    ibo : WebGLBuffer;
    program : WebGLShader;
    indices : number[];
    deviceContext : GraphicsDeviceContext;
    Main()
    {
    
        let device : GraphicsDeviceWebGL2 = new GraphicsDeviceWebGL2("canvas");
        device.CheckIfWebGLContextWasCreated();
        this.deviceContext = device.GetDeviceContext();
        this.gl = device.GetDevice();
    
        let vertices = [
            -0.5,0.5,0.0,
            -0.5,-0.5,0.0,
            0.5,-0.5,0.0, 
         ];
         
        this.indices = [0,1,2];
    
        this.vbo = device.CreateBuffer({bindFlags : BindFlags.VERTEX_BUFFER, usage : BufferUsage.STATIC_DRAW}, vertices);
        this.ibo = device.CreateBuffer({bindFlags : BindFlags.INDEX_BUFFER, usage : BufferUsage.STATIC_DRAW}, this.indices);
         
        // Vertex shader source code
        let vertCode =
        'attribute vec3 coordinates;' +
        'void main(void) {' +
            ' gl_Position = vec4(coordinates, 1.0);' +
        '}';
        
        //fragment shader source code
        let fragCode =
        'void main(void) {' +
            ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);' +
        '}';

        let vertexShader = device.CreateVertexShader(vertCode);
        let pixelShader = device.CreatePixelShader(fragCode);
        this.program = device.CreateShaderProgram(vertexShader, pixelShader);
        this.Render();
    }

    Render = () => 
    {
        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        var coord = this.gl.getAttribLocation(this.program, "coordinates");
        this.gl.vertexAttribPointer(coord, 3, this.gl.FLOAT, false, 0, 0); 
        this.gl.enableVertexAttribArray(coord);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.deviceContext.RSSetViewport();
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT,0);
        requestAnimationFrame(this.Render);
     }
}





let lesson = new Lesson0();
lesson.Main();