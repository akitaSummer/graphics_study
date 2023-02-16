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
