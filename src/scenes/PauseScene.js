import BaseScene from "./BaseScene.js";

class PauseScene extends BaseScene {
  constructor(config) {
    super("PauseScene", config);

    this.menu = [
      {
        scene: "PlayScene",
        text: "Continue",
      },
      {
        scene: "MenuScene",
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
      if (menuItem.scene && menuItem.text === "Continue") {
        this.scene.stop();
        this.physics.resume(menuItem.scene);
        this.scene.resume(menuItem.scene);
      } else {
        this.scene.stop("PlayScene");
        this.scene.start(menuItem.scene);
      }
    });
  }
}

export default PauseScene;
