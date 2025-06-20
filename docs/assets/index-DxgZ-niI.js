var u=Object.defineProperty;var f=(r,t,e)=>t in r?u(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e;var a=(r,t,e)=>f(r,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function e(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(i){if(i.ep)return;i.ep=!0;const n=e(i);fetch(i.href,n)}})();const m=`
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`,h=`
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
`;function d(r,t,e){const o=r.createShader(t);return o?(r.shaderSource(o,e),r.compileShader(o),r.getShaderParameter(o,r.COMPILE_STATUS)?o:(console.error("着色器编译错误:",r.getShaderInfoLog(o)),r.deleteShader(o),null)):null}function g(r,t,e){const o=r.createProgram();return o?(r.attachShader(o,t),r.attachShader(o,e),r.linkProgram(o),r.getProgramParameter(o,r.LINK_STATUS)?o:(console.error("程序链接错误:",r.getProgramInfoLog(o)),r.deleteProgram(o),null)):null}class p{constructor(t){a(this,"gl");a(this,"program",null);a(this,"positionBuffer",null);a(this,"texCoordBuffer",null);a(this,"startTime");const e=t.getContext("webgl");if(!e)throw new Error("WebGL不支持");this.gl=e,this.startTime=Date.now(),this.init()}init(){const t=this.gl,e=d(t,t.VERTEX_SHADER,m),o=d(t,t.FRAGMENT_SHADER,h);if(!e||!o)throw new Error("着色器创建失败");if(this.program=g(t,e,o),!this.program)throw new Error("程序创建失败");const i=new Float32Array([-1,-1,1,-1,-1,1,1,1]),n=new Float32Array([0,0,1,0,0,1,1,1]);this.positionBuffer=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,this.positionBuffer),t.bufferData(t.ARRAY_BUFFER,i,t.STATIC_DRAW),this.texCoordBuffer=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,this.texCoordBuffer),t.bufferData(t.ARRAY_BUFFER,n,t.STATIC_DRAW)}render(){const t=this.gl;if(!this.program)return;t.viewport(0,0,t.canvas.width,t.canvas.height),t.clearColor(.5,.8,1,1),t.clear(t.COLOR_BUFFER_BIT),t.useProgram(this.program);const e=t.getUniformLocation(this.program,"u_time"),o=t.getUniformLocation(this.program,"u_resolution"),i=(Date.now()-this.startTime)/1e3;t.uniform1f(e,i),t.uniform2f(o,t.canvas.width,t.canvas.height);const n=t.getAttribLocation(this.program,"a_position"),s=t.getAttribLocation(this.program,"a_texCoord");t.bindBuffer(t.ARRAY_BUFFER,this.positionBuffer),t.enableVertexAttribArray(n),t.vertexAttribPointer(n,2,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,this.texCoordBuffer),t.enableVertexAttribArray(s),t.vertexAttribPointer(s,2,t.FLOAT,!1,0,0),t.drawArrays(t.TRIANGLE_STRIP,0,4)}resize(t,e){this.gl.canvas.width=t,this.gl.canvas.height=e}}function v(r){const t=document.getElementById(r);if(!t)throw new Error(`找不到容器: ${r}`);const e=document.createElement("canvas");e.style.position="absolute",e.style.top="0",e.style.left="0",e.style.width="100%",e.style.height="100%",e.style.pointerEvents="none";const o=t.getBoundingClientRect();e.width=o.width,e.height=o.height,t.style.position="relative",t.appendChild(e);const i=new p(e),n=()=>{const s=t.getBoundingClientRect();i.resize(s.width,s.height)};return window.addEventListener("resize",n),i}const c=class c{constructor(){a(this,"minLoadTime",3e3);a(this,"loadStartTime",0);a(this,"state","loading")}static getInstance(){return this.instance||(this.instance=new c),this.instance}init(){this.loadStartTime=Date.now(),Promise.all([new Promise(e=>setTimeout(e,this.minLoadTime)),new Promise(e=>{const o=()=>{e(),document.removeEventListener("DOMContentLoaded",o)};document.addEventListener("DOMContentLoaded",o)})]).then(()=>{this.loaded()}),document.getElementById("loading").attributeStyleMap.set("opacity","1"),this.createAnimation()}loaded(){this.state="loaded",document.getElementById("loading").attributeStyleMap.set("opacity","0")}createAnimation(){const t=document.querySelector("#loading-icon"),e=()=>{t.attributeStyleMap.set("transform",`rotate(${-(Date.now()-this.loadStartTime)/5}deg) translate(50%, -50%)`),this.state==="loading"&&requestAnimationFrame(e)};requestAnimationFrame(e)}};a(c,"instance");let l=c;l.getInstance().init();document.addEventListener("DOMContentLoaded",()=>{const r=v("title");function t(){r.render(),requestAnimationFrame(t)}t()});
