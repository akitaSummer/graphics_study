import EntityManager from "@/base/EntityManager";
import DataManager from "@/runtime/DataManager";
import EventManager from "@/runtime/EventManager";
import {
  CONTROLLER_ENUM,
  DIRECTION_ENUM,
  ENTITY_STATE_ENUM,
  EVENT_ENUM,
} from "@/utils/enums";
import { TILE_HEIGHT, TILE_WIDTH } from "@/scenes/Battle/GameObjects/Tile";
import WoodenSkeletonStateMachine from "./stateMechine";

export default class WoodenSkeletonManager extends EntityManager {
  static componentName = "WoodenSkeletonManager";

  x = 7;
  y = 6;

  init = () => {
    this.fsm = this.gameObject.addComponent(new WoodenSkeletonStateMachine());
    this.state = ENTITY_STATE_ENUM.IDLE;
    this.direction = DIRECTION_ENUM.TOP;

    EventManager.Instance.on(
      EVENT_ENUM.PLAYER_MOVE_END,
      this.onChangeDirection,
      this
    );
  };

  start = () => {
    this.onChangeDirection(true);
  };

  onChangeDirection = (init = false) => {
    const { x: playerX, y: playerY } = DataManager.Instance.player!;
    const disX = Math.abs(playerX - this.x);
    const disY = Math.abs(playerY - this.y);
    //确保敌人在初始化的时候调整一次direction
    if (disX === disY && !init) {
      return;
    }

    //第一象限
    if (playerX >= this.x && playerY <= this.y) {
      this.direction = disX >= disY ? DIRECTION_ENUM.RIGHT : DIRECTION_ENUM.TOP;

      //第二象限
    } else if (playerX <= this.x && playerY <= this.y) {
      this.direction = disX >= disY ? DIRECTION_ENUM.LEFT : DIRECTION_ENUM.TOP;

      //第三象限
    } else if (playerX <= this.x && playerY >= this.y) {
      this.direction =
        disX >= disY ? DIRECTION_ENUM.LEFT : DIRECTION_ENUM.BOTTOM;

      //第四象限
    } else if (playerX >= this.x && playerY >= this.y) {
      this.direction =
        disX >= disY ? DIRECTION_ENUM.RIGHT : DIRECTION_ENUM.BOTTOM;
    }
  };
}
