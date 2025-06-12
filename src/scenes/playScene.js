import BaseScene from "./BaseScene.js";

class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", config);

    this.bird = null;
    this.pipes = null;
    this.isPaused = false;

    this.pipeHorizontalDistance = 0;
    // *** HUECO FIJO: Cambia este valor para ajustar el tamaño del hueco ***
    this.PIPE_GAP = 0; // Distancia fija entre pipes (hueco por donde pasa el pájaro)
    this.flapVelocity = 300;

    this.PIPES_TO_RENDER = 4;

    this.score = 0;
    this.scoreText = "";
    this.bestScore = 0;
    this.bestScoreText = "";

    this.escWasPressed = false;

    this.currentDifficulty = "easy";
    this.difficulties = {
      easy: {
        PIPE_GAP: 120,
        pipeHorizontalDistanceRange: [400, 450],
      },
      normal: {
        PIPE_GAP: 110,
        pipeHorizontalDistanceRange: [350, 400],
      },
      hard: {
        PIPE_GAP: 100,
        pipeHorizontalDistanceRange: [300, 350],
      },
    };
  }

  create() {
    this.currentDifficulty = "easy";
    super.create();
    this.createBird();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.handleInputs();
    this.createPauseButton();
    this.initEvents();

    this.anims.create({
      key: "flap",
      frames: this.anims.generateFrameNumbers("bird", { start: 8, end: 15 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "dead",
      frames: this.anims.generateFrameNumbers("bird", { start: 16, end: 18 }),
      frameRate: 8,
    });

    this.bird.play("flap");
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  initEvents() {
    if (this.pauseEvent) return;

    this.pauseEvent = this.events.on("resume", () => {
      this.initialTime = 3;
      this.countDownText = this.add
        .text(...this.screenCenter, "Fly in: " + this.initialTime, {
          fontSize: "32px",
          fill: "#fff",
        })
        .setOrigin(0.5);
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true,
      });
    });
  }

  countDown() {
    this.initialTime--;
    this.countDownText.setText("Fly in: " + this.initialTime);
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText("");
      this.physics.resume();
      this.timedEvent.remove();
    }
  }

  createBG() {
    this.add.image(this.config.width / 2, this.config.height / 2, "sky");
  }

  createBird() {
    this.bird = this.physics.add
      .sprite(
        this.config.initialBirdPosition.x,
        this.config.initialBirdPosition.y,
        "bird"
      )
      .setFlipX(true)
      .setGravityY(600)
      .setScale(2);
    this.bird.setCollideWorldBounds(true);
  }

  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < this.PIPES_TO_RENDER; i++) {
      // Sin setOrigin - usan el origen por defecto (0.5, 0.5) - centro del sprite
      const upperPipe = this.pipes.create(0, 0, "pipe").setImmovable(true);
      const lowerPipe = this.pipes.create(0, 0, "pipe").setImmovable(true);

      this.placePipe(upperPipe, lowerPipe);
    }

    this.pipes.setVelocityX(-200);
  }

  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }

  createScore() {
    this.score = 0;
    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: "32px",
      fill: "#000",
      fontWeight: "bold",
    });

    const bestScore = localStorage.getItem("bestScore");
    this.bestScoreText = this.add.text(
      16,
      50,
      `Best score: ${bestScore || 0}`,
      {
        fontSize: "22px",
        fill: "#000",
        fontWeight: "bold",
      }
    );
  }

  createPauseButton() {
    // if (this.isMobile) return;

    this.isPaused = false;
    const pauseButton = this.add
      .image(this.config.width - 20, this.config.height - 20, "pause")
      .setOrigin(1)
      .setInteractive()
      .setScale(2);

    pauseButton.on("pointerdown", () => {
      this.isPaused = true;
      this.escWasPressed = true;
      this.physics.pause();
      this.scene.pause();
      this.scene.launch("PauseScene");
    });
  }

  handleInputs() {
    // this.input.on(
    //   "pointerdown",
    //   (pointer) => {
    //     if (pointer.pointerType === "touch") {
    //       console.log("📱 Tocó la pantalla (móvil)");
    //       this.flap();
    //     } else {
    //       console.log("🖱 Mouse (PC) change");
    //       this.flap();
    //     }
    //     this.flap();
    //   },
    //   this
    // );

    // if (!this.isMobile) {
      // Solo agregar controles de teclado si no es móvil

      this.input.on("pointerdown", this.flap, this);
      this.input.keyboard.on("keydown_SPACE", this.flap, this);

      this.input.keyboard.on("keydown_ESC", () => {
        this.isPaused = true;
        this.escWasPressed = true;
        this.physics.pause();
        this.scene.pause();
        this.scene.launch("PauseScene");
      });
    // }
  }

  checkGameStatus() {
    if (
      this.bird.getBounds().bottom >= this.config.height ||
      this.bird.getBounds().top <= 0
    ) {
      console.log("Game Over: Bird out of bounds");
      this.gameOver();
    }
  }

  placePipe(uPipe, lPipe) {
    const difficulty = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();
    const pipeHorizontalDistance = Phaser.Math.Between(
      ...difficulty.pipeHorizontalDistanceRange
    );

    // *** NUEVA LÓGICA: Hueco fijo con posición aleatoria (sin setOrigin) ***

    // 1. Obtener dimensiones del pipe (asumiendo que todos son iguales)
    const pipeHeight = uPipe.height;
    console.log("pipeHeight", this.config.height);

    // 2. Calcular límites para que el hueco siempre esté visible
    const minGapTop = pipeHeight / 2 + 50; // Margen superior + media altura del pipe
    const maxGapBottom = this.config.height - pipeHeight / 2 - 50; // Margen inferior + media altura del pipe

    // 3. Posición aleatoria del centro del hueco
    const gapCenterY = Phaser.Math.Between(
      minGapTop + difficulty.PIPE_GAP / 2,
      maxGapBottom - difficulty.PIPE_GAP / 2
    );

    // 4. Calcular posiciones de los centros de cada pipe
    // Pipe superior: su centro está a (PIPE_GAP/2 + altura/2) arriba del centro del hueco
    const upperPipeCenterY =
      gapCenterY - difficulty.PIPE_GAP / 2 - pipeHeight / 2;

    // Pipe inferior: su centro está a (PIPE_GAP/2 + altura/2) abajo del centro del hueco
    const lowerPipeCenterY =
      gapCenterY + difficulty.PIPE_GAP / 2 + pipeHeight / 2;

    // 5. Establecer posiciones finales (recuerda: sin setOrigin, se posiciona por el centro)
    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = upperPipeCenterY;

    lPipe.x = uPipe.x;
    lPipe.y = lowerPipeCenterY;
  }

  recyclePipes() {
    const tempPipes = [];
    this.pipes.getChildren().forEach((pipe) => {
      if (pipe.getBounds().right <= 0) {
        tempPipes.push(pipe);
        if (tempPipes.length === 2) {
          this.placePipe(...tempPipes);
          this.increaseScore();
          this.setBestScore();
          this.increaseDifficulty();
        }
      }
    });
  }

  increaseDifficulty() {
    if (this.score === 1) {
      this.currentDifficulty = "normal";
    }

    if (this.score === 3) {
      this.currentDifficulty = "hard";
    }
  }

  getRightMostPipe() {
    let rightMostX = 0;

    this.pipes.getChildren().forEach((pipe) => {
      rightMostX = Math.max(pipe.x, rightMostX);
    });

    return rightMostX;
  }

  setBestScore() {
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem("bestScore", this.score);
    }
  }

  gameOver() {
    // this.bird.x = this.config.initialBirdPosition.x;
    // this.bird.y = this.config.initialBirdPosition.y;
    // this.bird.setVelocityY(0);
    this.physics.pause();
    this.bird.play("dead");
    this.bird.setTint(0xff0000); // Cambia el color del pájaro a rojo

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      callbackScope: this,
      loop: false,
    });

    this.setBestScore();
  }

  flap() {
    if (this.isPaused) return;
    this.bird.setVelocityY(-this.flapVelocity);
  }

  increaseScore() {
    this.score += 1;
    this.scoreText.setText(`Score: ${this.score}`);
  }
}

export default PlayScene;
