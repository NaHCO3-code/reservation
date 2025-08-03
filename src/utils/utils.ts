export const Uitls = {
  words: {
    genWave() {
      // 多项式项的数量。越大曲线细节越多。
      const TERM_CNT = 5;
      // 波浪在空间上的周期。一般等于画布宽度。
      const PERIOD = 512;
      // 波浪高度。
      const WAVE_HEIGHT = 128;
      // 波浪在时间上的周期数量。
      const WAVE_PERIOD_CNT = 2;
      // 波浪的随机变化速度
      const VARYING_SPEED = 16;

      const TERM_PHASE_DELTA = new Array(TERM_CNT)
        .fill(0)
        .map(() => Math.random() * PERIOD);
      const TERM_TIME_DUTY = new Array(TERM_CNT)
        .fill(0)
        .map(() => VARYING_SPEED / 2 - Math.random() * VARYING_SPEED);
      return (time: number, x: number) => {
        let res = 0;
        for (let i = 0; i < TERM_CNT; ++i) {
          res +=
            Math.sin(
              ((x * 2 ** i + TERM_PHASE_DELTA[i]) * Math.PI) / PERIOD +
                time * (2 ** i) * TERM_TIME_DUTY[i]
            ) *
            2 ** -i;
        }
        return (
          (res / (2 - 2 ** -TERM_CNT)) * WAVE_HEIGHT +
          Math.sin(time * Math.PI * 2 * WAVE_PERIOD_CNT - Math.PI / 2) ** 3 *
            WAVE_HEIGHT
        );
      };
    },
  },
};
