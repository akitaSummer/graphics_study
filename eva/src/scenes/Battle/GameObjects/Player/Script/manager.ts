import EntityManager from "@/base/EntityManager";
import DataManager from "@/runtime/DataManager";
import EventManager from "@/runtime/EventManager";
import {
  CONTROLLER_ENUM,
  DIRECTION_ENUM,
  ENTITY_STATE_ENUM,
  EVENT_ENUM,
  SHAKE_TYPE_ENUM,
} from "@/utils/enums";
import { TILE_HEIGHT, TILE_WIDTH } from "../../Tile";
import PlayerStateMachine from "./stateMechine";

export default class PlayerManager extends EntityManager {
  static componentName = "PlayerManager";

  x = 2;
  y = 8;
  targetX: number = 2;
  targetY: number = 8;
  isMoving: boolean = false;
  readonly speed = 1 / 10;
  declare fsm?: PlayerStateMachine;

  init = () => {
    this.fsm = this.gameObject.addComponent(new PlayerStateMachine());
    this.state = ENTITY_STATE_ENUM.IDLE;
    EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.inputHandler, this);

    EventManager.Instance.on(EVENT_ENUM.ATTACK_PLAYER, this.onDead, this);
  };

  update = () => {
    this.updateXY();
    this.gameObject.transform.position.x =
      this.x * TILE_WIDTH - TILE_WIDTH * 1.5;
    this.gameObject.transform.position.y =
      this.y * TILE_HEIGHT - TILE_HEIGHT * 1.5;
  };

  onDead = (type: ENTITY_STATE_ENUM) => {
    this.state = type;
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
      Math.abs(this.targetY - this.y) < 0.01 &&
      this.isMoving
    ) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.isMoving = false;
      EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END);
    }
  };

  inputHandler = (direction: CONTROLLER_ENUM) => {
    if (this.isMoving) {
      return;
    }

    if (
      this.state === ENTITY_STATE_ENUM.DEATH ||
      this.state === ENTITY_STATE_ENUM.AIRDEATH ||
      this.state === ENTITY_STATE_ENUM.ATTACK
    ) {
      return;
    }

    const id = this.willAttack(direction);

    if (id) {
      EventManager.Instance.emit(EVENT_ENUM.RECORD_STEP);
      this.state = ENTITY_STATE_ENUM.ATTACK;
      EventManager.Instance.emit(EVENT_ENUM.ATTACK_ENEMY, id);
      EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END);
      EventManager.Instance.emit(EVENT_ENUM.DOOR_OPEN);
      return;
    }

    //优化成四个方向的震动效果
    if (this.willBlock(direction)) {
      if (direction === CONTROLLER_ENUM.TOP) {
        EventManager.Instance.emit(
          EVENT_ENUM.SCREEN_SHAKE,
          SHAKE_TYPE_ENUM.TOP
        );
      } else if (direction === CONTROLLER_ENUM.BOTTOM) {
        EventManager.Instance.emit(
          EVENT_ENUM.SCREEN_SHAKE,
          SHAKE_TYPE_ENUM.BOTTOM
        );
      } else if (direction === CONTROLLER_ENUM.LEFT) {
        EventManager.Instance.emit(
          EVENT_ENUM.SCREEN_SHAKE,
          SHAKE_TYPE_ENUM.LEFT
        );
      } else if (direction === CONTROLLER_ENUM.RIGHT) {
        EventManager.Instance.emit(
          EVENT_ENUM.SCREEN_SHAKE,
          SHAKE_TYPE_ENUM.RIGHT
        );
      } else if (
        direction === CONTROLLER_ENUM.TURNLEFT &&
        this.direction === DIRECTION_ENUM.TOP
      ) {
        EventManager.Instance.emit(
          EVENT_ENUM.SCREEN_SHAKE,
          SHAKE_TYPE_ENUM.LEFT
        );
      } else if (
        direction === CONTROLLER_ENUM.TURNLEFT &&
        this.direction === DIRECTION_ENUM.LEFT
      ) {
        EventManager.Instance.emit(
          EVENT_ENUM.SCREEN_SHAKE,
          SHAKE_TYPE_ENUM.BOTTOM
        );
      } else if (
        direction === CONTROLLER_ENUM.TURNLEFT &&
        this.direction === DIRECTION_ENUM.BOTTOM
      ) {
        EventManager.Instance.emit(
          EVENT_ENUM.SCREEN_SHAKE,
          SHAKE_TYPE_ENUM.RIGHT
        );
      } else if (
        direction === CONTROLLER_ENUM.TURNLEFT &&
        this.direction === DIRECTION_ENUM.RIGHT
      ) {
        EventManager.Instance.emit(
          EVENT_ENUM.SCREEN_SHAKE,
          SHAKE_TYPE_ENUM.TOP
        );
      } else if (
        direction === CONTROLLER_ENUM.TURNRIGHT &&
        this.direction === DIRECTION_ENUM.TOP
      ) {
        EventManager.Instance.emit(
          EVENT_ENUM.SCREEN_SHAKE,
          SHAKE_TYPE_ENUM.RIGHT
        );
      } else if (
        direction === CONTROLLER_ENUM.TURNRIGHT &&
        this.direction === DIRECTION_ENUM.LEFT
      ) {
        EventManager.Instance.emit(
          EVENT_ENUM.SCREEN_SHAKE,
          SHAKE_TYPE_ENUM.TOP
        );
      } else if (
        direction === CONTROLLER_ENUM.TURNRIGHT &&
        this.direction === DIRECTION_ENUM.BOTTOM
      ) {
        EventManager.Instance.emit(
          EVENT_ENUM.SCREEN_SHAKE,
          SHAKE_TYPE_ENUM.LEFT
        );
      } else if (
        direction === CONTROLLER_ENUM.TURNRIGHT &&
        this.direction === DIRECTION_ENUM.RIGHT
      ) {
        EventManager.Instance.emit(
          EVENT_ENUM.SCREEN_SHAKE,
          SHAKE_TYPE_ENUM.BOTTOM
        );
      }
      return;
    }

    if (this.willBlock(direction)) {
      return;
    }
    this.move(direction);
  };

  /***
   * 检查枪所在方向是否有敌人，有则攻击
   */
  willAttack(inputDirection: CONTROLLER_ENUM) {
    const enemies = DataManager.Instance.enemies.filter(
      (enemy) => enemy.state !== ENTITY_STATE_ENUM.DEATH
    );
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      const { x: enemyX, y: enemyY, id: enemyId } = enemy;
      if (
        this.direction === DIRECTION_ENUM.TOP &&
        inputDirection === CONTROLLER_ENUM.TOP &&
        enemyY === this.targetY - 2 &&
        enemyX === this.x
      ) {
        return enemyId;
      } else if (
        this.direction === DIRECTION_ENUM.BOTTOM &&
        inputDirection === CONTROLLER_ENUM.BOTTOM &&
        enemyY === this.targetY + 2 &&
        enemyX === this.x
      ) {
        return enemyId;
      } else if (
        this.direction === DIRECTION_ENUM.LEFT &&
        inputDirection === CONTROLLER_ENUM.LEFT &&
        enemyX === this.targetX - 2 &&
        enemyY === this.y
      ) {
        return enemyId;
      } else if (
        this.direction === DIRECTION_ENUM.RIGHT &&
        inputDirection === CONTROLLER_ENUM.RIGHT &&
        enemyX === this.targetX + 2 &&
        enemyY === this.y
      ) {
        return enemyId;
      }
    }

    return "";
  }

  move = (type: CONTROLLER_ENUM) => {
    switch (type) {
      case CONTROLLER_ENUM.TOP:
        this.targetY -= 1;
        this.isMoving = true;
        break;
      case CONTROLLER_ENUM.BOTTOM:
        this.targetY += 1;
        this.isMoving = true;
        break;
      case CONTROLLER_ENUM.LEFT:
        this.targetX -= 1;
        this.isMoving = true;
        break;
      case CONTROLLER_ENUM.RIGHT:
        this.targetX += 1;
        this.isMoving = true;
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
        EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END);
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
        EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END);
        break;
      default:
        break;
    }
  };

  /***
   * 判断角色是否能按预期进行移动
   */
  willBlock = (type: CONTROLLER_ENUM) => {
    const { targetX: x, targetY: y, direction } = this;
    const { tileInfo: tileInfo } = DataManager.Instance;
    const enemies = DataManager.Instance.enemies.filter(
      (enemy) => enemy.state !== ENTITY_STATE_ENUM.DEATH
    );
    const {
      x: doorX,
      y: doorY,
      state: doorState,
    } = DataManager.Instance.door ?? {};
    // const bursts: BurstManager[] = DataManager.Instance.bursts.filter(
    //   (burst: BurstManager) => burst.state !== ENTITY_STATE_ENUM.DEATH
    // );
    const bursts: any[] = [];

    const { mapRowCount: row, mapColumnCount: column } = DataManager.Instance;

    //按钮方向——向上
    if (type === CONTROLLER_ENUM.TOP) {
      const playerNextY = y - 1;

      //玩家方向——向上
      if (direction === DIRECTION_ENUM.TOP) {
        //判断是否超出地图
        if (playerNextY < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
          return true;
        }

        // 武器下一个瓦片位置
        const weaponNextY = y - 2;
        const nextPlayerTile = tileInfo[x]?.[playerNextY];
        const nextWeaponTile = tileInfo[x]?.[weaponNextY];

        //判断门
        if (
          ((doorX === x && doorY === playerNextY) ||
            (doorX === x && doorY === weaponNextY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (
            (enemyX === x && enemyY === weaponNextY) ||
            (enemyX === x && enemyY === playerNextY)
          ) {
            this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === x && burst.y === playerNextY) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
          return true;
        }

        //玩家方向——向下
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        //判断是否超出地图
        if (playerNextY < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK;
          return true;
        }

        const weaponNextY = y;
        const nextPlayerTile = tileInfo[x]?.[playerNextY];
        const nextWeaponTile = tileInfo[x]?.[weaponNextY];

        //判断门
        if (
          ((doorX === x && doorY === playerNextY) ||
            (doorX === x && doorY === weaponNextY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (enemyX === x && enemyY === playerNextY) {
            this.state = ENTITY_STATE_ENUM.BLOCKBACK;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === x && burst.y === playerNextY) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK;
          return true;
        }

        //玩家方向——向左
      } else if (direction === DIRECTION_ENUM.LEFT) {
        //判断是否超出地图
        if (playerNextY < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
          return true;
        }

        const weaponNextX = x - 1;
        const weaponNextY = y - 1;
        const nextPlayerTile = tileInfo[x]?.[playerNextY];
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

        //判断门
        if (
          ((doorX === x && doorY === playerNextY) ||
            (doorX === weaponNextX && doorY === weaponNextY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (
            (enemyX === x && enemyY === playerNextY) ||
            (enemyX === weaponNextX && enemyY === weaponNextY)
          ) {
            this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === x && burst.y === playerNextY) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
          return true;
        }

        //玩家方向——向右
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        //判断是否超出地图
        if (playerNextY < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
          return true;
        }

        const weaponNextX = x + 1;
        const weaponNextY = y - 1;
        const nextPlayerTile = tileInfo[x]?.[playerNextY];
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

        //判断门
        if (
          ((doorX === x && doorY === playerNextY) ||
            (doorX === weaponNextX && doorY === weaponNextY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (
            (enemyX === x && enemyY === playerNextY) ||
            (enemyX === weaponNextX && enemyY === weaponNextY)
          ) {
            this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === x && burst.y === playerNextY) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
          return true;
        }
      }

      //按钮方向——向下
    } else if (type === CONTROLLER_ENUM.BOTTOM) {
      const playerNextY = y + 1;

      //玩家方向——向上
      if (direction === DIRECTION_ENUM.TOP) {
        if (playerNextY > column - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK;

          return true;
        }

        const weaponNextY = y;
        const nextPlayerTile = tileInfo[x]?.[playerNextY];
        const nextWeaponTile = tileInfo[x]?.[weaponNextY];

        //判断门
        if (
          ((doorX === x && doorY === playerNextY) ||
            (doorX === x && doorY === weaponNextY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (enemyX === x && enemyY === playerNextY) {
            this.state = ENTITY_STATE_ENUM.BLOCKBACK;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === x && burst.y === playerNextY) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK;
          return true;
        }

        //玩家方向——向下
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        if (playerNextY > column - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT;

          return true;
        }

        const weaponNextY = y + 2;
        const nextPlayerTile = tileInfo[x]?.[playerNextY];
        const nextWeaponTile = tileInfo[x]?.[weaponNextY];

        //判断门
        if (
          ((doorX === x && doorY === playerNextY) ||
            (doorX === x && doorY === weaponNextY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (
            (enemyX === x && enemyY === weaponNextY) ||
            (enemyX === x && enemyY === playerNextY)
          ) {
            this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === x && burst.y === playerNextY) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
          return true;
        }

        //玩家方向——向左
      } else if (direction === DIRECTION_ENUM.LEFT) {
        if (playerNextY > column - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT;

          return true;
        }

        const weaponNextX = x - 1;
        const weaponNextY = y + 1;
        const nextPlayerTile = tileInfo[x]?.[playerNextY];
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

        //判断门
        if (
          ((doorX === x && doorY === playerNextY) ||
            (doorX === weaponNextX && doorY === weaponNextY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (
            (enemyX === x && enemyY === playerNextY) ||
            (enemyX === weaponNextX && enemyY === weaponNextY)
          ) {
            this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === x && burst.y === playerNextY) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
          return true;
        }

        //玩家方向——向右
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        if (playerNextY > column - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;

          return true;
        }

        const weaponNextX = x + 1;
        const weaponNextY = y + 1;
        const nextPlayerTile = tileInfo[x]?.[playerNextY];
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

        //判断门
        if (
          ((doorX === x && doorY === playerNextY) ||
            (doorX === weaponNextX && doorY === weaponNextY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (
            (enemyX === x && enemyY === playerNextY) ||
            (enemyX === weaponNextX && enemyY === weaponNextY)
          ) {
            this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === x && burst.y === playerNextY) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
          return true;
        }
      }

      //按钮方向——向左
    } else if (type === CONTROLLER_ENUM.LEFT) {
      const playerNextX = x - 1;

      //玩家方向——向上
      if (direction === DIRECTION_ENUM.TOP) {
        //判断是否超出地图
        if (playerNextX < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT;

          return true;
        }

        const weaponNextX = x - 1;
        const weaponNextY = y - 1;
        const nextPlayerTile = tileInfo[playerNextX]?.[y];
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

        //判断门
        if (
          ((doorX === playerNextX && doorY === y) ||
            (doorX === weaponNextX && doorY === weaponNextY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (
            (enemyX === playerNextX && enemyY === y) ||
            (enemyX === weaponNextX && enemyY === weaponNextY)
          ) {
            this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === playerNextX && burst.y === y) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
          return true;
        }

        //玩家方向——向下
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        //判断是否超出地图
        if (playerNextX < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;

          return true;
        }

        const weaponNextX = x - 1;
        const weaponNextY = y + 1;
        const nextPlayerTile = tileInfo[playerNextX]?.[y];
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

        //判断门
        if (
          ((doorX === playerNextX && doorY === y) ||
            (doorX === weaponNextX && doorY === weaponNextY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (
            (enemyX === playerNextX && enemyY === y) ||
            (enemyX === weaponNextX && enemyY === weaponNextY)
          ) {
            this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === playerNextX && burst.y === y) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
          return true;
        }

        //玩家方向——向左
      } else if (direction === DIRECTION_ENUM.LEFT) {
        //判断是否超出地图
        if (playerNextX < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT;

          return true;
        }

        const weaponNextX = x - 2;
        const nextPlayerTile = tileInfo[playerNextX]?.[y];
        const nextWeaponTile = tileInfo[weaponNextX]?.[y];

        //判断门
        if (
          ((doorX === playerNextX && doorY === y) ||
            (doorX === weaponNextX && doorY === y)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (
            (enemyX === playerNextX && enemyY === y) ||
            (enemyX === weaponNextX && enemyY === y)
          ) {
            this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === playerNextX && burst.y === y) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
          return true;
        }

        //玩家方向——向右
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        //判断是否超出地图
        if (playerNextX < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK;

          return true;
        }

        const weaponNextX = x;
        const nextPlayerTile = tileInfo[playerNextX]?.[y];
        const nextWeaponTile = tileInfo[weaponNextX]?.[y];

        //判断门
        if (
          ((doorX === playerNextX && doorY === y) ||
            (doorX === weaponNextX && doorY === y)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (enemyX === playerNextX && enemyY === y) {
            this.state = ENTITY_STATE_ENUM.BLOCKBACK;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === playerNextX && burst.y === y) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK;
          return true;
        }
      }

      //按钮方向——向右
    } else if (type === CONTROLLER_ENUM.RIGHT) {
      const playerNextX = x + 1;

      //玩家方向——向上
      if (direction === DIRECTION_ENUM.TOP) {
        if (playerNextX > row - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;

          return true;
        }

        const weaponNextX = x + 1;
        const weaponNextY = y - 1;
        const nextPlayerTile = tileInfo[playerNextX]?.[y];
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

        //判断门
        if (
          ((doorX === playerNextX && doorY === y) ||
            (doorX === weaponNextX && doorY === weaponNextY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (
            (enemyX === playerNextX && enemyY === y) ||
            (enemyX === weaponNextX && enemyY === weaponNextY)
          ) {
            this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === playerNextX && burst.y === y) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
          return true;
        }

        //玩家方向——向下
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        if (playerNextX > row - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT;

          return true;
        }

        const weaponNextX = x + 1;
        const weaponNextY = y + 1;
        const nextPlayerTile = tileInfo[playerNextX]?.[y];
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

        //判断门
        if (
          ((doorX === playerNextX && doorY === y) ||
            (doorX === weaponNextX && doorY === weaponNextY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (
            (enemyX === playerNextX && enemyY === y) ||
            (enemyX === weaponNextX && enemyY === weaponNextY)
          ) {
            this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === playerNextX && burst.y === y) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
          return true;
        }

        //玩家方向——向左
      } else if (direction === DIRECTION_ENUM.LEFT) {
        if (playerNextX > row - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK;

          return true;
        }

        const weaponNextX = x;
        const nextPlayerTile = tileInfo[playerNextX]?.[y];
        const nextWeaponTile = tileInfo[weaponNextX]?.[y];

        //判断门
        if (
          ((doorX === playerNextX && doorY === y) ||
            (doorX === weaponNextX && doorY === y)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (enemyX === playerNextX && enemyY === y) {
            this.state = ENTITY_STATE_ENUM.BLOCKBACK;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === playerNextX && burst.y === y) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK;
          return true;
        }

        //玩家方向——向右
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        if (playerNextX > row - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT;

          return true;
        }

        const weaponNextX = x + 2;
        const nextPlayerTile = tileInfo[playerNextX]?.[y];
        const nextWeaponTile = tileInfo[weaponNextX]?.[y];

        //判断门
        if (
          ((doorX === playerNextX && doorY === y) ||
            (doorX === weaponNextX && doorY === y)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
        ) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
          return true;
        }

        //判断敌人
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          const { x: enemyX, y: enemyY } = enemy;

          if (
            (enemyX === playerNextX && enemyY === y) ||
            (enemyX === weaponNextX && enemyY === y)
          ) {
            this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
            return true;
          }
        }

        //判断地裂陷阱
        if (
          bursts.some((burst) => burst.x === playerNextX && burst.y === y) &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          return false;
        }

        //最后判断地图元素
        if (
          nextPlayerTile &&
          nextPlayerTile.moveable &&
          (!nextWeaponTile || nextWeaponTile.turnable)
        ) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
          return true;
        }
      }

      //按钮方向——左转
    } else if (type === CONTROLLER_ENUM.TURNLEFT) {
      let nextY: number = 0,
        nextX: number = 0;
      if (direction === DIRECTION_ENUM.TOP) {
        //朝上左转的话，左上角三个tile都必须turnable为true，并且没有敌人
        nextY = y - 1;
        nextX = x - 1;
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        nextY = y + 1;
        nextX = x + 1;
      } else if (direction === DIRECTION_ENUM.LEFT) {
        nextY = y + 1;
        nextX = x - 1;
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        nextY = y - 1;
        nextX = x + 1;
      }

      //判断门
      if (
        ((doorX === x && doorY === nextY) ||
          (doorX === nextX && doorY === y) ||
          (doorX === nextX && doorY === nextY)) &&
        doorState !== ENTITY_STATE_ENUM.DEATH
      ) {
        this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;
        return true;
      }

      //判断敌人
      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const { x: enemyX, y: enemyY } = enemy;

        if (enemyX === nextX && enemyY === y) {
          this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;

          return true;
        } else if (enemyX === nextX && enemyY === nextY) {
          this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;

          return true;
        } else if (enemyX === x && enemyY === nextY) {
          this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;

          return true;
        }
      }

      //最后判断地图元素
      if (
        (!tileInfo[x]?.[nextY] || tileInfo[x]?.[nextY!].turnable) &&
        (!tileInfo[nextX]?.[y] || tileInfo[nextX!]?.[y].turnable) &&
        (!tileInfo[nextX]?.[nextY] || tileInfo[nextX]?.[nextY].turnable)
      ) {
        // empty
      } else {
        this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;
        return true;
      }

      //按钮方向——右转
    } else if (type === CONTROLLER_ENUM.TURNRIGHT) {
      let nextX = 0,
        nextY = 0;
      if (direction === DIRECTION_ENUM.TOP) {
        //朝上右转的话，右上角三个tile都必须turnable为true
        nextY = y - 1;
        nextX = x + 1;
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        nextY = y + 1;
        nextX = x - 1;
      } else if (direction === DIRECTION_ENUM.LEFT) {
        nextY = y - 1;
        nextX = x - 1;
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        nextY = y + 1;
        nextX = x + 1;
      }

      //判断门
      if (
        ((doorX === x && doorY === nextY) ||
          (doorX === nextX && doorY === y) ||
          (doorX === nextX && doorY === nextY)) &&
        doorState !== ENTITY_STATE_ENUM.DEATH
      ) {
        this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;
        return true;
      }

      //判断敌人
      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const { x: enemyX, y: enemyY } = enemy;

        if (enemyX === nextX && enemyY === y) {
          this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;

          return true;
        } else if (enemyX === nextX && enemyY === nextY) {
          this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;

          return true;
        } else if (enemyX === x && enemyY === nextY) {
          this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;

          return true;
        }
      }

      //最后判断地图元素
      if (
        (!tileInfo[x]?.[nextY] || tileInfo[x]?.[nextY].turnable) &&
        (!tileInfo[nextX]?.[y] || tileInfo[nextX]?.[y].turnable) &&
        (!tileInfo[nextX]?.[nextY] || tileInfo[nextX]?.[nextY].turnable)
      ) {
        // empty
      } else {
        this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;
        return true;
      }
    }

    return false;
  };
}
