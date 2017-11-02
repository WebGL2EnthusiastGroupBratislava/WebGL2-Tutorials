class GpuBuffer
{
    public static CreateBuffer(gl : WebGL2RenderingContext, target : number, buffer : ArrayBuffer | ArrayBufferView, usage : number) : WebGLBuffer
    {
        let bufferobject = gl.createBuffer();
        gl.bindBuffer(target, bufferobject);
        gl.bufferData(target, buffer, usage);
        gl.bindBuffer(target, null);
        return bufferobject;
    }
}