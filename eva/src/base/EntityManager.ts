import { TILE_HEIGHT, TILE_WIDTH } from "@/scenes/Battle/GameObjects/Tile";
import {
  DIRECTION_ENUM,
  DIRECTION_ORDER_ENUM,
  ENTITY_STATE_ENUM,
  PARAMS_NAME_ENUM,
} from "@/utils/enums";
import { Component } from "@eva/eva.js";
import StateMachine from "./StateMachine";

export const ENTITY_WIDTH = 128;
export const ENTITY_HEIGHT = 128;

export default abstract class EntityManager extends Component {
  static componentName: string = "EntityManager";

  x: number = 0;
  y: number = 0;
  private _direction: DIRECTION_ENUM = DIRECTION_ENUM.TOP;
  private _state: ENTITY_STATE_ENUM = ENTITY_STATE_ENUM.IDLE;
  fsm?: StateMachine;

  get direction() {
    return this._direction;
  }

  set direction(direction: DIRECTION_ENUM) {
    this._direction = direction;
    this.fsm?.setParams(
      PARAMS_NAME_ENUM.DIRECTION,
      DIRECTION_ORDER_ENUM[direction]
    );
  }

  get state() {
    return this._state;
  }

  set state(state: ENTITY_STATE_ENUM) {
    this._state = state;
    this.fsm?.setParams(state, true);
  }

  update = () => {
    this.gameObject.transform.position.x =
      this.x * TILE_WIDTH - TILE_WIDTH * 1.5;
    this.gameObject.transform.position.y =
      this.y * TILE_HEIGHT - TILE_HEIGHT * 1.5;
  };
}
