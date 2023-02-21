import { TILE_TYPE_ENUM } from "@/utils/enums";
import level1 from "./level01";

export interface ITile {
  src: number | null;
  type: TILE_TYPE_ENUM | null;
}

export interface ILevel {
  mapInfo: ITile[][];
}

const levels: Record<string, ILevel> = {
  level1,
};

export default levels;
