import * as PIXI from "pixi.js";
import { ShockwaveFilter } from "pixi-filters";

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  background: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
});

document.body.appendChild(app.view as unknown as HTMLElement);

const sprite = PIXI.Sprite.from("/bg.jpg");

sprite.width = app.screen.width;
sprite.height = app.screen.height;

app.stage.addChild(sprite);

const text = new PIXI.Text("Hello World", {
  fontFamily: "Arial",
  fontSize: 36,
  fill: 0xff0000,
  align: "center",
  dropShadow: true,
  dropShadowColor: "#000000",
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 2,
  dropShadowDistance: 2,
});

text.x = app.screen.width / 2;
text.y = app.screen.height / 2;

text.anchor.set(0.5);

app.stage.addChild(text);

const displacementSprite = PIXI.Sprite.from("/water.jpg");
displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
displacementSprite.scale.set(0.5, 0.5);

app.stage.addChild(displacementSprite);

const displacementFilter = new PIXI.DisplacementFilter(displacementSprite);

app.stage.filters = [displacementFilter];

const createWave = (waveFilter: ShockwaveFilter, resetTime: number) => {
  waveFilter.time += 0.01;

  if (waveFilter.time > resetTime) {
    waveFilter.time = 0;
    waveFilter.center = [
      Math.random() * app.screen.width,
      Math.random() * app.screen.height,
    ];
  }
};

for (let i = 0; i < 3; i++) {
  const shockwaveFilter = new ShockwaveFilter(
    [Math.random() * app.screen.width, Math.random() * app.screen.height],
    {
      radius: 160,
      wavelength: 65,
      amplitude: 105,
      speed: 400,
      brightness: 10,
    },
    0
  );

  app.stage.filters.push(shockwaveFilter);

  app.ticker.add((delta) => {
    createWave(shockwaveFilter, 1);
  });
}

app.ticker.add((delta) => {
  displacementSprite.x += delta / 2;
  displacementSprite.y += delta / 2;
});

app.view.addEventListener?.("click", (e) => {
  // @ts-ignore
  (app.stage.filters![1] as ShockwaveFilter).center = [e.clientX, e.clientY];
  (app.stage.filters![1] as ShockwaveFilter).time = 0;
});
