import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/utils/constants";
import { Scene, GameObject } from "@eva/eva.js";
import { Graphics } from "@eva/plugin-renderer-graphics";
import { Text } from "@eva/plugin-renderer-text";

import BackgroundColor from "./GameObjects/BackgroundColor";
import Footer from "./GameObjects/Footer";
import Controller from "./GameObjects/Controller";

const BattleScene = () => {
  const scene = new Scene("BattleScene", {
    size: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    },
  });

  scene.addChild(BackgroundColor());
  scene.addChild(Controller());

  scene.addChild(Footer());

  return scene;
};

export default BattleScene;
