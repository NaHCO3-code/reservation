export class ScrollManager {
  private static instance: ScrollManager;
  static getInstance(): ScrollManager {
    if (!this.instance) {
      this.instance = new ScrollManager();
    }
    return this.instance;
  }
  private sections: HTMLCollection;
  private cueerntSection: number = 0;

  private constructor(){
    this.sections = document.getElementById('app')!.children;
  }

  init(){
    window.addEventListener('wheel', (ev) => {
      if(ev.deltaY > 0 && this.cueerntSection < this.sections.length - 1){
        this.cueerntSection += 1;
      }else if(ev.deltaY < 0 && this.cueerntSection > 0){
        this.cueerntSection -= 1;
      }
      this.sections[this.cueerntSection]?.scrollIntoView({
        behavior: 'smooth'
      });
    })
  }
}