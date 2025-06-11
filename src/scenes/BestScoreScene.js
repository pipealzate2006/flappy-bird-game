import BaseScene from "./BaseScene.js";

class BestScoreScene extends BaseScene {
  constructor(config) {
    super("ScoreScene", { ...config, canGoBack: true });
  }

  create() {
    super.create();

    const bestScore = localStorage.getItem("bestScore");

    this.add
      .text(
        this.config.width / 2,
        this.config.height / 2 + 50,
        `Best Score: ${bestScore || 0}`,
        {
          fontSize: "32px",
          fill: "#fff",
        }
      )
      .setOrigin(0.5, 1);
  }
}

export default BestScoreScene;
