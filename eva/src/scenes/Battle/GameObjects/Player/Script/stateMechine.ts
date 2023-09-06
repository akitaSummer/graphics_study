import { ANIMATION_SPEED } from "@/base/State";
import StateMachine, {
  getInitParamsNumber,
  getInitParamsTrigger,
  IParams,
} from "@/base/StateMachine";
import EventManager from "@/runtime/EventManager";
import {
  ENTITY_STATE_ENUM,
  EVENT_ENUM,
  FSM_PARAM_TYPE_ENUM,
  PARAMS_NAME_ENUM,
  SHAKE_TYPE_ENUM,
} from "@/utils/enums";
import { SpriteAnimation } from "@eva/plugin-renderer-sprite-animation";
import AirDeathSubStateMachine from "./airDeathSubStateMachine";
import AttackSubStateMachine from "./attackSubStateMachine";
import BlockBackSubStateMachine from "./blockBackSubStateMachine";
import BlockFrontSubStateMachine from "./blockFrontSubStateMachine";
import BlockLeftSubStateMachine from "./blockLeftSubStateMachine";
import BlockRightSubStateMachine from "./blockRightSubStateMachine";
import BlockTurnLeftSubStateMachine from "./blockTurnLeftSubStateMachine";
import BlockTurnRightSubStateMachine from "./blockTurnRightSubStateMachine";
import DeathSubStateMachine from "./deathSubStateMachine";
import IdleSubStateMachine from "./idleSubStateMachine";
import PlayerManager from "./manager";
import TurnLeftSubStateMachine from "./turnLeftSubStateMachine";
import TurnRightSubStateMachine from "./turnRightSubStateMachine";

export default class PlayerStateMachine extends StateMachine {
  static componentName: string = "PlayerStateMachine";

  init = () => {
    this.gameObject.addComponent(
      new SpriteAnimation({
        resource: "",
        speed: ANIMATION_SPEED,
        forwards: true,
        autoPlay: false,
      })
    );
    this.initParams();
    this.initStateMachine();
    this.initAnimationEvent();
  };

  // 初始化参数
  initParams = () => {
    this.params.set(PARAMS_NAME_ENUM.IDLE, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.ATTACK, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.TURNLEFT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.TURNRIGHT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.BLOCKFRONT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.BLOCKBACK, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.BLOCKLEFT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.BLOCKRIGHT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.BLOCKTURNLEFT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.BLOCKTURNRIGHT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.DEATH, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.AIRDEATH, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.DIRECTION, getInitParamsNumber());
  };

  // 初始化状态机
  initStateMachine = () => {
    // @ts-ignore

    const spriteAnimation = this.gameObject.getComponent(SpriteAnimation);
    this.stateMachines.set(
      PARAMS_NAME_ENUM.IDLE,
      new IdleSubStateMachine(this, spriteAnimation)
    );
    this.stateMachines.set(
      PARAMS_NAME_ENUM.ATTACK,
      new AttackSubStateMachine(this, spriteAnimation)
    );
    this.stateMachines.set(
      PARAMS_NAME_ENUM.TURNLEFT,
      new TurnLeftSubStateMachine(this, spriteAnimation)
    );
    this.stateMachines.set(
      PARAMS_NAME_ENUM.TURNRIGHT,
      new TurnRightSubStateMachine(this, spriteAnimation)
    );
    this.stateMachines.set(
      PARAMS_NAME_ENUM.BLOCKFRONT,
      new BlockFrontSubStateMachine(this, spriteAnimation)
    );
    this.stateMachines.set(
      PARAMS_NAME_ENUM.BLOCKBACK,
      new BlockBackSubStateMachine(this, spriteAnimation)
    );
    this.stateMachines.set(
      PARAMS_NAME_ENUM.BLOCKLEFT,
      new BlockLeftSubStateMachine(this, spriteAnimation)
    );
    this.stateMachines.set(
      PARAMS_NAME_ENUM.BLOCKRIGHT,
      new BlockRightSubStateMachine(this, spriteAnimation)
    );
    this.stateMachines.set(
      PARAMS_NAME_ENUM.BLOCKTURNLEFT,
      new BlockTurnLeftSubStateMachine(this, spriteAnimation)
    );
    this.stateMachines.set(
      PARAMS_NAME_ENUM.BLOCKTURNRIGHT,
      new BlockTurnRightSubStateMachine(this, spriteAnimation)
    );
    this.stateMachines.set(
      PARAMS_NAME_ENUM.DEATH,
      new DeathSubStateMachine(this, spriteAnimation)
    );
    this.stateMachines.set(
      PARAMS_NAME_ENUM.AIRDEATH,
      new AirDeathSubStateMachine(this, spriteAnimation)
    );
  };

