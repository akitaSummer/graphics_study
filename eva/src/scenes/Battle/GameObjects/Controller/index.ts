import { GameObject } from "@eva/eva.js";
import { Render } from "@eva/plugin-renderer-render";
import { CONTROLLER_ENUM } from "@/utils/enums";

import Button from "./Button";

const Controller = () => {
  const go = new GameObject("controller", {
    position: {
      x: 0,
      y: -140,
    },
    origin: {
      x: 0.5,
      y: 1,
    },
    anchor: {
      x: 0.5,
      y: 1,
    },
  });

  go.addChild(Button(CONTROLLER_ENUM.TURNLEFT, 1, "q"));
  go.addChild(Button(CONTROLLER_ENUM.LEFT, 2, "a"));
  go.addChild(Button(CONTROLLER_ENUM.TOP, 3, "w"));
  go.addChild(Button(CONTROLLER_ENUM.BOTTOM, 4, "s"));
  go.addChild(Button(CONTROLLER_ENUM.TURNRIGHT, 5, "e"));
  go.addChild(Button(CONTROLLER_ENUM.RIGHT, 6, "d"));

  go.addComponent(
    new Render({
      zIndex: 0,
    })
  );

  return go;
};

export default Controller;
