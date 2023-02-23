import { Game, resource } from "@eva/eva.js";
import { RendererSystem } from "@eva/plugin-renderer";
import { ImgSystem } from "@eva/plugin-renderer-img";
import { EventSystem } from "@eva/plugin-renderer-event";
import { SpriteAnimationSystem } from "@eva/plugin-renderer-sprite-animation";
import { RenderSystem } from "@eva/plugin-renderer-render";
import { TransitionSystem } from "@eva/plugin-transition";
import { GraphicsSystem } from "@eva/plugin-renderer-graphics";
import { TextSystem } from "@eva/plugin-renderer-text";
import { SpriteSystem } from "@eva/plugin-renderer-sprite";

import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/utils/constants";
import BattleScene from "@/scenes/Battle";

import resources from "./resources";

resource.addResource(resources);

const game = new Game({
  systems: [
    new RendererSystem({
      canvas: document.querySelector("#canvas")! as HTMLCanvasElement,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      antialias: true,
      enableScroll: false,
    }),
    new ImgSystem(),
    new TransitionSystem(),
    new SpriteAnimationSystem(),
    new RenderSystem(),
    new SpriteSystem(),
    new EventSystem(),
    new GraphicsSystem(),
    new TextSystem(),
  ],
});

game.loadScene({
  scene: BattleScene(),
});
