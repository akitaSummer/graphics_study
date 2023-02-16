import * as PIXI from "pixi.js";

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  background: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
});

document.body.appendChild(app.view as unknown as HTMLElement);

const texture = PIXI.Texture.from("/vite.svg");

const sprite = new PIXI.Sprite(texture);

// 设置锚点
sprite.anchor.set(0.5);

sprite.x = app.screen.width / 2;
sprite.y = app.screen.height / 2;

sprite.rotation = Math.PI / 4;

sprite.alpha = 0.5;

app.stage.addChild(sprite);

// ticker
app.ticker.add((delta) => {
  sprite.rotation += 0.01 * delta;
});

PIXI.Assets.addBundle("scene_1", {
  cloud: "/images/cloud/cloud.png",
  ghost: "/images/ghost/ghost.png",
  obstacle1: "/images/obstacle1/obstacle1.png",
});

PIXI.Assets.addBundle("scene_2", {
  obstacle2: "/images/obstacle2/obstacle2.png",
});

const textures = await PIXI.Assets.loadBundle("scene_1");

const cloud = new PIXI.Sprite(textures.cloud);

// 设置锚点
cloud.anchor.set(0.5);

cloud.x = app.screen.width / 8;
cloud.y = app.screen.height / 8;

cloud.alpha = 0.5;

app.stage.addChild(cloud);

const container = new PIXI.Container();

const ghost = new PIXI.Sprite(textures.ghost);

// 设置锚点
ghost.anchor.set(0.5);

ghost.x = app.screen.width / 4;
ghost.y = app.screen.height / 4;

ghost.alpha = 0.5;

container.addChild(ghost);

const obstacle1 = new PIXI.Sprite(textures.obstacle1);

// 设置锚点
obstacle1.anchor.set(0.5);

obstacle1.x = app.screen.width / 6;
obstacle1.y = app.screen.height / 6;

obstacle1.alpha = 0.5;

container.addChild(obstacle1);

container.scale.set(1.5, 1.5);

app.stage.addChild(container);
