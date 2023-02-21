import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/utils/constants";
import { Scene, GameObject } from "@eva/eva.js";

import { BattleManager } from "./manager";

import BackgroundColor from "./GameObjects/BackgroundColor";
import Footer from "./GameObjects/Footer";
import Controller from "./GameObjects/Controller";
import TileMap from "./GameObjects/TileMap";

const BattleScene = () => {
  const scene = new Scene("BattleScene", {
    size: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    },
  });

  scene.addChild(BackgroundColor());
  scene.addChild(Controller());

  const stage = new GameObject("stage");
  stage.addComponent(new BattleManager());
  scene.addChild(stage);

  scene.addChild(Footer());

  return scene;
};

export default BattleScene;
