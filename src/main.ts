// 首先导入polyfill以确保兼容性
import './polyfills/attributeStyleMap';
import { createCloudEffect } from './cloud';
import { LoadingManager } from './loading';

LoadingManager.getInstance().init();

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  const cloudEffect = createCloudEffect('title');

  // 开始渲染循环
  function animate() {
    cloudEffect.render();
    requestAnimationFrame(animate);
  }

  animate();
});