import * as PIXI from "pixi.js";
import { ShockwaveFilter } from "pixi-filters";

let isGaming = false;
let isGameOver = false;
let score = 0;
let jumpVelocity = 20;
let gravity = 0.9;

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  background: 0xffffff,
  resolution: window.devicePixelRatio || 1,
});

document.body.appendChild(app.view as unknown as HTMLElement);

const container = new PIXI.Container();

app.stage.addChild(container);

const baseTexture = PIXI.BaseTexture.from("/dino.png");

const dinoTexture = new PIXI.Texture(
  baseTexture,
  new PIXI.Rectangle(75, 0, 88, 100)
);

const dino = new PIXI.Sprite(dinoTexture);
dino.visible = false;

container.addChild(dino);

const runTextures: PIXI.Texture<PIXI.Resource>[] = [
  new PIXI.Texture(baseTexture, new PIXI.Rectangle(1860, 0, 82, 100)),
  new PIXI.Texture(baseTexture, new PIXI.Rectangle(1948, 0, 82, 100)),
];

const runAnimation = new PIXI.AnimatedSprite(runTextures);

runAnimation.x = 60;
runAnimation.y = window.innerHeight - 50 - 60;

runAnimation.animationSpeed = 0.1;

runAnimation.play();

runAnimation.visible = false;

container.addChild(runAnimation);

const jumpTexture = new PIXI.Texture(
  baseTexture,
  new PIXI.Rectangle(1680, 0, 82, 100)
);

const jumpSprite = new PIXI.Sprite(jumpTexture);
jumpSprite.x = 60;
jumpSprite.y = window.innerHeight - 50 - 60;
jumpSprite.visible = false;

container.addChild(jumpSprite);

const groundTexture = new PIXI.Texture(
  baseTexture,
  new PIXI.Rectangle(50, 100, 2300, 30)
);

const groundSprite = new PIXI.TilingSprite(
  groundTexture,
  window.innerWidth,
  30
);

groundSprite.position.set(0, window.innerHeight - 50);

container.addChild(groundSprite);

const cactusTexture = new PIXI.Texture(
  baseTexture,
  new PIXI.Rectangle(515, 0, 30, 60)
);
const cactusSprite = new PIXI.Sprite(cactusTexture);
cactusSprite.x = window.innerWidth / 2;
cactusSprite.y = window.innerHeight - 50 - 40;

container.addChild(cactusSprite);

let startText = new PIXI.Text("开始游戏", {
  fontFamily: "Arial",
  fontSize: 36,
  fill: 0x333333,
  align: "center",
});

startText.x = window.innerWidth / 2;
startText.y = window.innerHeight / 2;
startText.anchor.set(0.5);
startText.interactive = true;

const playGame = () => {
  isGaming = true;
  runAnimation.visible = true;
};

const gameOver = () => {
  isGameOver = true;
  isGaming = false;
};

const reset = () => {
  isGameOver = false;
  isGaming = true;
  cactusSprite.x = window.innerWidth / 2;
  cactusSprite.y = window.innerHeight - 50 - 40;
};

startText.on("click", () => {
  if (isGameOver) {
    reset();
  } else {
    playGame();
  }
});
container.addChild(startText);

app.ticker.add((delta) => {
  if (isGaming) {
    groundSprite.tilePosition.x -= 10;
    cactusSprite.x -= 10;
    if (cactusSprite.x < -30) {
      cactusSprite.x = window.innerWidth;
      score++;
    }
  }

  if (jumpSprite.visible) {
    jumpVelocity -= gravity;
    jumpSprite.y -= jumpVelocity;

    if (jumpSprite.y > window.innerHeight - 50 - 60) {
      jumpSprite.y = window.innerHeight - 50 - 60;
      jumpVelocity = 20;
      jumpSprite.visible = false;
      runAnimation.visible = true;
    }
  }

  if (
    jumpSprite.y > cactusSprite.y - 60 &&
    cactusSprite.x < jumpSprite.x + 60 &&
    cactusSprite.x > jumpSprite.x - 60
  ) {
    gameOver();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && isGaming) {
    runAnimation.visible = false;
    jumpSprite.visible = true;
    jumpVelocity = 20;
  }
});
