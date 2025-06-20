// 顶点着色器源码
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

// 片段着色器源码 - 创建逼真的云效果
const fragmentShaderSource = `
  precision mediump float;

  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;

  // 噪声函数
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // 2D噪声
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // 分形布朗运动 - 创建云的层次感
  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 6; i++) {
      value += amplitude * noise(st * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 st = v_texCoord;

    // 计算宽高比并修正坐标，防止云被拉伸
    float aspectRatio = u_resolution.x / u_resolution.y;
    vec2 pos = st * 2.5;

    // 根据宽高比调整坐标，保持云的形状不变
    if (aspectRatio > 1.0) {
      // 宽屏：缩放x坐标
      pos.x *= aspectRatio;
    } else {
      // 高屏：缩放y坐标
      pos.y /= aspectRatio;
    }

    // 添加时间动画，让云缓慢移动
    float time = u_time * 0.3;
    pos.x += time * 0.15;
    pos.y += time * 0.08;

    // 生成云的基础形状 - 多层噪声
    float cloud1 = fbm(pos + vec2(time * 0.1, time * 0.05));
    float cloud2 = fbm(pos * 1.5 + vec2(time * 0.02, -time * 0.07));
    float cloud3 = fbm(pos * 2.5 + vec2(-time * 0.18, time * 0.1));

    // 分别处理不同层的云以实现不同效果
    float lowClouds = cloud1 * 0.6 + cloud2 * 0.3;  // 低层云
    float highClouds = cloud3 * 0.1;                 // 高层云

    // 添加更多细节层，增强动画效果 - 降低幅度以减少云密度
    lowClouds += 0.2 * fbm(pos * 3.0 + vec2(time * 0.2, time * 0.15));
    highClouds += 0.1 * fbm(pos * 6.0 + vec2(time * 0.25, -time * 0.2));

    // 对低层云使用较软的边缘，对高层云使用更锐利的边缘
    lowClouds = smoothstep(0.4, 0.7, lowClouds);     // 低层云边缘较软
    highClouds = smoothstep(0.6, 0.65, highClouds);  // 高层云边缘锐利

    // 晴天的天空颜色渐变 - 更自然的蓝色
    vec4 skyColor = mix(
      vec4(0.6, 0.85, 1.0, 1.0),   // 地平线浅蓝色
      vec4(0.2, 0.6, 0.95, 1.0),   // 天顶深蓝色
      pow(st.y, 0.8)
    );

    // 低层云的颜色 - 更深的阴影效果
    vec4 lowCloudColor = mix(
      vec4(1.0, 1.0, 1.0, 1.0),      // 亮部白色
      vec4(0.7, 0.8, 0.85, 1.0),     // 更深的阴影部分
      lowClouds * 0.6
    );

    // 高层云的颜色 - 保持较亮
    vec4 highCloudColor = mix(
      vec4(1.0, 1.0, 1.0, 1.0),      // 亮部白色
      vec4(0.9, 0.95, 0.98, 1.0),    // 轻微阴影
      highClouds * 0.3
    );

    // 先混合天空和低层云，再叠加高层云
    vec4 finalColor = mix(skyColor, lowCloudColor, lowClouds * 0.6);
    finalColor = mix(finalColor, highCloudColor, highClouds * 0.4);

    gl_FragColor = finalColor;
  }
`;

// 创建着色器
function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('着色器编译错误:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// 创建着色器程序
function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('程序链接错误:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

// 云效果类
export class CloudEffect {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private startTime: number;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('WebGL不支持');
    }
    this.gl = gl;
    this.startTime = Date.now();
    this.init();
  }

  private init() {
    const gl = this.gl;

    // 创建着色器
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      throw new Error('着色器创建失败');
    }

    // 创建程序
    this.program = createProgram(gl, vertexShader, fragmentShader);
    if (!this.program) {
      throw new Error('程序创建失败');
    }

    // 创建全屏四边形的顶点
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    const texCoords = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      1, 1,
    ]);

    // 创建缓冲区
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  }

  public render() {
    const gl = this.gl;
    if (!this.program) return;

    // 设置视口
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // 清除画布
    gl.clearColor(0.5, 0.8, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 使用程序
    gl.useProgram(this.program);

    // 设置uniform变量
    const timeLocation = gl.getUniformLocation(this.program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');

    const currentTime = (Date.now() - this.startTime) / 1000.0;
    gl.uniform1f(timeLocation, currentTime);
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // 设置顶点属性
    const positionLocation = gl.getAttribLocation(this.program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');

    // 绑定位置缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // 绑定纹理坐标缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // 绘制
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  public resize(width: number, height: number) {
    this.gl.canvas.width = width;
    this.gl.canvas.height = height;
  }
}

// 便捷函数：创建云效果
export function createCloudEffect(containerId: string): CloudEffect {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`找不到容器: ${containerId}`);
  }

  // 创建canvas元素
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';

  // 设置canvas尺寸
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // 添加到容器
  container.style.position = 'relative';
  container.appendChild(canvas);

  // 创建云效果
  const cloudEffect = new CloudEffect(canvas);

  // 处理窗口大小变化
  const handleResize = () => {
    const rect = container.getBoundingClientRect();
    cloudEffect.resize(rect.width, rect.height);
  };

  window.addEventListener('resize', handleResize);

  return cloudEffect;
}