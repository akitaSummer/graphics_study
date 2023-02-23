import { ENTITY_HEIGHT, ENTITY_WIDTH } from "@/base/EntityManager";
import { GameObject } from "@eva/eva.js";
import { Render } from "@eva/plugin-renderer-render";
import WoodenSkeletonManager from "./Script/manager";

const WoodenSkeleton = () => {
  const go = new GameObject("woodenSkeleton", {
    size: { width: ENTITY_WIDTH, height: ENTITY_HEIGHT },
  });

  go.addComponent(new WoodenSkeletonManager());

  go.addComponent(
    new Render({
      zIndex: 2,
    })
  );

  return go;
};

export default WoodenSkeleton;
