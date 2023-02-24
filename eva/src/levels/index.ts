import {
  DIRECTION_ENUM,
  ENTITY_STATE_ENUM,
  ENTITY_TYPE_ENUM,
  TILE_TYPE_ENUM,
} from "@/utils/enums";
import level1 from "./level01";
import level2 from "./level02";

export interface ITile {
  src: number | null;
  type: TILE_TYPE_ENUM | null;
}

export interface ILevel {
  mapInfo: ITile[][];
  door: IEntity;
}

const levels: Record<string, ILevel> = {
  level1,
  level2,
};

export interface IEntity {
  x: number;
  y: number;
  direction: DIRECTION_ENUM;
  state: ENTITY_STATE_ENUM;
  type: ENTITY_TYPE_ENUM;
}

export default levels;
