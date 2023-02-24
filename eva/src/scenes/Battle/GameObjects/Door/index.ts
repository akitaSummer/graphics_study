import { GameObject } from "@eva/eva.js";
import { Render } from "@eva/plugin-renderer-render";
import { ENTITY_HEIGHT, ENTITY_WIDTH } from "@/Base/EntityManager";
import DoorManager from "./Script/manager";

const Door = () => {
  const go = new GameObject("door", {
    size: { width: ENTITY_WIDTH, height: ENTITY_HEIGHT },
  });

  go.addComponent(new DoorManager());

  go.addComponent(
    new Render({
      zIndex: 2,
    })
  );
  return go;
};

export default Door;
