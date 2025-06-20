export class LoadingManager {
  private minLoadTime: number = 3000;
  private loadStartTime: number = 0;
  state: 'loading' | 'loaded' = 'loading';
  private constructor() {
  }

  private static instance: LoadingManager;
  static getInstance(): LoadingManager {
    if (!this.instance) {
      this.instance = new LoadingManager();
    }
    return this.instance;
  }

  init(){
    this.loadStartTime = Date.now();
    Promise.all([
      new Promise<void>(resolve => setTimeout(resolve, this.minLoadTime)),
      new Promise<void>(resolve => {
        const handler = () => {
          resolve();
          document.removeEventListener('DOMContentLoaded', handler);
        }
        document.addEventListener('DOMContentLoaded', handler)
      })
    ]).then(() => {
      this.loaded();
    })
    const loadingEl = document.getElementById('loading')!;
    loadingEl.attributeStyleMap.set('opacity', '1');
    this.createAnimation();
  }

  loaded() {
    this.state = 'loaded';
    const loadingEl = document.getElementById('loading')!;
    loadingEl.attributeStyleMap.set('opacity', '0');
  }

  createAnimation(){
    const svg = document.querySelector('#loading-icon') as HTMLEmbedElement;
    const animate = () => {
      svg.attributeStyleMap.set('transform', `rotate(${-(Date.now() - this.loadStartTime) / 5}deg) translate(50%, -50%)`);
      if(this.state === 'loading'){
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate)

  }
}