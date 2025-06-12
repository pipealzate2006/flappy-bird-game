import BestScoreScene from "./scenes/BestScoreScene.js";
import MenuScene from "./scenes/MenuScene.js";
import PauseScene from "./scenes/PauseScene.js";
import PlayScene from "./scenes/playScene.js";
import PreloadScene from "./scenes/PreloadScene.js";

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Tamaño adaptativo según el dispositivo
const WIDTH = isMobile ? 380 : 800;
const HEIGHT = 600;

const BIRD_POSITION = { x: WIDTH / 10, y: HEIGHT / 2 };

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  initialBirdPosition: BIRD_POSITION,
};

const Scenes = [PreloadScene, MenuScene, PlayScene, BestScoreScene, PauseScene];
const initScenes = () => Scenes.map((Scene) => new Scene(SHARED_CONFIG));

const config = {
  type: Phaser.AUTO, 
  ...SHARED_CONFIG,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      // gravity: { y: 400 },
      // debug: true,
    },
  },
  scene: initScenes(),
};

new Phaser.Game(config);
