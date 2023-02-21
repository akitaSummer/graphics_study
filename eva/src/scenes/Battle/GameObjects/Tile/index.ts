import { TILE_TYPE_ENUM } from "@/utils/enums";
import { GameObject } from "@eva/eva.js";
import { Render } from "@eva/plugin-renderer-render";
import { Sprite } from "@eva/plugin-renderer-sprite";

export const TILE_WIDTH = 32;
export const TILE_HEIGHT = 32;

const Tile = (type: TILE_TYPE_ENUM, imgSrc: string, i: number, j: number) => {
  const go = new GameObject("tile", {
    size: {
      width: TILE_WIDTH,
      height: TILE_HEIGHT,
    },
    position: {
      x: i * TILE_WIDTH,
      y: j * TILE_HEIGHT,
    },
  });

  go.addComponent(
    new Sprite({
      resource: "tile",
      spriteName: imgSrc,
    })
  );

  go.addComponent(
    new Render({
      zIndex: 0,
    })
  );

  return go;
};

export default Tile;
