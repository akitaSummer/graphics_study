import { GameObject } from "@eva/eva.js";
import { Graphics } from "@eva/plugin-renderer-graphics";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "@/utils/constants";

const BG_COLOR = 0x140b28;

const BackgroundColor = () => {
  const go = new GameObject("backgroundColor");

  const outterGraphics = go.addComponent(new Graphics());

  outterGraphics.graphics.beginFill(BG_COLOR, 1);
  outterGraphics.graphics.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  outterGraphics.graphics.endFill();

  return go;
};

export default BackgroundColor;
