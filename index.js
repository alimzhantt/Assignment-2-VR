function main() {
    const canvas = document.querySelector("#c");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        console.log("WebGL unavailable");
        return;
    }

    // ========== Шаг 1: Геометрия (Куб + Пирамида) ==========
    // Куб центрирован в начале координат (-0.5 .. 0.5)
    const cMin = -0.5, cMax = 0.5;
    const cubeVertices = [
        // Front face
        cMin, cMin, cMax,  1, 0, 1, 1,
        cMax, cMin, cMax,  1, 0, 0, 1,
        cMax, cMax, cMax,  0, 1, 0, 1,
        cMin, cMin, cMax,  1, 0, 1, 1,
        cMax, cMax, cMax,  0, 1, 0, 1,
        cMin, cMax, cMax,  0, 0, 1, 1,
        // Back face
        cMin, cMin, cMin,  0, 1, 1, 1,
        cMin, cMax, cMin,  1, 1, 0, 1,
        cMax, cMax, cMin,  1, 0.5, 0, 1,
        cMin, cMin, cMin,  0, 1, 1, 1,
        cMax, cMax, cMin,  1, 0.5, 0, 1,
        cMax, cMin, cMin,  0.5, 0, 1, 1,
        // Top face
        cMin, cMax, cMin,  1, 1, 0, 1,
        cMin, cMax, cMax,  0, 0, 1, 1,
        cMax, cMax, cMax,  0, 1, 0, 1,
        cMin, cMax, cMin,  1, 1, 0, 1,
        cMax, cMax, cMax,  0, 1, 0, 1,
        cMax, cMax, cMin,  1, 0.5, 0, 1,
        // Bottom face
        cMin, cMin, cMin,  0, 1, 1, 1,
        cMax, cMin, cMin,  0.5, 0, 1, 1,
        cMax, cMin, cMax,  1, 0, 0, 1,
        cMin, cMin, cMin,  0, 1, 1, 1,
        cMax, cMin, cMax,  1, 0, 0, 1,
        cMin, cMin, cMax,  1, 0, 1, 1,
        // Left face
        cMin, cMin, cMin,  0, 1, 1, 1,
        cMin, cMin, cMax,  1, 0, 1, 1,
        cMin, cMax, cMax,  0, 0, 1, 1,
        cMin, cMin, cMin,  0, 1, 1, 1,
        cMin, cMax, cMax,  0, 0, 1, 1,
        cMin, cMax, cMin,  1, 1, 0, 1,
        // Right face
        cMax, cMin, cMin,  0.5, 0, 1, 1,
        cMax, cMax, cMin,  1, 0.5, 0, 1,
        cMax, cMax, cMax,  0, 1, 0, 1,
        cMax, cMin, cMin,  0.5, 0, 1, 1,
        cMax, cMax, cMax,  0, 1, 0, 1,
        cMax, cMin, cMax,  1, 0, 0, 1,
    ];

    // Квадратная пирамида (центр в начале координат, вписана в 1x1x1)
    const pMin = -0.4, pMax = 0.4, pTop = 0.5, pBase = -0.5;
    const pyramidVertices = [
        // Base (2 triangles)
        pMin, pBase, pMin,  0.7, 0.7, 0.7, 1,
        pMax, pBase, pMin,  0.7, 0.7, 0.7, 1,
        pMax, pBase, pMax,  0.7, 0.7, 0.7, 1,
        pMin, pBase, pMin,  0.7, 0.7, 0.7, 1,
        pMax, pBase, pMax,  0.7, 0.7, 0.7, 1,
        pMin, pBase, pMax,  0.7, 0.7, 0.7, 1,
        // Front face
        pMin, pBase, pMax,  1, 0, 0, 1,
        pMax, pBase, pMax,  0, 1, 0, 1,
        0,    pTop,  0,     0, 0, 1, 1,
        // Right face
        pMax, pBase, pMax,  0, 1, 0, 1,
        pMax, pBase, pMin,  1, 1, 0, 1,
        0,    pTop,  0,     0, 0, 1, 1,
        // Back face
        pMax, pBase, pMin,  1, 1, 0, 1,
        pMin, pBase, pMin,  1, 0, 1, 1,
        0,    pTop,  0,     0, 0, 1, 1,
        // Left face
        pMin, pBase, pMin,  1, 0, 1, 1,
        pMin, pBase, pMax,  1, 0, 0, 1,
        0,    pTop,  0,     0, 0, 1, 1,
    ];

    const cubeVertexCount = cubeVertices.length / 7;
    const pyramidVertexCount = pyramidVertices.length / 7;

    // Объединяем оба объекта в один массив и буфер
    const allVertices = new Float32Array([...cubeVertices, ...pyramidVertices]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, allVertices, gl.STATIC_DRAW);

    // ========== Шаг 2: Шейдеры ==========
    const vsSource = `
        attribute vec4 aPosition;
        attribute vec4 aVertexColor;
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying lowp vec4 vColor;
        void main() {
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;
            vColor = aVertexColor;
        }
    `;

    const fsSource = `
        varying lowp vec4 vColor;
        void main() {
            gl_FragColor = vColor;
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);

    // Указатели на атрибуты и униформы (настраиваются 1 раз вне цикла)
    const aPositionLocation = gl.getAttribLocation(program, "aPosition");
    const aVertexColorLocation = gl.getAttribLocation(program, "aVertexColor");
    const uModelMatrixLocation = gl.getUniformLocation(program, "uModelMatrix");
    const uViewMatrixLocation = gl.getUniformLocation(program, "uViewMatrix");
    const uProjectionMatrixLocation = gl.getUniformLocation(program, "uProjectionMatrix");

    const stride = 7 * Float32Array.BYTES_PER_ELEMENT;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(aPositionLocation);
    gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(aVertexColorLocation);
    gl.vertexAttribPointer(aVertexColorLocation, 4, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);

    // ========== Шаг 3: Состояние и Управление ==========
    const state = {
        t: 0,
        paused: false,
        ortho: false,
        fovDeg: 45,
        azimuth: 0 // Управление стрелками влево/вправо
    };

    function resize() {
        const displayWidth = canvas.clientWidth * window.devicePixelRatio;
        const displayHeight = canvas.clientHeight * window.devicePixelRatio;
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener("resize", resize);
    resize();

    document.addEventListener("keydown", (event) => {
        if (event.key === 'p' || event.key === 'P') {
            state.paused = !state.paused;
        } else if (event.key === 'o' || event.key === 'O') {
            state.ortho = !state.ortho;
        } else if (event.key === '+' || event.key === '=') {
            state.fovDeg = Math.max(20, state.fovDeg - 5);
        } else if (event.key === '-' || event.key === '_') {
            state.fovDeg = Math.min(100, state.fovDeg + 5);
        } else if (event.key === 'ArrowLeft') {
            state.azimuth -= 5 * Math.PI / 180;
        } else if (event.key === 'ArrowRight') {
            state.azimuth += 5 * Math.PI / 180;
        } else if (event.key === 'r' || event.key === 'R') {
            state.t = 0;
            state.paused = false;
            state.ortho = false;
            state.fovDeg = 45;
            state.azimuth = 0;
        }
    });

    // ========== Шаг 4: Матрицы для варианта ID 23010300 ==========
    // Куб вращается вокруг Y
    function cubeModelMatrix(t) {
        const m = mat4.create();
        mat4.rotateY(m, m, 1.2 * t);
        return m;
    }

    // Пирамида: орбита вокруг куба (период T = 12 с), самовращение вокруг Y (2.0 рад/с), пульсация размера
    function solidModelMatrix(t) {
        const m = mat4.create();
        const T = 12.0; 
        const angle = (2 * Math.PI / T) * t;
        const radius = 2.5;

        // Порядок: Сначала масштабирование и самовращение, потом перенос на орбиту
        const scaleVal = 0.65 + 0.15 * Math.sin(2 * Math.PI * t / 3);
        
        mat4.translate(m, m, [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
        mat4.rotateY(m, m, 2.0 * t);
        mat4.scale(m, m, [scaleVal, scaleVal, scaleVal]);
        return m;
    }

    // ========== Шаг 5: Анимационный цикл ==========
    let then = 0;
    let frameCount = 0;
    let fps = 0;
    let lastFpsUpdate = 0;

    function render(now) {
        now *= 0.001; // в секунды
        const dt = Math.min(now - then, 0.1);
        then = now;

        if (!state.paused) {
            state.t += dt;
        }

        // FPS расчет
        frameCount++;
        if (now - lastFpsUpdate >= 1.0) {
            fps = frameCount;
            frameCount = 0;
            lastFpsUpdate = now;
        }

        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const aspect = canvas.clientWidth / canvas.clientHeight;

        // Проекция (Perspective / Ortho)
        const projectionMatrix = mat4.create();
        if (state.ortho) {
            const h = 2.0;
            mat4.ortho(projectionMatrix, -h * aspect, h * aspect, -h, h, 0.1, 100.0);
        } else {
            const fovRad = state.fovDeg * Math.PI / 180;
            mat4.perspective(projectionMatrix, fovRad, aspect, 0.1, 100.0);
        }
        gl.uniformMatrix4fv(uProjectionMatrixLocation, false, projectionMatrix);

        // Камера (View matrix с учетом стрелок ← / →)
        const baseEye = [0, 2.5, 7.0];
        const camX = baseEye[0] * Math.cos(state.azimuth) + baseEye[2] * Math.sin(state.azimuth);
        const camZ = -baseEye[0] * Math.sin(state.azimuth) + baseEye[2] * Math.cos(state.azimuth);
        const eye = [camX, baseEye[1], camZ];
        const target = [0, 0, 0];
        const up = [0, 1, 0];

        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, eye, target, up);
        gl.uniformMatrix4fv(uViewMatrixLocation, false, viewMatrix);

        // Отрисовка Куба
        const cubeMat = cubeModelMatrix(state.t);
        gl.uniformMatrix4fv(uModelMatrixLocation, false, cubeMat);
        gl.drawArrays(gl.TRIANGLES, 0, cubeVertexCount);

        // Отрисовка Пирамиды (Solid)
        const solidMat = solidModelMatrix(state.t);
        gl.uniformMatrix4fv(uModelMatrixLocation, false, solidMat);
        gl.drawArrays(gl.TRIANGLES, cubeVertexCount, pyramidVertexCount);

        // Обновление статус-бара
        const projType = state.ortho ? "Ortho" : "Perspective";
        document.getElementById("status").innerText = 
            `ID: 23010300 | Proj: ${projType} | FOV: ${state.fovDeg}° | t: ${state.t.toFixed(1)}s | FPS: ${fps}`;

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

window.onload = main;