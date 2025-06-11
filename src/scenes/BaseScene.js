class BaseScene extends Phaser.Scene {
  constructor(key, config) {
    super(key);
    this.config = config;
    this.screenCenter = [config.width / 2, config.height / 2];
  }

  create() {
    this.add.image(0, 0, "sky").setOrigin(0);

    if (this.config.canGoBack) {
      console.log(this.config.canGoBack);
      const backButton = this.add
        .image(this.config.width - 10, this.config.height - 10, "back")
        .setOrigin(1)
        .setScale(2)
        .setInteractive();

      backButton.on("pointerup", () => {
        this.scene.launch("MenuScene");
      });
    }
  }

  createMenu(menu, setUpMenuEvents) {
    let lastMenuPositionY = 0;

    menu.forEach((item) => {
      const menuPosition = [
        this.screenCenter[0],
        this.screenCenter[1] + lastMenuPositionY,
      ];
      item.textGO = this.add
        .text(...menuPosition, item.text, {
          fontSize: "32px",
          fill: "#fff",
        })
        .setOrigin(0.5, 1);
      lastMenuPositionY += 42;
      setUpMenuEvents(item);
    });
  }
}
export default BaseScene;
