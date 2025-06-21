var d=Object.defineProperty;var f=(r,e,t)=>e in r?d(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var a=(r,e,t)=>f(r,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(i){if(i.ep)return;i.ep=!0;const n=t(i);fetch(i.href,n)}})();(function(){if(typeof window>"u"||typeof HTMLElement>"u"||"attributeStyleMap"in HTMLElement.prototype)return;class r{constructor(t){a(this,"_el");this._el=t}set(t,o){this._el.style.setProperty(t,o)}get(t){return this._el.style.getPropertyValue(t)||null}has(t){return this._el.style.getPropertyValue(t)!==""}delete(t){this._el.style.removeProperty(t)}entries(){return Array.from(this._el.style).map(t=>[t,this._el.style.getPropertyValue(t)])}}Object.defineProperty(HTMLElement.prototype,"attributeStyleMap",{get:function(){return this.__attributeStyleMap||Object.defineProperty(this,"__attributeStyleMap",{value:new r(this),enumerable:!1,configurable:!1,writable:!1}),this.__attributeStyleMap},configurable:!0,enumerable:!1})})();const m=`
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
`;function u(r,e,t){const o=r.createShader(e);return o?(r.shaderSource(o,t),r.compileShader(o),r.getShaderParameter(o,r.COMPILE_STATUS)?o:(console.error("着色器编译错误:",r.getShaderInfoLog(o)),r.deleteShader(o),null)):null}function p(r,e,t){const o=r.createProgram();return o?(r.attachShader(o,e),r.attachShader(o,t),r.linkProgram(o),r.getProgramParameter(o,r.LINK_STATUS)?o:(console.error("程序链接错误:",r.getProgramInfoLog(o)),r.deleteProgram(o),null)):null}class g{constructor(e){a(this,"gl");a(this,"program",null);a(this,"positionBuffer",null);a(this,"texCoordBuffer",null);a(this,"startTime");const t=e.getContext("webgl");if(!t)throw new Error("WebGL不支持");this.gl=t,this.startTime=Date.now(),this.init()}init(){const e=this.gl,t=u(e,e.VERTEX_SHADER,m),o=u(e,e.FRAGMENT_SHADER,h);if(!t||!o)throw new Error("着色器创建失败");if(this.program=p(e,t,o),!this.program)throw new Error("程序创建失败");const i=new Float32Array([-1,-1,1,-1,-1,1,1,1]),n=new Float32Array([0,0,1,0,0,1,1,1]);this.positionBuffer=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this.positionBuffer),e.bufferData(e.ARRAY_BUFFER,i,e.STATIC_DRAW),this.texCoordBuffer=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this.texCoordBuffer),e.bufferData(e.ARRAY_BUFFER,n,e.STATIC_DRAW)}render(){const e=this.gl;if(!this.program)return;e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(.5,.8,1,1),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(this.program);const t=e.getUniformLocation(this.program,"u_time"),o=e.getUniformLocation(this.program,"u_resolution"),i=(Date.now()-this.startTime)/1e3;e.uniform1f(t,i),e.uniform2f(o,e.canvas.width,e.canvas.height);const n=e.getAttribLocation(this.program,"a_position"),s=e.getAttribLocation(this.program,"a_texCoord");e.bindBuffer(e.ARRAY_BUFFER,this.positionBuffer),e.enableVertexAttribArray(n),e.vertexAttribPointer(n,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,this.texCoordBuffer),e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,0,0),e.drawArrays(e.TRIANGLE_STRIP,0,4)}resize(e,t){this.gl.canvas.width=e,this.gl.canvas.height=t}}function y(r){const e=document.getElementById(r);if(!e)throw new Error(`找不到容器: ${r}`);const t=document.createElement("canvas");t.style.position="absolute",t.style.top="0",t.style.left="0",t.style.width="100%",t.style.height="100%",t.style.pointerEvents="none";const o=e.getBoundingClientRect();t.width=o.width,t.height=o.height,e.style.position="relative",e.appendChild(t);const i=new g(t),n=()=>{const s=e.getBoundingClientRect();i.resize(s.width,s.height)};return window.addEventListener("resize",n),i}const l=class l{constructor(){a(this,"minLoadTime",3e3);a(this,"loadStartTime",0);a(this,"state","loading")}static getInstance(){return this.instance||(this.instance=new l),this.instance}init(){this.loadStartTime=Date.now(),Promise.all([new Promise(t=>setTimeout(t,this.minLoadTime)),new Promise(t=>{const o=()=>{t(),document.removeEventListener("DOMContentLoaded",o)};document.addEventListener("DOMContentLoaded",o)})]).then(()=>{this.loaded()}),document.getElementById("loading").attributeStyleMap.set("opacity","1"),this.createAnimation()}loaded(){this.state="loaded",document.getElementById("loading").attributeStyleMap.set("opacity","0")}createAnimation(){const e=document.querySelector("#loading-icon"),t=()=>{e.attributeStyleMap.set("transform",`rotate(${-(Date.now()-this.loadStartTime)/5}deg) translate(50%, -50%)`),this.state==="loading"&&requestAnimationFrame(t)};requestAnimationFrame(t)}};a(l,"instance");let c=l;c.getInstance().init();document.addEventListener("DOMContentLoaded",()=>{const r=y("title");function e(){r.render(),requestAnimationFrame(e)}e()});
