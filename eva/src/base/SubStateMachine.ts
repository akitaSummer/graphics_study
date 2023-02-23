import PlayerStateMachine from "@/scenes/Battle/GameObjects/Player/Script/stateMechine";
import State from "./State";
import StateMachine from "./StateMachine";

export default abstract class SubStateMachine {
  private _currentState?: State;
  stateMachines: Map<string, State> = new Map();

  constructor(public fsm: StateMachine) {}

  // 当前状态
  get currentState() {
    return this._currentState;
  }

  // 设置状态并运行
  set currentState(state) {
    this._currentState = state;
    this._currentState?.run();
  }

  abstract run: () => void;
}
