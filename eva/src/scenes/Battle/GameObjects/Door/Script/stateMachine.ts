import { ANIMATION_SPEED } from "@/base/State";
import StateMachine, {
  getInitParamsNumber,
  getInitParamsTrigger,
} from "@/base/StateMachine";
import { PARAMS_NAME_ENUM } from "@/utils/enums";
import { SpriteAnimation } from "@eva/plugin-renderer-sprite-animation";
import DeathSubStateMachine from "./deathSubStateMachine";
import IdleSubStateMachine from "./idleSubStateMachine";
export default class DoorStateMachine extends StateMachine {
  static componentName = "DoorStateMachine"; // 设置组件的名字

  init = () => {
    this.gameObject.addComponent(
      new SpriteAnimation({
        resource: "",
        autoPlay: false,
        forwards: true,
        speed: ANIMATION_SPEED,
      })
    );

    this.initParams();
    this.initStateMachines();
  };

  initParams = () => {
    this.params.set(PARAMS_NAME_ENUM.IDLE, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.DEATH, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.DIRECTION, getInitParamsNumber());
  };

  initStateMachines = () => {
    // @ts-ignore
    const spriteAnimation = this.gameObject.getComponent(SpriteAnimation);
    this.stateMachines.set(
      PARAMS_NAME_ENUM.IDLE,
      new IdleSubStateMachine(this, spriteAnimation)
    );
    this.stateMachines.set(
      PARAMS_NAME_ENUM.DEATH,
      new DeathSubStateMachine(this, spriteAnimation)
    );
  };

  run = () => {
    switch (this.currentState) {
      case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
        if (this.params.get(PARAMS_NAME_ENUM.DEATH)!.value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.DEATH);
        } else {
          this.currentState = this.currentState;
        }
        break;
      case this.stateMachines.get(PARAMS_NAME_ENUM.DEATH):
        if (this.params.get(PARAMS_NAME_ENUM.IDLE)!.value) {
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
