import { ANIMATION_SPEED } from "@/base/State";
import StateMachine, {
  getInitParamsNumber,
  getInitParamsTrigger,
  IParams,
} from "@/base/StateMachine";
import { FSM_PARAM_TYPE_ENUM, PARAMS_NAME_ENUM } from "@/utils/enums";
import { SpriteAnimation } from "@eva/plugin-renderer-sprite-animation";
import IdleSubStateMachine from "./idleSubStateMachine";
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
    this.params.set(PARAMS_NAME_ENUM.TURNLEFT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.TURNRIGHT, getInitParamsTrigger());
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
      PARAMS_NAME_ENUM.TURNLEFT,
      new TurnLeftSubStateMachine(this, spriteAnimation)
    );
    this.stateMachines.set(
      PARAMS_NAME_ENUM.TURNRIGHT,
      new TurnRightSubStateMachine(this, spriteAnimation)
    );
  };

  // 初始化动画事件
  initAnimationEvent = () => {
    // @ts-ignore
    const spriteAnimation = this.gameObject.getComponent(SpriteAnimation);
    spriteAnimation.on("complete", () => {
      const list = ["player_turn"];
      if (list.some((i) => spriteAnimation.resource.startsWith(i))) {
        this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE);
      }
    });
  };

  // 运行状态变化
  run = () => {
    switch (this.currentState) {
      case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
      case this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.TURNRIGHT):
        {
          if (this.params.get(PARAMS_NAME_ENUM.TURNLEFT)?.value) {
            this.currentState = this.stateMachines.get(
              PARAMS_NAME_ENUM.TURNLEFT
            );
          } else if (this.params.get(PARAMS_NAME_ENUM.TURNRIGHT)?.value) {
            this.currentState = this.stateMachines.get(
              PARAMS_NAME_ENUM.TURNRIGHT
            );
          } else if (this.params.get(PARAMS_NAME_ENUM.IDLE)?.value) {
            this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE);
          } else {
            this.currentState = this.currentState;
          }
        }
        break;
      default:
        this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE);
        break;
    }
  };
}
