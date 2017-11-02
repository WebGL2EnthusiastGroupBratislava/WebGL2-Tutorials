class SimpleShaderProgram extends ShaderProgram implements IShaderUniform
{
    
    private modelMatUniformLoc : WebGLUniformLocation;
    private viewMatUniformLoc : WebGLUniformLocation;
    private projMatUniformLoc : WebGLUniformLocation;

    private projectionMatrix : BABYLON.Matrix;
    private viewMatrix : BABYLON.Matrix;
    private modelMatrix : BABYLON.Matrix;

    constructor(gl : WebGL2RenderingContext)
    {
        super(gl);
    }

    public InitializeUniforms() : void 
    {
        this.modelMatUniformLoc = this.GetUniformLocation("Mmatrix");
        this.viewMatUniformLoc = this.GetUniformLocation("Vmatrix");
        this.projMatUniformLoc = this.GetUniformLocation("Pmatrix");
    }

    public SendUniformsToGpu() : void 
    {
        this.gl.uniformMatrix4fv(this.projMatUniformLoc, true, this.projectionMatrix.m);
        this.gl.uniformMatrix4fv(this.viewMatUniformLoc, true, this.viewMatrix.m);
        this.gl.uniformMatrix4fv(this.modelMatUniformLoc, true, this.modelMatrix.m);
    }

    public SetProjectionMatrix(matrix : BABYLON.Matrix) : void
    {
        this.projectionMatrix = matrix;
    }

    public SetViewMatrix(matrix : BABYLON.Matrix) : void
    {
        this.viewMatrix = matrix;
    }

    public SetModelMatrix(matrix : BABYLON.Matrix) : void
    {
        this.modelMatrix = matrix;
    }


}