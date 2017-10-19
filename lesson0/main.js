/// <reference path="../node_modules/@types/webgl2/index.d.ts" />
function fopen(file, callback) {
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                let allText = rawFile.responseText;
                callback(allText);
            }
        }
    };
    rawFile.send(null);
}
var BindFlags;
(function (BindFlags) {
    BindFlags[BindFlags["VERTEX_BUFFER"] = 1] = "VERTEX_BUFFER";
    BindFlags[BindFlags["INDEX_BUFFER"] = 2] = "INDEX_BUFFER";
})(BindFlags || (BindFlags = {}));
var BufferUsage;
(function (BufferUsage) {
    BufferUsage[BufferUsage["STATIC_DRAW"] = 1] = "STATIC_DRAW";
    BufferUsage[BufferUsage["DYNAMIC_DRAW"] = 2] = "DYNAMIC_DRAW";
})(BufferUsage || (BufferUsage = {}));
class GraphicsDeviceContext {
    constructor(glcontext, glcanvas) {
        this.canvas = glcanvas;
        this.gl = glcontext;
    }
    RSSetViewport(viewport) {
        if (viewport == null) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
        else {
            this.gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        }
    }
    IASetIndexBuffer(indexBuffer) {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    }
    IASetVertexBuffer(vertexBuffer) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    }
    ClearRenderTargetView(clearColour) {
        this.gl.clearColor(clearColour[0], clearColour[1], clearColour[2], clearColour[3]);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
    DrawIndexed(indexCount, startIndex) {
        this.gl.drawElements(this.gl.TRIANGLES, indexCount, this.gl.UNSIGNED_SHORT, startIndex);
    }
}
class GraphicsDeviceWebGL2 {
    constructor(canvasName) {
        this.canvas = document.getElementById(canvasName);
        this.gl = this.canvas.getContext("webgl2");
        this.Resize();
    }
    Resize() {
        // Lookup the size the browser is displaying the canvas.
        var displayWidth = this.canvas.clientWidth;
        var displayHeight = this.canvas.clientHeight;
        // Check if the canvas is not the same size.
        if (this.canvas.width != displayWidth ||
            this.canvas.height != displayHeight) {
            // Make the canvas the same size
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }
    }
    GetDevice() {
        return this.gl;
    }
    //Creates device context for state switching
    //TODO: Deal with multiple contexts
    GetDeviceContext() {
        return new GraphicsDeviceContext(this.gl, this.canvas);
    }
    CheckIfWebGLContextWasCreated() {
        if (!this.gl) {
            console.error("your browser is probably not compatible with webgl2");
            throw "your browser is probably not compatible with webgl2";
        }
    }
    //This internal method maps valid WebGL buffer usage bindings
    DecodeBindFlag(flags) {
        switch (flags) {
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
    CreateBuffer(descriptor, initialData) {
        console.log(initialData);
        let bindFlag = this.DecodeBindFlag(descriptor.bindFlags);
        // Create an empty buffer object to store vertex buffer
        let buffer = this.gl.createBuffer();
        this.gl.bindBuffer(bindFlag, buffer);
        if (bindFlag == this.gl.ARRAY_BUFFER) {
            this.gl.bufferData(bindFlag, new Float32Array(initialData), this.gl.STATIC_DRAW);
        }
        else {
            this.gl.bufferData(bindFlag, new Uint16Array(initialData), this.gl.STATIC_DRAW);
        }
        this.gl.bindBuffer(bindFlag, null);
        return buffer;
    }
    CreatePixelShader(shaderCode) {
        // Create fragment shader object
        let shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(shader, shaderCode);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            let info = this.gl.getShaderInfoLog(shader);
            throw 'Could not compile WebGL program. \n\n' + info;
        }
        return shader;
    }
    CreateVertexShader(shaderCode) {
        // Create fragment shader object
        let shader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(shader, shaderCode);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            let info = this.gl.getShaderInfoLog(shader);
            throw 'Could not compile WebGL program. \n\n' + info;
        }
        return shader;
    }
    CreateShaderProgram(vertexShader, pixelShader) {
        let shaderProgram = this.gl.createProgram();
        // Attach a vertex and pixel shader
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, pixelShader);
        this.gl.linkProgram(shaderProgram);
        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            let info = this.gl.getProgramInfoLog(shaderProgram);
            throw 'Could not compile WebGL program. \n\n' + info;
        }
        return shaderProgram;
    }
}
class Lesson0 {
    constructor() {
        this.Render = () => {
            this.gl.useProgram(this.program);
            this.deviceContext.IASetVertexBuffer(this.vbo);
            this.deviceContext.IASetIndexBuffer(this.ibo);
            let coord = this.gl.getAttribLocation(this.program, "coordinates");
            this.gl.vertexAttribPointer(coord, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(coord);
            this.deviceContext.ClearRenderTargetView([0.392, 0.584, 0.929, 1.0]);
            this.deviceContext.RSSetViewport();
            this.gl.enable(this.gl.DEPTH_TEST);
            this.deviceContext.DrawIndexed(this.indices.length, 0);
            requestAnimationFrame(this.Render);
        };
    }
    Main() {
        let device = new GraphicsDeviceWebGL2("canvas");
        device.CheckIfWebGLContextWasCreated();
        this.deviceContext = device.GetDeviceContext();
        this.gl = device.GetDevice();
        let vertices = [
            -0.5, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
        ];
        this.indices = [0, 1, 2];
        this.vbo = device.CreateBuffer({ bindFlags: BindFlags.VERTEX_BUFFER, usage: BufferUsage.STATIC_DRAW }, vertices);
        this.ibo = device.CreateBuffer({ bindFlags: BindFlags.INDEX_BUFFER, usage: BufferUsage.STATIC_DRAW }, this.indices);
        let vertexShader;
        fopen("/shaders/simplevertex.glsl", (text) => {
            vertexShader = device.CreateVertexShader(text);
        });
        let pixelShader;
        fopen("/shaders/simplepixel.glsl", (text) => {
            pixelShader = device.CreatePixelShader(text);
        });
        this.program = device.CreateShaderProgram(vertexShader, pixelShader);
        this.Render();
    }
}
let lesson = new Lesson0();
lesson.Main();
