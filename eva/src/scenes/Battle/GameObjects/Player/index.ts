import { GameObject } from "@eva/eva.js";
import { Render } from "@eva/plugin-renderer-render";
import PlayerManager from "./Script/manager";

export const ENTITY_WIDTH = 128;
export const ENTITY_HEIGHT = 128;

const Player = () => {
  const go = new GameObject("player", {
    size: { width: ENTITY_WIDTH, height: ENTITY_HEIGHT },
  });

  go.addComponent(new PlayerManager());

  go.addComponent(
    new Render({
      zIndex: 2,
    })
  );

  return go;
};

export default Player;
