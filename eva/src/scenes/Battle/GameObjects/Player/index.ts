import { ENTITY_HEIGHT, ENTITY_WIDTH } from "@/base/EntityManager";
import { GameObject } from "@eva/eva.js";
import { Render } from "@eva/plugin-renderer-render";
import PlayerManager from "./Script/manager";

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
