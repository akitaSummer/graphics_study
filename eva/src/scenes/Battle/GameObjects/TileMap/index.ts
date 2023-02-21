import { GameObject } from "@eva/eva.js";
import { Text } from "@eva/plugin-renderer-text";
import { Render } from "@eva/plugin-renderer-render";
import { TileMapManager } from "./manager";

const TileMap = () => {
  const go = new GameObject("TileMap");

  go.addComponent(new TileMapManager());

  go.addComponent(
    new Render({
      zIndex: 0,
      sortableChildren: true,
    })
  );

  return go;
};

export default TileMap;
