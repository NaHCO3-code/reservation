import { CloudEffect } from "../view/cloudEffect";


// 便捷函数：创建云效果
function createCloudEffect(containerId: string): CloudEffect {
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

export class CloudManager {
  private static instance: CloudManager;
  static getInstance(): CloudManager {
    if (!CloudManager.instance) {
      CloudManager.instance = new CloudManager();
    }
    return CloudManager.instance;
  }

  private constructor() {};
  
  init(){
    document.addEventListener('DOMContentLoaded', () => {
      const cloudEffect = createCloudEffect('title');

      // 开始渲染循环
      function animate() {
        cloudEffect.render();
        requestAnimationFrame(animate);
      }

      animate();
    });
  }
}