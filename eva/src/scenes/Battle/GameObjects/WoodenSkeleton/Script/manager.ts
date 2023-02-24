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

    EventManager.Instance.on(EVENT_ENUM.ATTACK_ENEMY, this.onDead, this);

    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack, this);
  };

  start = () => {
    this.onChangeDirection(true);
  };

  onChangeDirection = (init = false) => {
    if (
      this.state === ENTITY_STATE_ENUM.DEATH ||
      !DataManager.Instance.player
    ) {
      return;
    }
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

  onAttack = () => {
    if (this.state === ENTITY_STATE_ENUM.DEATH) {
      return;
    }

    const {
      targetX: playerX,
      targetY: playerY,
      state: playerState,
    } = DataManager.Instance.player!;
    if (
      ((playerX === this.x && Math.abs(playerY - this.y) <= 1) ||
        (playerY === this.y && Math.abs(playerX - this.x) <= 1)) &&
      playerState !== ENTITY_STATE_ENUM.DEATH &&
      playerState !== ENTITY_STATE_ENUM.AIRDEATH
    ) {
      this.state = ENTITY_STATE_ENUM.ATTACK;
      EventManager.Instance.emit(
        EVENT_ENUM.ATTACK_PLAYER,
        ENTITY_STATE_ENUM.DEATH
      );
    }
  };

  onDead(id: string) {
    if (this.state === ENTITY_STATE_ENUM.DEATH) {
      return;
    }
    if (this.id === id) {
      this.state = ENTITY_STATE_ENUM.DEATH;
    }
  }
}
