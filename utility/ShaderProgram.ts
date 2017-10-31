/// <reference path="../node_modules/@types/webgl2/index.d.ts" />
/// <reference path="../utility/FileLoader.ts" />

class ShaderProgram
{
    private vertexShader : WebGLShader;
    private pixelShader : WebGLShader;
    private program : WebGLProgram;
    private gl : WebGL2RenderingContext;

    public constructor(gl : WebGL2RenderingContext)
    {
        this.gl = gl;
    }

    public CompileVertexShader(file : string) : void
    {
        FileLoader.Load(file, (text) =>
        {
            this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
            this.gl.shaderSource(this.vertexShader, text);
            this.gl.compileShader(this.vertexShader);
            this.VerifyShader(this.gl, this.vertexShader);
        });
    }

    public CompilePixelShader(file : string) : void
    {
        FileLoader.Load(file, (text) =>
        {
            this.pixelShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            this.gl.shaderSource(this.pixelShader, text);
            this.gl.compileShader(this.pixelShader);
            this.VerifyShader(this.gl, this.vertexShader);
        });
    }

    public LinkShader() : void
    {
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, this.vertexShader);
        this.gl.attachShader(this.program, this.pixelShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) 
        {
            let info = this.gl.getProgramInfoLog(this.program);
            throw 'Could not compile WebGL program. \n\n' + info;
        }
    }

    public SetActive() : void
    {
        this.gl.useProgram(this.program);
    }

    public GetAttribLocation(attrib : string) : number
    {
        return this.gl.getAttribLocation(this.program, attrib);
    }

    public GetUniformLocation(uniform : string) : WebGLUniformLocation
    {
        return this.gl.getUniformLocation(this.program, uniform);
    }

    private VerifyShader(gl : WebGL2RenderingContext, shader : WebGLShader) : void
    {
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
        {
            let info = gl.getShaderInfoLog(shader);
            throw 'Could not compile WebGL program. \n\n' + info;
        }
    }
}