  // 初始化动画事件
  initAnimationEvent = () => {
    // @ts-ignore
    const spriteAnimation = this.gameObject.getComponent(SpriteAnimation);
    spriteAnimation.on("complete", () => {
      if (!this.gameObject || !this.gameObject.getComponent(PlayerManager)) {
        return;
      }
      const list = ["player_turn", "player_block", "player_attack"];
      if (list.some((item) => spriteAnimation.resource.startsWith(item))) {
        this.gameObject.getComponent(PlayerManager).state =
          ENTITY_STATE_ENUM.IDLE;
      }
    });

    spriteAnimation.on("frameChange", () => {
      //攻击动画第五帧的时候震动屏幕
      if (
        spriteAnimation.resource.startsWith("player_attack") &&
        spriteAnimation.currentFrame === 4
      ) {
        switch (spriteAnimation.resource) {
          case "player_attack_top":
            EventManager.Instance.emit(
              EVENT_ENUM.SCREEN_SHAKE,
              SHAKE_TYPE_ENUM.TOP
            );
            break;
          case "player_attack_bottom":
            EventManager.Instance.emit(
              EVENT_ENUM.SCREEN_SHAKE,
              SHAKE_TYPE_ENUM.BOTTOM
            );
            break;
          case "player_attack_left":
            EventManager.Instance.emit(
              EVENT_ENUM.SCREEN_SHAKE,
              SHAKE_TYPE_ENUM.LEFT
            );
            break;
          case "player_attack_right":
            EventManager.Instance.emit(
              EVENT_ENUM.SCREEN_SHAKE,
              SHAKE_TYPE_ENUM.RIGHT
            );
            break;
          default:
            break;
        }
      }
    });
  };

  // 运行状态变化
  run = () => {
    switch (this.currentState) {
      case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
      case this.stateMachines.get(PARAMS_NAME_ENUM.ATTACK):
      case this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.TURNRIGHT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKTURNLEFT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKTURNRIGHT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKFRONT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKBACK):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKLEFT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKRIGHT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.DEATH):
      case this.stateMachines.get(PARAMS_NAME_ENUM.AIRDEATH):
        if (this.params.get(PARAMS_NAME_ENUM.DEATH)!.value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.DEATH);
        } else if (this.params.get(PARAMS_NAME_ENUM.AIRDEATH)!.value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.AIRDEATH);
        } else if (this.params.get(PARAMS_NAME_ENUM.TURNLEFT)!.value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT);
        } else if (this.params.get(PARAMS_NAME_ENUM.TURNRIGHT)!.value) {
          this.currentState = this.stateMachines.get(
            PARAMS_NAME_ENUM.TURNRIGHT
          );
        } else if (this.params.get(PARAMS_NAME_ENUM.BLOCKFRONT)!.value) {
          this.currentState = this.stateMachines.get(
            PARAMS_NAME_ENUM.BLOCKFRONT
          );
        } else if (this.params.get(PARAMS_NAME_ENUM.BLOCKBACK)!.value) {
          this.currentState = this.stateMachines.get(
            PARAMS_NAME_ENUM.BLOCKBACK
          );
        } else if (this.params.get(PARAMS_NAME_ENUM.BLOCKLEFT)!.value) {
          this.currentState = this.stateMachines.get(
            PARAMS_NAME_ENUM.BLOCKLEFT
          );
        } else if (this.params.get(PARAMS_NAME_ENUM.BLOCKRIGHT)!.value) {
          this.currentState = this.stateMachines.get(
            PARAMS_NAME_ENUM.BLOCKRIGHT
          );
        } else if (this.params.get(PARAMS_NAME_ENUM.BLOCKTURNLEFT)!.value) {
          this.currentState = this.stateMachines.get(
            PARAMS_NAME_ENUM.BLOCKTURNLEFT
          );
        } else if (this.params.get(PARAMS_NAME_ENUM.BLOCKTURNRIGHT)!.value) {
          this.currentState = this.stateMachines.get(
            PARAMS_NAME_ENUM.BLOCKTURNRIGHT
          );
        } else if (this.params.get(PARAMS_NAME_ENUM.ATTACK)!.value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.ATTACK);
        } else if (this.params.get(PARAMS_NAME_ENUM.IDLE)!.value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE);
        } else {
          this.currentState = this.currentState;
        }
        break;
      default:
        this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE);
        break;
    }
  };
}