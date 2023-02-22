import EntityManager from "@/base/EntityManager";
import EventManager from "@/runtime/EventManager";
import {
  CONTROLLER_ENUM,
  DIRECTION_ENUM,
  ENTITY_STATE_ENUM,
  EVENT_ENUM,
} from "@/utils/enums";
import { TILE_HEIGHT, TILE_WIDTH } from "../../Tile";
import PlayerStateMachine from "./stateMechine";

export default class PlayerManager extends EntityManager {
  static componentName = "PlayerManager";

  targetX: number = 0;
  targetY: number = 0;
  readonly speed = 1 / 10;
  declare fsm?: PlayerStateMachine;

  init = () => {
    this.fsm = this.gameObject.addComponent(new PlayerStateMachine());
    this.state = ENTITY_STATE_ENUM.IDLE;
    EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.move, this);
  };

  update = () => {
    this.updateXY();
    this.gameObject.transform.position.x =
      this.x * TILE_WIDTH - TILE_WIDTH * 1.5;
    this.gameObject.transform.position.y =
      this.y * TILE_HEIGHT - TILE_HEIGHT * 1.5;
  };

  updateXY = () => {
    if (this.targetX < this.x) {
      this.x -= this.speed;
    } else if (this.targetX > this.x) {
      this.x += this.speed;
    }

    if (this.targetY < this.y) {
      this.y -= this.speed;
    } else if (this.targetY > this.y) {
      this.y += this.speed;
    }

    if (
      Math.abs(this.targetX - this.x) < 0.01 &&
      Math.abs(this.targetY - this.y) < 0.01
    ) {
      this.x = this.targetX;
      this.y = this.targetY;
    }
  };

  move = (type: CONTROLLER_ENUM) => {
    switch (type) {
      case CONTROLLER_ENUM.TOP:
        this.targetY -= 1;
        break;
      case CONTROLLER_ENUM.BOTTOM:
        this.targetY += 1;
        break;
      case CONTROLLER_ENUM.LEFT:
        this.targetX -= 1;
        break;
      case CONTROLLER_ENUM.RIGHT:
        this.targetX += 1;
        break;
      case CONTROLLER_ENUM.TURNLEFT:
        {
          switch (this.direction) {
            case DIRECTION_ENUM.TOP:
              this.direction = DIRECTION_ENUM.LEFT;
              break;
            case DIRECTION_ENUM.LEFT:
              this.direction = DIRECTION_ENUM.BOTTOM;
              break;
            case DIRECTION_ENUM.BOTTOM:
              this.direction = DIRECTION_ENUM.RIGHT;
              break;
            case DIRECTION_ENUM.RIGHT:
              this.direction = DIRECTION_ENUM.TOP;
              break;
            default:
              break;
          }
          this.state = ENTITY_STATE_ENUM.TURNLEFT;
        }
        break;
      case CONTROLLER_ENUM.TURNRIGHT:
        {
          switch (this.direction) {
            case DIRECTION_ENUM.TOP:
              this.direction = DIRECTION_ENUM.RIGHT;
              break;
            case DIRECTION_ENUM.RIGHT:
              this.direction = DIRECTION_ENUM.BOTTOM;
              break;
            case DIRECTION_ENUM.BOTTOM:
              this.direction = DIRECTION_ENUM.LEFT;
              break;
            case DIRECTION_ENUM.LEFT:
              this.direction = DIRECTION_ENUM.TOP;
              break;
            default:
              break;
          }
          this.state = ENTITY_STATE_ENUM.TURNRIGHT;
        }
        break;
      default:
        break;
    }
  };
}
