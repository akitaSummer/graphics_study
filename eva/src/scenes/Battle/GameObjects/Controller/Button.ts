import { GameObject } from "@eva/eva.js";
import { Render } from "@eva/plugin-renderer-render";
import { Sprite } from "@eva/plugin-renderer-sprite";
import { Transition } from "@eva/plugin-transition";
import { Event, HIT_AREA_TYPE } from "@eva/plugin-renderer-event";

const CTRL_WIDTH = 70;
const CTRL_HEIGHT = 60;
const GAP_HEIGHT = 3;

const getPosition = (index: number) => {
  const xAxis = Math.floor((index - 1) / 2);
  const yAxis = (index - 1) % 2;
  return {
    x: (xAxis - 1) * CTRL_WIDTH,
    y: yAxis * (CTRL_HEIGHT + GAP_HEIGHT),
  };
};

const Button = (index: number, key: string) => {
  const go = new GameObject("button", {
    size: { width: CTRL_WIDTH, height: CTRL_HEIGHT },
    position: getPosition(index),
    origin: {
      x: 0.5,
      y: 0.5,
    },
    anchor: {
      x: 0.5,
      y: 1,
    },
  });

  // 使用雪碧图
  go.addComponent(
    new Sprite({
      resource: "ctrl",
      spriteName: `ctrl (${index}).png`,
    })
  );

  const animation = go.addComponent(new Transition());
  animation.group = {
    big: [
      {
        name: "scale.x",
        component: go.transform,
        values: [
          {
            time: 0,
            value: 0.9,
            tween: "ease-out",
          },
          {
            time: 100,
            value: 1,
            tween: "ease-in",
          },
        ],
      },
      {
        name: "scale.y",
        component: go.transform,
        values: [
          {
            time: 0,
            value: 0.9,
            tween: "ease-out",
          },
          {
            time: 100,
            value: 1,
            tween: "ease-in",
          },
        ],
      },
    ],
    small: [
      {
        name: "scale.x",
        component: go.transform,
        values: [
          {
            time: 0,
            value: 1,
            tween: "ease-out",
          },
          {
            time: 100,
            value: 0.9,
            tween: "ease-in",
          },
        ],
      },
      {
        name: "scale.y",
        component: go.transform,
        values: [
          {
            time: 0,
            value: 1,
            tween: "ease-out",
          },
          {
            time: 100,
            value: 0.9,
            tween: "ease-in",
          },
        ],
      },
    ],
  };

  let keydown = false;

  const event = go.addComponent(new Event());

  const startHandler = () => {
    animation.play("small", 1);
  };

  event.on("touchstart", () => !keydown && startHandler);

  const endHandler = () => {
    animation.play("big", 1);
  };

  event.on("touchend", () => !keydown && endHandler);
  // 不在物体上时
  event.on("touchendoutside", () => !keydown && endHandler);

  window.addEventListener("keydown", (e) => {
    if (e.key === key) {
      startHandler();
      keydown = true;
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === key) {
      endHandler();
      keydown = false;
    }
  });

  go.addComponent(
    new Render({
      zIndex: 0,
    })
  );

  return go;
};

export default Button;
