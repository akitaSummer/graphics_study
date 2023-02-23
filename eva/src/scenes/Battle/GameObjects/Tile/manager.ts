import { TILE_TYPE_ENUM } from "@/utils/enums";
import { Component } from "@eva/eva.js";

export default class TileManager extends Component {
  static componentName: string = "TileManager";
  moveable: boolean;
  turnable: boolean;
  constructor(public type: TILE_TYPE_ENUM) {
    super();
    switch (type) {
      case TILE_TYPE_ENUM.WALL_COLUMN:
      case TILE_TYPE_ENUM.WALL_LEFT_BOTTOM:
      case TILE_TYPE_ENUM.WALL_LEFT_TOP:
      case TILE_TYPE_ENUM.WALL_RIGHT_BOTTOM:
      case TILE_TYPE_ENUM.WALL_RIGHT_TOP:
      case TILE_TYPE_ENUM.WALL_ROW:
        this.moveable = false;
        this.turnable = false;
        break;
      case TILE_TYPE_ENUM.CLIFF_CENTER:
      case TILE_TYPE_ENUM.CLIFF_LEFT:
      case TILE_TYPE_ENUM.CLIFF_RIGHT:
        this.moveable = true;
        this.turnable = false;
        break;
      default:
        this.moveable = true;
        this.turnable = true;
        break;
    }
  }

  init = (type: TILE_TYPE_ENUM) => {};
}
