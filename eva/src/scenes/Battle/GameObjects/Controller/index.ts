import { GameObject } from "@eva/eva.js";
import { Text } from "@eva/plugin-renderer-text";
import { Render } from "@eva/plugin-renderer-render";

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

  go.addChild(Button(1, "q"));
  go.addChild(Button(2, "a"));
  go.addChild(Button(3, "w"));
  go.addChild(Button(4, "s"));
  go.addChild(Button(5, "e"));
  go.addChild(Button(6, "d"));

  go.addComponent(
    new Render({
      zIndex: 0,
    })
  );

  return go;
};

export default Controller;
