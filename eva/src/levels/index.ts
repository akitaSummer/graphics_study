import { TILE_TYPE_ENUM } from "@/utils/enums";
import level1 from "./level01";
import level2 from "./level02";

export interface ITile {
  src: number | null;
  type: TILE_TYPE_ENUM | null;
}

export interface ILevel {
  mapInfo: ITile[][];
}

const levels: Record<string, ILevel> = {
  level1,
  level2,
};

export default levels;
