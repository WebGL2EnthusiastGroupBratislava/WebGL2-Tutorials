/// <reference path="../node_modules/@types/webgl2/index.d.ts" />

interface IShaderUniform
{
    InitializeUniforms() : void;
    SendUniformsToGpu() : void;
}

class ShaderProgram
{
    protected vertexShader : WebGLShader;
    protected pixelShader : WebGLShader;
    protected program : WebGLProgram;
    protected gl : WebGL2RenderingContext;

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
            this.VerifyCompileStatus(this.vertexShader);
        });
    }

    public CompilePixelShader(file : string) : void
    {
        FileLoader.Load(file, (text) =>
        {
            this.pixelShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            this.gl.shaderSource(this.pixelShader, text);
            this.gl.compileShader(this.pixelShader);
            this.VerifyCompileStatus(this.pixelShader);
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

    private VerifyCompileStatus( shader : WebGLShader) : void
    {
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) 
        {
            let info = this.gl.getShaderInfoLog(shader);
            throw 'Could not compile WebGL program. \n\n' + info;
        }
    }
}