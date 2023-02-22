import DirectionSubStateMachine from "@/base/DirectionSubStateMachine";
import State from "@/base/State";
import { DIRECTION_ENUM } from "@/utils/enums";
import { SpriteAnimation } from "@eva/plugin-renderer-sprite-animation";
import PlayerStateMachine from "./stateMechine";

export default class IdleSubStateMachine extends DirectionSubStateMachine {
  constructor(fsm: PlayerStateMachine, spriteAnimation: SpriteAnimation) {
    super(fsm);

    this.stateMachines.set(
      DIRECTION_ENUM.TOP,
      new State(spriteAnimation, "player_idle_top")
    );

    this.stateMachines.set(
      DIRECTION_ENUM.BOTTOM,
      new State(spriteAnimation, "player_idle_bottom")
    );
    this.stateMachines.set(
      DIRECTION_ENUM.LEFT,
      new State(spriteAnimation, "player_idle_left")
    );

    this.stateMachines.set(
      DIRECTION_ENUM.RIGHT,
      new State(spriteAnimation, "player_idle_right")
    );
  }
}
