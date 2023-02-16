import * as PIXI from "pixi.js";

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  background: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
});

document.body.appendChild(app.view as unknown as HTMLElement);

const text = new PIXI.Text("Hello World", {
  fontFamily: "Arial",
  fontSize: 36,
  fill: 0xff0000,
  align: "center",
});

text.x = app.screen.width / 2;
text.y = app.screen.height / 2;

text.anchor.set(0.5);

app.stage.addChild(text);

const vite = PIXI.Sprite.from("/vite.svg");

vite.x = app.screen.width / 4;
vite.y = app.screen.height / 4;

app.stage.addChild(vite);

const sprite = PIXI.Sprite.from("/bg.jpg");

sprite.width = app.screen.width;
sprite.height = app.screen.height;

sprite.mask = vite;

app.stage.addChild(sprite);
