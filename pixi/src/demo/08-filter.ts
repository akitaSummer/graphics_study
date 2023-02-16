import * as PIXI from "pixi.js";
import { OutlineFilter, GlowFilter } from "pixi-filters";

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  background: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
});

document.body.appendChild(app.view as unknown as HTMLElement);

const vite = PIXI.Sprite.from("/vite.svg");

vite.x = app.screen.width / 2;
vite.y = app.screen.height / 2;

app.stage.addChild(vite);

const blurFilter = new PIXI.BlurFilter();

blurFilter.blur = 10;

vite.filters = [blurFilter];

vite.interactive = true;
vite.on("click", () => {
  console.log("sprite");
});
vite.on("pointerenter", () => {
  blurFilter.blur = 0;
});
vite.on("pointerout", () => {
  blurFilter.blur = 10;
});

const outlineFilter = new OutlineFilter(5, 0xfff000);

vite.filters.push(outlineFilter);

const glowFilter = new GlowFilter({
  distance: 50,
  outerStrength: 1,
  innerStrength: 0,
  color: 0xff0000,
  quality: 0.5,
});

vite.filters.push(glowFilter);
