import DirectionSubStateMachine from "@/base/DirectionSubStateMachine";
import State from "@/base/State";
import StateMachine from "@/base/StateMachine";
import { DIRECTION_ENUM } from "@/utils/enums";
import { SpriteAnimation } from "@eva/plugin-renderer-sprite-animation";

export default class BlockTurnRightSubStateMachine extends DirectionSubStateMachine {
  constructor(fsm: StateMachine, spriteAnimation: SpriteAnimation) {
    super(fsm);

    this.stateMachines.set(
      DIRECTION_ENUM.TOP,
      new State(spriteAnimation, "player_block_turn_right_top", 1)
    );
    this.stateMachines.set(
      DIRECTION_ENUM.BOTTOM,
      new State(spriteAnimation, "player_block_turn_right_bottom", 1)
    );
    this.stateMachines.set(
      DIRECTION_ENUM.LEFT,
      new State(spriteAnimation, "player_block_turn_right_left", 1)
    );
    this.stateMachines.set(
      DIRECTION_ENUM.RIGHT,
      new State(spriteAnimation, "player_block_turn_right_right", 1)
    );
  }
}
