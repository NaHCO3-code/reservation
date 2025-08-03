import gsap from "gsap";
import { Singleton } from "../utils/singleton";
import { ScrollTrigger } from "gsap/all";
import { Uitls } from "../utils/utils";

export class WordsManager extends Singleton<WordsManager>() {
  anchor = document.getElementById("words")!;

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

  title(){

  }

  init() {
    gsap.registerPlugin(ScrollTrigger);
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
  }
}
