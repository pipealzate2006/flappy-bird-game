import BaseScene from "./BaseScene.js";

class MenuScene extends BaseScene {
  constructor(config) {
    super("MenuScene", config);

    this.menu = [
      {
        scene: "PlayScene",
        text: "Play",
      },
      {
        scene: "ScoreScene",
        text: "Score",
      },
      {
        scene: null,
        text: "Exit",
      },
    ];
  }

  create() {
    super.create();

    this.createMenu(this.menu, this.setUpMenuEvents.bind(this));
  }

  setUpMenuEvents(menuItem) {
    const textGO = menuItem.textGO;
    textGO.setInteractive();

    textGO.on("pointerover", () =>
      textGO.setStyle({ fill: "#ff0", fontSize: "32px" })
    );
    textGO.on("pointerout", () =>
      textGO.setStyle({ fill: "#fff", fontSize: "32px" })
    );

    textGO.on("pointerup", () => {
      menuItem.scene &&
        menuItem.scene !== "ScoreScene" &&
        this.scene.start(menuItem.scene);
      if (menuItem.scene === "Exit") {
        this.game.destroy(true);
      } else if (menuItem.scene === "ScoreScene") {
        alert("Best Score: " + localStorage.getItem("bestScore"));
      }
    });
  }

  update() {}
}

export default MenuScene;
