import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { Singleton } from "../utils/singleton";
import { Uitls } from "../utils/utils";

export class WordsManager extends Singleton<WordsManager>() {
  anchor = document.getElementById("words")!;
  private professionTags = [
    "建筑师",
    "程序员",
    "艺术家",
    "作者",
    "设计师",
    "音乐家",
    "摄影师",
    "导演",
  ];
  private tagContainer: HTMLElement | null = null;
  genWave() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    svg.setAttribute("id", "wave-svg");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("viewBox", "0 0 512 512");
    svg.style.width = "100vw";
    svg.style.height = "100vh";
    svg.style.pointerEvents = "none";
    svg.style.display = "block";
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.zIndex = "5"; // 确保海浪在标签之上

    path.setAttribute("fill", "#336699");

    svg.appendChild(path);
    this.anchor.appendChild(svg);

    // 采样率。越小越精确。
    const SAMPLE_RATE = 2;
    const wave = Uitls.words.genWave();
    const tl = gsap.timeline();

    tl.to(
      {},
      {
        onUpdate: () => {
          const time = tl.progress();
          let cmd = "M 0 512 ";
          for (let i = 0; i < 512; i += SAMPLE_RATE) {
            cmd += `L ${i} ${512 - wave(time, i)} `;
          }
          cmd += `L 512 ${512 - wave(time, 512)} L 512 512`;
          path.setAttribute("d", cmd);
        },
        duration: 600,
      },
      0
    );
    return tl;
  }

  private createTagContainer() {
    if (!this.tagContainer) {
      this.tagContainer = document.createElement("div");
      this.tagContainer.style.position = "absolute";
      this.tagContainer.style.top = "0";
      this.tagContainer.style.left = "0";
      this.tagContainer.style.width = "100%";
      this.tagContainer.style.height = "100%";
      this.tagContainer.style.pointerEvents = "none";
      this.tagContainer.style.zIndex = "1"; // 位于海浪下方
      this.anchor.appendChild(this.tagContainer);
    }
  }

  genTags() {
    const tl = gsap.timeline();
    const tags: HTMLElement[] = [];

    this.professionTags.forEach((profession, index) => {
      const tag = document.createElement("div");

      tag.textContent = profession;
      tag.style.position = "absolute";
      tag.style.backgroundColor = "#336699";
      tag.style.color = "white";
      tag.style.padding = "10px 20px";
      tag.style.borderRadius = "25px";
      tag.style.fontSize = "16px";
      tag.style.fontWeight = "bold";
      tag.style.whiteSpace = "nowrap";
      tag.style.opacity = "0";
      tag.style.transform = "translateY(30px) scale(0.8)";
      tag.style.boxShadow = "0 4px 15px rgba(51, 102, 153, 0.3)";
      tag.style.border = "2px solid rgba(255, 255, 255, 0.2)";
      tag.style.backdropFilter = "blur(10px)";

      // 更自然的分散布局算法 - 基于极坐标和防重叠
      const centerX = 50; // 中心X坐标 (%)
      const centerY = 90; // 中心Y坐标 (%)

      // 使用极坐标创建自然分布
      const angle =
        (index / this.professionTags.length) * Math.PI * 2 +
        Math.random() * 0.8;
      const radius = 15 + Math.random() * 25; // 15-40% 半径范围

      let posX = centerX + Math.cos(angle) * radius;
      let posY = centerY - Math.abs(Math.sin(angle) * radius * 0.5); // Y轴压缩创造椭圆分布

      // 添加随机扰动让分布更自然
      posX += (Math.random() - 0.5) * 15;
      posY += (Math.random() - 0.5) * 10;

      // 确保标签在可视范围内
      posX = Math.max(5, Math.min(90, posX));
      posY = Math.max(50, Math.min(90, posY));

      tag.style.left = posX + "%";
      tag.style.top = posY + "%";

      this.tagContainer!.appendChild(tag);
      tags.push(tag);
    });

    // 所有标签一起出现，带stagger顺序
    tl.to(tags, {
      opacity: 1,
      scale: 1,
      duration: 100,
      ease: "back.out(1.7)",
      stagger: 10,
    })
      // 所有标签一起浮动
      .to(tags, {
        rotation: (_: number) => Math.random() * 4 - 2,
        duration: 100,
        ease: "sine.inOut",
        repeat: 1,
        stagger: 10,
      })
      // 所有标签一起消失
      .to(tags, {
        opacity: 0,
        scale: 0.8,
        rotation: 0,
        duration: 50,
        ease: "power2.in",
        stagger: 10,
      });

    return tl;
  }

  title() {}

  init() {
    document
      .querySelector<HTMLElement>("#easteregg")!
      .addEventListener("click", () => {
        document.querySelector<HTMLElement>("#words-outer")!.style.display =
          "block";
      });
    gsap.registerPlugin(ScrollTrigger);
    this.createTagContainer();
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#words-outer",
        start: "top top",
        end: "bottom bottom",
        scrub: 3,
      },
      duration: 600,
    });
    tl.add(this.genWave(), 0);
    tl.add(this.genTags(), 150);
  }
}
